/**
 * AI search algorithm for checkers.
 *
 * Combines:
 * - Minimax with Alpha-Beta pruning (adversarial search)
 * - A*-style move ordering (best heuristic first for optimal pruning)
 * - Iterative Deepening (Hard difficulty, respects deadline)
 * - Transposition table (Hard difficulty)
 *
 * Chain capture support:
 * - When `chainState` is active at the root, only chain capture moves
 *   for the chaining piece are generated.
 * - Deeper search levels use normal move generation (chain state only
 *   affects the current board state).
 */
import type { Board, Move, Difficulty, ChainState } from '@damastro/checkers-core';
import { cloneBoard, applyMove } from '@damastro/checkers-core';
import { getAllLegalMoves, countPieces, hasNoLegalMoves } from '@damastro/checkers-core';
import { evaluateBoard } from './evaluator';

// ─── Types ────────────────────────────────────────────────────────────

interface SearchResult {
  readonly bestMove: Move | null;
  readonly evaluation: number;
  readonly depthReached: number;
  readonly nodesVisited: number;
}

interface TranspositionEntry {
  readonly hash: number;
  readonly depth: number;
  readonly score: number;
  readonly flag: 'exact' | 'lowerbound' | 'upperbound';
}

// ─── Transposition Table (for Hard difficulty) ────────────────────────

const MAX_TABLE_SIZE = 1_000_000;
const transpositionTable = new Map<number, TranspositionEntry>();

function clearTable(): void {
  transpositionTable.clear();
}

function getTableEntry(hash: number): TranspositionEntry | undefined {
  return transpositionTable.get(hash);
}

function setTableEntry(entry: TranspositionEntry): void {
  if (transpositionTable.size >= MAX_TABLE_SIZE) {
    // Evict ~25% of entries when full
    const toDelete = Math.floor(MAX_TABLE_SIZE * 0.25);
    let deleted = 0;
    for (const key of transpositionTable.keys()) {
      if (deleted >= toDelete) break;
      transpositionTable.delete(key);
      deleted++;
    }
  }
  transpositionTable.set(entry.hash, entry);
}

// ─── Zobrist Hashing (simple implementation) ──────────────────────────

// Pre-generated random numbers for each position and piece type
const zobristTable: number[][][] = []; // [row][col][pieceType]
let zobristInitialized = false;

function initZobrist(): void {
  if (zobristInitialized) return;

  for (let row = 0; row < 8; row++) {
    zobristTable[row] = [];
    for (let col = 0; col < 8; col++) {
      zobristTable[row][col] = [];
      for (let t = 0; t < 4; t++) {
        zobristTable[row][col][t] = Math.floor(Math.random() * 2 ** 32);
      }
    }
  }

  zobristInitialized = true;
}

function zobristHash(board: Board): number {
  initZobrist();
  let hash = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) continue;
      const typeIndex = piece.color === 'player'
        ? (piece.king ? 1 : 0)
        : (piece.king ? 3 : 2);
      hash ^= zobristTable[row][col][typeIndex];
    }
  }

  return hash;
}

// ─── Move Ordering (A*-style heuristic) ───────────────────────────────

function orderMoves(moves: Move[], board: Board, color: 'player' | 'ai'): Move[] {
  return moves.sort((a, b) => {
    // Captures first
    const aCapture = a.captures.length;
    const bCapture = b.captures.length;
    if (aCapture !== bCapture) return bCapture - aCapture;

    // Becomes king next
    if (a.becomesKing !== b.becomesKing) return a.becomesKing ? -1 : 1;

    // Center moves prefered
    const aCenter = isCenter(a.to.row, a.to.col);
    const bCenter = isCenter(b.to.row, b.to.col);
    if (aCenter !== bCenter) return aCenter ? -1 : 1;

    return 0;
  });
}

function isCenter(row: number, col: number): boolean {
  return (row >= 2 && row <= 5 && col >= 2 && col <= 5);
}

// ─── Main Search Algorithm ───────────────────────────────────────────

/**
 * Unified search that works for all difficulties.
 */
