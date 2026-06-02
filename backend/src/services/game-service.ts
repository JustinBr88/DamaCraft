/**
 * Game service — orchestrates game logic, persistence, and AI communication.
 *
 * AI FAILURE MODE CONTRACT
 * ────────────────────────
 * When `getAiMove()` returns a failure result, the `status` discriminator
 * tells us how to react:
 *
 *   `no_moves`    → AI has no legal moves but the game does NOT end
 *                    for that reason. Treated as an availability issue —
 *                    the player's move IS applied and saved, the game
 *                    stays `active`, and `aiError` is set so the API
 *                    layer can inform the frontend.
 *
 *   `timeout`     → Infrastructure failure (AI timed out).
 *   `unavailable` → Infrastructure failure (AI unreachable / HTTP error).
 *                    In both cases the player's move IS applied and saved,
 *                    the game stays `active`, and `aiError` is set so the
 *                    API layer can return 503 to the frontend.
 *
 * CHAIN CAPTURE CONTRACT
 * ──────────────────────
 * 1. Player makes a move → backend applies it → checks chain state
 * 2. If chain active → save with chainState, return to frontend (NO AI call)
 * 3. If no chain → enter AI loop
 * 4. AI loop: call AI → apply move → check chain → loop if still active
 * 5. AI coronation ends chain immediately (pieceBecameKing)
 * 6. When AI chain resolved → switch turn to player, return response
 */
import type { Board, Cell, Difficulty, GameStatus, Move, ChainState } from '@damastro/checkers-core';
import {
  createInitialBoard,
  applyMove,
  getAllLegalMoves,
  evaluateGameStatus,
  getNextChainState,
  countPieces,
} from '@damastro/checkers-core';
import { Game, type IGame } from '../models/Game.js';
import { getAiMove } from '../lib/ai-client.js';

// ─── Types ────────────────────────────────────────────────────────────

export interface GameActionResult {
  success: boolean;
  game?: IGame;
  error?: string;
  /** Game-over status (e.g. `'player_wins'`, `'draw'`). */
  status?: GameStatus;
  /** Player's move that was just applied — useful for frontend animations. */
  playerMove?: Move | null;
  aiMove?: Move | null;
  aiTimeMs?: number;
  /**
   * Set when the player's move was applied BUT the AI service was
   * unavailable / timed out. The game remains `active` (not finished)
   * and the frontend should display this error.
   */
  aiError?: string;
  /** Chain capture state — active when the player must make another capture. */
  chainState?: ChainState;
}

// ─── Start New Game ───────────────────────────────────────────────────

export async function startNewGame(
  userId: string,
  difficulty: Difficulty
): Promise<IGame> {
  const board = createInitialBoard();

  const game = await Game.create({
    userId,
    difficulty,
    status: 'active',
    winner: null,
    gameData: {
      board,
      currentTurn: 'player',
      moveHistory: [],
      chainState: { active: false, piece: null },
    },
    stats: {
      totalMoves: 0,
      playerCaptures: 0,
      aiCaptures: 0,
      durationSeconds: 0,
    },
  });

  return game;
}

// ─── Make a Move ──────────────────────────────────────────────────────

