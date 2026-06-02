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

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [animateMove, setAnimateMove] = useState<{
    from: { row: number; col: number };
    to: { row: number; col: number };
    captures: Array<{ row: number; col: number }>;
    becomesKing: boolean;
    pieceColor: 'player' | 'ai';
  } | null>(null);
  // Pending board update — applied after player animation completes
  const [pendingBoard, setPendingBoard] = useState<Board | null>(null);

  // Max animation duration in ms (never exceed 3s as per spec)
  const ANIMATION_DURATION_MS = 450;

  /**
   * Start a new game with the given difficulty.
   */
  const startGame = useCallback(async (difficulty: Difficulty) => {
    // Fallback for demo mode - start game locally without API
    const startLocalGame = () => {
      setState(prev => ({
        ...prev,
        board: createInitialBoard(),
        status: 'player-turn',
        currentTurn: 'player',
        difficulty,
        gameId: `local-${Date.now()}`,
        selectedPiece: null,
        legalMoves: [],
        winner: null,
        playerCaptures: 0,
        aiCaptures: 0,
        message: 'Your turn! Select a piece to move.',
        chainState: { active: false, piece: null },
      }));
    };

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

      // If API fails (401/403/etc), fall back to local demo game
      if (!response.ok) {
        console.warn('API unavailable, starting local demo game');
        startLocalGame();
        return;
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
      // Network error or other issue - try local demo
      console.warn('Network error, starting local demo game:', error);
      startLocalGame();
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
   * Trigger visual animation for a move.
   * Blocks interaction until animation completes (max 3s).
   */
  const triggerAnimation = useCallback((
    from: { row: number; col: number },
    to: { row: number; col: number },
    captures: Array<{ row: number; col: number }>,
    becomesKing: boolean,
    pieceColor: 'player' | 'ai'
  ) => {
    setIsAnimating(true);
    setAnimateMove({ from, to, captures, becomesKing, pieceColor });

    // Safety net: always unblock after max duration
    setTimeout(() => {
      setIsAnimating(false);
      setAnimateMove(null);
    }, ANIMATION_DURATION_MS);
  }, []);

  /**
   * Clear animation state (called after animation completes naturally).
   */
  const clearAnimation = useCallback(() => {
    setIsAnimating(false);
    setAnimateMove(null);
  }, []);

  /**
   * Make a move.
   */
  const makeMove = useCallback(async (toRow: number, toCol: number) => {
    // Block interaction while animating
    if (isAnimating) return;

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

    // Trigger animation for player's move
    triggerAnimation(from, to, [...selectedMove.captures], selectedMove.becomesKing, 'player');

    // Local demo mode - simulate locally
    if (moveGameId.startsWith('local-')) {
      // For demo, just show the move was made and transition to AI turn
      setState(prev => ({
        ...prev,
        board: prev.board, // Keep same board in demo
        selectedPiece: null,
        legalMoves: [],
        status: 'ai-thinking' as GameStatusUI,
        message: 'Demo mode - AI thinking...',
      }));

      // Simulate AI response after animation completes
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          status: 'player-turn',
          message: 'Your turn! (Demo mode)',
        }));
        clearAnimation();
      }, ANIMATION_DURATION_MS + 200);
      return;
    }

    lastMoveRef.current = { from, to, gameId: moveGameId };

    // Show player animation on current board immediately
    // Board state only updates AFTER player animation completes
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
          clearAnimation();
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
      const aiMoves = data.aiMoves ?? [];
      const aiMoveData = data.aiMove; // AI's move from the response
      const boardAfterPlayerMove = data.boardAfterPlayerMove; // Board BEFORE AI moved

      // Clear last move on success (AI responded or chain active, no retry needed)
      lastMoveRef.current = null;

      // Handle chain capture state — player continues capturing
      if (game.chainState?.active) {
        // Chain continues: keep player animation visible, then show chain state after animation
        // Store the chain board to apply after animation completes
        setPendingBoard(game.board);
        
        // After player animation completes, apply chain board without triggering another animation
        setTimeout(() => {
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
          setPendingBoard(null);
        }, ANIMATION_DURATION_MS);
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

      // Store board update and AI move for after player animation
      setPendingBoard(game.board);

      // Keep player animation until it naturally expires, then apply board + AI animation
      // DON'T clear animation here - let the safety net in triggerAnimation handle it
      setState(prev => ({
        ...prev,
        status: 'ai-thinking' as GameStatusUI, // Show AI thinking during animation
        currentTurn: game.currentTurn,
        winner: game.winner,
        legalMoves: [],
        selectedPiece: null,
        chainState: game.chainState ?? { active: false, piece: null },
        playerCaptures: game.stats?.playerCaptures ?? prev.playerCaptures,
        aiCaptures: game.stats?.aiCaptures ?? prev.aiCaptures,
        message: 'Thinking...',
      }));

      // After player animation completes, animate each AI move sequentially
      setTimeout(() => {
        if (aiMoves && aiMoves.length > 0) {
          // Animate each AI move step sequentially
          let stepIndex = 0;
          
          const animateNextStep = () => {
            if (stepIndex >= aiMoves.length) {
              // All AI moves animated, show final state
              setState(prev => ({
                ...prev,
                board: game.board,
                status: newStatus,
                currentTurn: game.currentTurn,
                winner: game.winner,
                message,
              }));
              setIsAnimating(false);
              setAnimateMove(null);
              setPendingBoard(null);
              return;
            }
            
            const step = aiMoves[stepIndex];
            
            // Set board to before this move
            setState(prev => ({
              ...prev,
              board: step.boardBefore,
            }));
            
            // Trigger animation for this move
            const moveAnim = {
              from: step.move.from,
              to: step.move.to,
              captures: step.move.captures || [],
              becomesKing: step.move.becomesKing || false,
              pieceColor: 'ai' as const
            };
            
            setAnimateMove(moveAnim);
            setIsAnimating(true);
            
            // After this animation, move to next step
            setTimeout(() => {
              setAnimateMove(null);
              stepIndex++;
              animateNextStep();
            }, ANIMATION_DURATION_MS);
          };
          
          animateNextStep();
        } else {
          // No AI moves, just update board
          setState(prev => ({
            ...prev,
            board: game.board,
            status: newStatus,
            currentTurn: game.currentTurn,
            winner: game.winner,
            message,
          }));
          setIsAnimating(false);
          setAnimateMove(null);
          setPendingBoard(null);
        }
      }, ANIMATION_DURATION_MS);
    } catch (error) {
      clearAnimation();
      setState(prev => ({
        ...prev,
        status: 'player-turn',
        message: `Error: ${error instanceof Error ? error.message : 'Move failed'}`,
      }));
    }
  }, [state, getToken, isAnimating, triggerAnimation, clearAnimation]);

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
    isAnimating,
    animateMove,
  };
}