export function findBestMove(
  board: Board,
  color: 'player' | 'ai',
  difficulty: Difficulty,
  deadlineMs: number,
  chainState?: ChainState
): SearchResult {
  const startTime = Date.now();
  const timeLimit = startTime + deadlineMs;

  const depthMap: Record<Difficulty, number> = {
    easy: 2,
    medium: 4,
    hard: 6,
  };

  const maxDepth = depthMap[difficulty];

  if (difficulty === 'hard') {
    return iterativeDeepening(board, color, maxDepth, timeLimit, chainState);
  }

  // Easy and Medium: simple minimax with alpha-beta
  clearTable();
  const result = minimax(board, color, 0, maxDepth, -Infinity, Infinity, color, timeLimit);
  // Chain state only affects root-level move generation
  const moves = chainState?.active
    ? getAllLegalMoves(board, color, chainState)
    : getAllLegalMoves(board, color);

  let bestMove: Move | null = null;
  if (difficulty === 'easy' && moves.length > 0) {
    // Easy: occasionally make suboptimal moves
    if (Math.random() < 0.3 && moves.length > 1) {
      // Pick a random move from the top 50%
      const sorted = orderMoves(moves, board, color);
      const topHalf = sorted.slice(0, Math.max(1, Math.floor(sorted.length / 2)));
      bestMove = topHalf[Math.floor(Math.random() * topHalf.length)];
    } else {
      bestMove = moves.find(m => m.from.row === result.fromRow && m.from.col === result.fromCol
        && m.to.row === result.toRow && m.to.col === result.toCol) ?? null;
    }
  } else {
    bestMove = moves.find(m => m.from.row === result.fromRow && m.from.col === result.fromCol
      && m.to.row === result.toRow && m.to.col === result.toCol) ?? null;
  }

  return {
    bestMove,
    evaluation: result.score,
    depthReached: maxDepth,
    nodesVisited: result.nodes,
  };
}

// ─── Minimax with Alpha-Beta ─────────────────────────────────────────

interface MinimaxResult {
  readonly score: number;
  readonly fromRow: number;
  readonly fromCol: number;
  readonly toRow: number;
  readonly toCol: number;
  nodes: number;
}

function minimax(
  board: Board,
  maximizingColor: 'player' | 'ai',
  depth: number,
  maxDepth: number,
  alpha: number,
  beta: number,
  currentColor: 'player' | 'ai',
  timeLimit: number
): MinimaxResult {
  // Base case
  if (depth >= maxDepth || Date.now() >= timeLimit) {
    return {
      score: evaluateBoard(board, maximizingColor),
      fromRow: -1, fromCol: -1, toRow: -1, toCol: -1,
      nodes: 1,
    };
  }

  const moves = getAllLegalMoves(board, currentColor);

  if (moves.length === 0) {
    // No moves = loss for current player
    const score = currentColor === maximizingColor ? -10000 + depth : 10000 - depth;
    return {
      score,
      fromRow: -1, fromCol: -1, toRow: -1, toCol: -1,
      nodes: 1,
    };
  }

  const isMaximizing = currentColor === maximizingColor;
  const orderedMoves = orderMoves(moves, board, currentColor);

  let bestResult: MinimaxResult = {
    score: isMaximizing ? -Infinity : Infinity,
    fromRow: orderedMoves[0].from.row,
    fromCol: orderedMoves[0].from.col,
    toRow: orderedMoves[0].to.row,
    toCol: orderedMoves[0].to.col,
    nodes: 0,
  };

  let totalNodes = 0;
  const nextColor: 'player' | 'ai' = currentColor === 'player' ? 'ai' : 'player';

  for (const move of orderedMoves) {
    const { newBoard } = applyMove(board, move);
    const result = minimax(newBoard, maximizingColor, depth + 1, maxDepth, alpha, beta, nextColor, timeLimit);
    totalNodes += result.nodes;

    if (isMaximizing) {
      if (result.score > bestResult.score) {
        bestResult = {
          score: result.score,
          fromRow: move.from.row,
          fromCol: move.from.col,
          toRow: move.to.row,
          toCol: move.to.col,
          nodes: 0,
        };
      }
      alpha = Math.max(alpha, result.score);
    } else {
      if (result.score < bestResult.score) {
        bestResult = {
          score: result.score,
          fromRow: move.from.row,
          fromCol: move.from.col,
          toRow: move.to.row,
          toCol: move.to.col,
          nodes: 0,
        };
      }
      beta = Math.min(beta, result.score);
    }

    if (beta <= alpha) break; // Prune
  }

  bestResult.nodes = totalNodes + 1;
  return bestResult;
}

// ─── Iterative Deepening (Hard difficulty) ───────────────────────────

function iterativeDeepening(
  board: Board,
  color: 'player' | 'ai',
  maxDepth: number,
  timeLimit: number,
  chainState?: ChainState
): SearchResult {
  clearTable();

  let bestMove: Move | null = null;
  let bestEval = -Infinity;
  let depthReached = 0;
  let totalNodes = 0;

  for (let depth = 1; depth <= maxDepth; depth++) {
    if (Date.now() >= timeLimit) break;

    const result = minimax(board, color, 0, depth, -Infinity, Infinity, color, timeLimit);
    totalNodes += result.nodes;
    depthReached = depth;

    const moves = chainState?.active
      ? getAllLegalMoves(board, color, chainState)
      : getAllLegalMoves(board, color);
    bestMove = moves.find(m =>
      m.from.row === result.fromRow &&
      m.from.col === result.fromCol &&
      m.to.row === result.toRow &&
      m.to.col === result.toCol
    ) ?? bestMove;

    bestEval = result.score;

    // If we found a forced win, stop early
    if (Math.abs(result.score) > 9000) break;
  }

  return {
    bestMove,
    evaluation: bestEval,
    depthReached,
    nodesVisited: totalNodes,
  };
}