export async function makePlayerMove(
  gameId: string,
  userId: string,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): Promise<GameActionResult> {
  // 1. Fetch game
  const game = await Game.findById(gameId);
  if (!game) {
    return { success: false, error: 'Game not found' };
  }

  // 2. Verify ownership
  if (game.userId.toString() !== userId) {
    return { success: false, error: 'Not your game' };
  }

  // 3. Verify game is active
  if (game.status !== 'active') {
    return { success: false, error: 'Game is already finished' };
  }

  // 4. Verify it's player's turn
  if (game.gameData.currentTurn !== 'player') {
    return { success: false, error: 'Not your turn' };
  }

  // 5. Find the requested move (respecting chain state if active)
  const board = game.gameData.board as Board;
  const existingChainState: ChainState = game.gameData.chainState ?? { active: false, piece: null };

  // If chain state is active, restrict moves to the chaining piece's captures
  const allMoves = getAllLegalMoves(board, 'player', existingChainState.active ? existingChainState : undefined);
  const requestedMove = allMoves.find(
    (m) => m.from.row === fromRow && m.from.col === fromCol && m.to.row === toRow && m.to.col === toCol
  );

  if (!requestedMove) {
    return { success: false, error: 'Invalid move' };
  }

  // 6. Apply player move — new applyMove returns { newBoard, pieceBecameKing }
  const { newBoard, pieceBecameKing: _playerBecameKing } = applyMove(board, requestedMove);

  // 7. Record the move
  const moveRecord = {
    actor: 'player' as const,
    fromRow,
    fromCol,
    toRow,
    toCol,
    captures: requestedMove.captures.map((c) => ({ row: c.row, col: c.col })),
    becomesKing: requestedMove.becomesKing,
    timestamp: new Date(),
  };

  // 8. Update capture count
  const playerCaptures = game.stats.playerCaptures + requestedMove.captures.length;

  // 9. Check game status after player's move — only piece count now
  const status: GameStatus = evaluateGameStatus(newBoard);

  if (status !== 'active') {
    return await finishGame(game, newBoard, requestedMove, playerCaptures, status);
  }

  // 10. Check chain state for player
  const nextChainState = getNextChainState(newBoard, requestedMove, 'player');

  if (nextChainState.active) {
    // Chain active — save game, keep player's turn, do NOT call AI
    game.gameData.board = newBoard as Cell[][];
    game.gameData.currentTurn = 'player';
    game.gameData.chainState = nextChainState;
    game.gameData.moveHistory.push(moveRecord);
    game.stats.totalMoves = game.gameData.moveHistory.length;
    game.stats.playerCaptures = playerCaptures;
await game.save();

    return {
      success: true,
      game,
      status: 'active',
      playerMove: requestedMove,
    };
  }

  // 11. No chain — proceed to AI turn (clear any lingering chain state)
  game.gameData.board = newBoard as Cell[][];
  game.gameData.currentTurn = 'ai';
  game.gameData.chainState = { active: false, piece: null };

  // ─── AI chain loop ─────────────────────────────────────────────────
  // AI makes ONE move per iteration. If AI can chain, loop continues.
  let currentBoard = newBoard;
  let currentAiChainState: ChainState | null = null;
  let totalAiTimeMs = 0;
  let currentAiCaptures = game.stats.aiCaptures;
  const aiMoveRecords: Array<{
    actor: 'player' | 'ai';
    fromRow: number; fromCol: number; toRow: number; toCol: number;
    captures: { row: number; col: number }[];
    becomesKing: boolean;
    timestamp: Date;
  }> = [];

  while (true) {
    const aiResult = await getAiMove(
      currentBoard,
      'ai',
      game.difficulty as Difficulty,
      currentAiChainState ?? undefined
    );

    // ── Handle AI failure according to status discriminator ──────────
    if (!aiResult.success) {
      // Save player's move + any accumulated AI moves, keep game active
      game.gameData.board = currentBoard as Cell[][];
      game.gameData.currentTurn = 'ai';
      game.gameData.chainState = currentAiChainState ?? { active: false, piece: null };
      game.gameData.moveHistory.push(moveRecord, ...aiMoveRecords);
      game.stats.totalMoves = game.gameData.moveHistory.length;
      game.stats.playerCaptures = playerCaptures;
      game.stats.aiCaptures = currentAiCaptures;
      await game.save();

      return {
        success: true,
        game,
        status: 'active',
        aiError: aiResult.error || 'AI service unavailable',
      };
    }

    // Guard: AI responded successfully but without a move
    if (!aiResult.move) {
      return {
        success: false,
        error: 'AI returned success without a move — unexpected',
      };
    }

    // 12. Apply AI move
    const { newBoard: boardAfterAi, pieceBecameKing: aiPieceBecameKing } = applyMove(currentBoard, aiResult.move);

    const aiMoveRecord = {
      actor: 'ai' as const,
      fromRow: aiResult.move.from.row,
      fromCol: aiResult.move.from.col,
      toRow: aiResult.move.to.row,
      toCol: aiResult.move.to.col,
      captures: aiResult.move.captures.map((c) => ({ row: c.row, col: c.col })),
      becomesKing: aiResult.move.becomesKing,
      timestamp: new Date(),
    };

    aiMoveRecords.push(aiMoveRecord);
    totalAiTimeMs += aiResult.timeMs ?? 0;
    currentAiCaptures += aiResult.move.captures.length;

    // 13. Check game status after AI move
    const aiStatus = evaluateGameStatus(boardAfterAi);

    if (aiStatus !== 'active') {
      // Game over — AI wins or draw
      game.gameData.board = boardAfterAi as Cell[][];
      game.gameData.currentTurn = 'player';
      game.gameData.chainState = { active: false, piece: null };
      game.gameData.moveHistory.push(moveRecord, ...aiMoveRecords);
      game.stats.totalMoves = game.gameData.moveHistory.length;
      game.stats.playerCaptures = playerCaptures;
      game.stats.aiCaptures = currentAiCaptures;
      game.status = 'finished';
      game.winner = aiStatus === 'player_wins' ? 'player' : aiStatus === 'ai_wins' ? 'ai' : null;
      await game.save();

      return {
        success: true,
        game,
        status: aiStatus,
        playerMove: requestedMove,
        aiMove: aiResult.move,
        aiTimeMs: totalAiTimeMs,
      };
    }

    // 14. AI became king → chain ends immediately, switch to player
    if (aiPieceBecameKing) {
      game.gameData.board = boardAfterAi as Cell[][];
      game.gameData.currentTurn = 'player';
      game.gameData.chainState = { active: false, piece: null };
      game.gameData.moveHistory.push(moveRecord, ...aiMoveRecords);
      game.stats.totalMoves = game.gameData.moveHistory.length;
      game.stats.playerCaptures = playerCaptures;
      game.stats.aiCaptures = currentAiCaptures;
      await game.save();

      return {
        success: true,
        game,
        status: 'active',
        playerMove: requestedMove,
        aiMove: aiResult.move,
        aiTimeMs: totalAiTimeMs,
      };
    }

    // 15. Check chain state for AI
    const aiChainState = getNextChainState(boardAfterAi, aiResult.move, 'ai');

    if (!aiChainState.active) {
      // No more chain — switch to player
      game.gameData.board = boardAfterAi as Cell[][];
      game.gameData.currentTurn = 'player';
      game.gameData.chainState = { active: false, piece: null };
      game.gameData.moveHistory.push(moveRecord, ...aiMoveRecords);
      game.stats.totalMoves = game.gameData.moveHistory.length;
      game.stats.playerCaptures = playerCaptures;
      game.stats.aiCaptures = currentAiCaptures;
      await game.save();

      return {
        success: true,
        game,
        status: 'active',
        playerMove: requestedMove,
        aiMove: aiResult.move,
        aiTimeMs: totalAiTimeMs,
      };
    }

    // 16. Chain still active — continue AI loop
    currentBoard = boardAfterAi;
    currentAiChainState = aiChainState;
  }
}

// ─── Finish Game ──────────────────────────────────────────────────────

async function finishGame(
  game: IGame,
  board: Board,
  lastMove: Move,
  playerCaptures: number,
  status: GameStatus
): Promise<GameActionResult> {
  game.gameData.board = board as Cell[][];
  game.gameData.currentTurn = 'ai';
  game.gameData.chainState = { active: false, piece: null };

  // Convert Move to IMoveRecord with flat field names
  const moveRecord = {
    actor: 'player' as const,
    fromRow: lastMove.from.row,
    fromCol: lastMove.from.col,
    toRow: lastMove.to.row,
    toCol: lastMove.to.col,
    captures: lastMove.captures.map((c: { row: number; col: number }) => ({ row: c.row, col: c.col })),
    becomesKing: lastMove.becomesKing,
    timestamp: new Date(),
  };

  game.gameData.moveHistory.push(moveRecord);
  game.status = 'finished';
  game.winner = status === 'player_wins' ? 'player' : status === 'ai_wins' ? 'ai' : null;
  game.stats.totalMoves = game.gameData.moveHistory.length;
  game.stats.playerCaptures = playerCaptures;

  await game.save();

  return {
    success: true,
    game,
    status,
    playerMove: lastMove,
  };
}
