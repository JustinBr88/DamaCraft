import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import type { Board, Cell, ChainState, Difficulty, Move } from '@damastro/checkers-core';
import { createInitialBoard, getAllLegalMoves, opponent } from '@damastro/checkers-core';

// ─── Types ────────────────────────────────────────────────────────────

export type GameStatusUI = 'idle' | 'selecting-difficulty' | 'player-turn' | 'chain-capture' | 'ai-thinking' | 'ai-unavailable' | 'finished';

export interface GameStateUI {
  board: Board;
  status: GameStatusUI;
  currentTurn: 'player' | 'ai';
  difficulty: Difficulty | null;
  gameId: string | null;
  winner: 'player' | 'ai' | null;
  selectedPiece: { row: number; col: number } | null;
  legalMoves: Move[];
  playerCaptures: number;
  aiCaptures: number;
  message: string;
  chainState: ChainState;
}

// ─── Hook ─────────────────────────────────────────────────────────────

export function useGame() {
  const { getToken } = useAuth();
  const [state, setState] = useState<GameStateUI>({
    board: createInitialBoard(),
    status: 'idle',
    currentTurn: 'player',
    difficulty: null,
    gameId: null,
    winner: null,
    selectedPiece: null,
    legalMoves: [],
    playerCaptures: 0,
    aiCaptures: 0,
    message: 'Welcome to Damastro!',
    chainState: { active: false, piece: null },
  });

  // Track last move for retry when AI is unavailable
  const lastMoveRef = useRef<{
    from: { row: number; col: number };
    to: { row: number; col: number };
    gameId: string;
  } | null>(null);

  /**
   * Start a new game with the given difficulty.
   */
  const startGame = useCallback(async (difficulty: Difficulty) => {
    try {
      setState(prev => ({
        ...prev,
        status: 'ai-thinking' as GameStatusUI,
        message: 'Starting game...',
        difficulty,
      }));

      const token = await getToken();
      const response = await fetch('/api/games/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ difficulty }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start game');
      }

      const data = await response.json();

      setState(prev => ({
        ...prev,
        board: data.game.board,
        status: 'player-turn',
        currentTurn: 'player',
        gameId: data.game.id,
        difficulty,
        selectedPiece: null,
        legalMoves: [],
        winner: null,
        playerCaptures: 0,
        aiCaptures: 0,
        message: 'Your turn! Select a piece to move.',
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'selecting-difficulty',
        message: `Error: ${error instanceof Error ? error.message : 'Failed to start game'}`,
      }));
    }
  }, [getToken]);

  /**
   * Select a piece on the board.
   */
  const selectPiece = useCallback((row: number, col: number) => {
    setState(prev => {
      if (prev.status !== 'player-turn' && prev.status !== 'chain-capture') return prev;

      const piece = prev.board[row][col];
      if (!piece || piece.color !== 'player') return prev;

      // If chain capture is active, only allow selecting the chained piece
      if (prev.chainState.active) {
        const chainPiece = prev.chainState.piece;
        if (!chainPiece || chainPiece.row !== row || chainPiece.col !== col) {
          return {
            ...prev,
            message: 'You must continue capturing with the same piece!',
          };
        }
      }

      const legalMoves = getAllLegalMoves(prev.board, 'player', prev.chainState);
      const pieceMoves = legalMoves.filter(m => m.from.row === row && m.from.col === col);

      return {
        ...prev,
        selectedPiece: { row, col },
        legalMoves: pieceMoves,
        message: pieceMoves.length > 0
          ? 'Select a destination for the piece.'
          : 'This piece has no legal moves.',
      };
    });
  }, []);

  /**
   * Make a move.
   */
  const makeMove = useCallback(async (toRow: number, toCol: number) => {
    // Extract values BEFORE setState to avoid stale closure
    const moveGameId = state.gameId;
    const moveSelectedPiece = state.selectedPiece;
    const moveLegalMoves = state.legalMoves;

    if (!moveSelectedPiece || !moveGameId) return;

    const selectedMove = moveLegalMoves.find(
      m => m.to.row === toRow && m.to.col === toCol
    );

    if (!selectedMove) {
      setState(prev => ({
        ...prev,
        message: 'Invalid destination. Try again.',
      }));
      return;
    }

    // Store last move for potential retry when AI is unavailable
    const from = { row: moveSelectedPiece.row, col: moveSelectedPiece.col };
    const to = { row: toRow, col: toCol };
    lastMoveRef.current = { from, to, gameId: moveGameId };

    // Optimistic update + AI thinking
    setState(prev => ({
      ...prev,
      selectedPiece: null,
      legalMoves: [],
      status: 'ai-thinking' as GameStatusUI,
      message: 'Thinking...',
    }));

    try {
      const token = await getToken();
      const response = await fetch(`/api/games/${moveGameId}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ from, to }),
      });

      if (!response.ok) {
        const data = await response.json();

        // Handle 503 — AI service unavailable, but player's move WAS applied
        if (response.status === 503 && data.game) {
          setState(prev => ({
            ...prev,
            board: data.game.board,
            status: 'ai-unavailable' as GameStatusUI,
            currentTurn: data.game.currentTurn,
            winner: null,
            selectedPiece: null,
            legalMoves: [],
            chainState: data.game.chainState ?? { active: false, piece: null },
            playerCaptures: data.game.stats?.playerCaptures ?? prev.playerCaptures,
            aiCaptures: data.game.stats?.aiCaptures ?? prev.aiCaptures,
            message: data.error || 'AI is not available. Try again or start a new game.',
          }));
          return;
        }

        throw new Error(data.error || 'Invalid move');
      }

      const data = await response.json();
      const game = data.game;

      // Clear last move on success (AI responded or chain active, no retry needed)
      lastMoveRef.current = null;

      // Handle chain capture state — player continues capturing
      if (game.chainState?.active) {
        setState(prev => ({
          ...prev,
          board: game.board,
          status: 'chain-capture' as GameStatusUI,
          currentTurn: 'player',
          winner: null,
          selectedPiece: null,
          legalMoves: [],
          playerCaptures: game.stats?.playerCaptures ?? prev.playerCaptures,
          aiCaptures: game.stats?.aiCaptures ?? prev.aiCaptures,
          chainState: game.chainState,
          message: 'Chain capture! Continue capturing with this piece.',
        }));
        return;
      }

      let newStatus: GameStatusUI;
      let message: string;

      if (game.status === 'finished') {
        newStatus = 'finished';
        if (game.winner === 'player') {
          message = '🎉 You win! Congratulations!';
        } else if (game.winner === 'ai') {
          message = '😔 You lose. Better luck next time!';
        } else {
          message = '🤝 Draw!';
        }
      } else {
        newStatus = 'player-turn';
        message = 'Your turn!';
      }

      setState(prev => ({
        ...prev,
        board: game.board,
        status: newStatus,
        currentTurn: game.currentTurn,
        winner: game.winner,
        legalMoves: [],
        selectedPiece: null,
        chainState: game.chainState ?? { active: false, piece: null },
        playerCaptures: game.stats?.playerCaptures ?? prev.playerCaptures,
        aiCaptures: game.stats?.aiCaptures ?? prev.aiCaptures,
        message,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'player-turn',
        message: `Error: ${error instanceof Error ? error.message : 'Move failed'}`,
      }));
    }
  }, [state, getToken]);

  /**
   * Retry the last move when AI was unavailable.
   * Re-sends the same move request to get the AI to respond.
   */
  const retryAiMove = useCallback(async () => {
    const move = lastMoveRef.current;
    if (!move) return;

    setState(prev => ({
      ...prev,
      status: 'ai-thinking' as GameStatusUI,
      message: 'Thinking...',
    }));

    try {
      const token = await getToken();
      const response = await fetch(`/api/games/${move.gameId}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ from: move.from, to: move.to }),
      });

      if (!response.ok) {
        const data = await response.json();

        // AI still unavailable — stay in ai-unavailable state
        if (response.status === 503 && data.game) {
          setState(prev => ({
            ...prev,
            board: data.game.board,
            status: 'ai-unavailable' as GameStatusUI,
            currentTurn: data.game.currentTurn,
            winner: null,
            selectedPiece: null,
            legalMoves: [],
            chainState: data.game.chainState ?? { active: false, piece: null },
            playerCaptures: data.game.stats?.playerCaptures ?? prev.playerCaptures,
            aiCaptures: data.game.stats?.aiCaptures ?? prev.aiCaptures,
            message: data.error || 'AI is not available. Try again or start a new game.',
          }));
          return;
        }

        throw new Error(data.error || 'Invalid move');
      }

      const data = await response.json();
      const game = data.game;

      // Clear last move — AI responded successfully
      lastMoveRef.current = null;

      // Handle chain capture state — player continues capturing
      if (game.chainState?.active) {
        setState(prev => ({
          ...prev,
          board: game.board,
          status: 'chain-capture' as GameStatusUI,
          currentTurn: 'player',
          winner: null,
          selectedPiece: null,
          legalMoves: [],
          playerCaptures: game.stats?.playerCaptures ?? prev.playerCaptures,
          aiCaptures: game.stats?.aiCaptures ?? prev.aiCaptures,
          chainState: game.chainState,
          message: 'Chain capture! Continue capturing with this piece.',
        }));
        return;
      }

      let newStatus: GameStatusUI;
      let message: string;

      if (game.status === 'finished') {
        newStatus = 'finished';
        if (game.winner === 'player') {
          message = '🎉 You win! Congratulations!';
        } else if (game.winner === 'ai') {
          message = '😔 You lose. Better luck next time!';
        } else {
          message = '🤝 Draw!';
        }
      } else {
        newStatus = 'player-turn';
        message = 'Your turn!';
      }

      setState(prev => ({
        ...prev,
        board: game.board,
        status: newStatus,
        currentTurn: game.currentTurn,
        winner: game.winner,
        legalMoves: [],
        selectedPiece: null,
        chainState: game.chainState ?? { active: false, piece: null },
        playerCaptures: game.stats?.playerCaptures ?? prev.playerCaptures,
        aiCaptures: game.stats?.aiCaptures ?? prev.aiCaptures,
        message,
      }));
    } catch (error) {
      // On retry failure, stay in ai-unavailable with the same message
      setState(prev => ({
        ...prev,
        status: 'ai-unavailable' as GameStatusUI,
        message: 'AI is not available. Try again or start a new game.',
      }));
    }
  }, [getToken]);

  /**
   * Reset to difficulty selection.
   */
  const resetGame = useCallback(() => {
    setState({
      board: createInitialBoard(),
      status: 'selecting-difficulty',
      currentTurn: 'player',
      difficulty: null,
      gameId: null,
      winner: null,
      selectedPiece: null,
      legalMoves: [],
      playerCaptures: 0,
      aiCaptures: 0,
      message: 'Select difficulty to start.',
      chainState: { active: false, piece: null },
    });
  }, []);

  return {
    ...state,
    startGame,
    selectPiece,
    makeMove,
    retryAiMove,
    resetGame,
  };
}
