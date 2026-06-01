/**
 * Board creation and manipulation utilities.
 */
import type { Board, Cell, Piece, Position, Move, GameState, Difficulty, PlayerColor, ChainState } from './types';

// ─── Initial Board ────────────────────────────────────────────────────

export function createInitialBoard(): Board {
  const board: Board = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => null)
  );

  // AI pieces (black) at rows 0-2
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: 'ai', king: false };
      }
    }
  }

  // Player pieces (red) at rows 5-7
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: 'player', king: false };
      }
    }
  }

  return board;
}

export function cloneBoard(board: Board): Board {
  return board.map(row =>
    row.map(cell => (cell === null ? null : { ...cell }))
  );
}

export function createInitialGameState(difficulty: Difficulty): GameState {
  return {
    board: createInitialBoard(),
    currentTurn: 'player',
    chainState: { active: false, piece: null },
    status: 'active',
    winner: null,
    moveHistory: [],
    captures: { player: 0, ai: 0 },
    difficulty,
  };
}

// ─── Direction Helpers ────────────────────────────────────────────────

/**
 * Returns the row direction offsets for a piece.
 * Regular pieces can only move forward (player moves up = -1, ai moves down = +1).
 * Kings can move both directions.
 */
export function getDirections(piece: Piece): number[] {
  if (piece.king) return [-1, 1];
  if (piece.color === 'player') return [-1]; // player moves up (decreasing row)
  return [1]; // ai moves down (increasing row)
}

// ─── Move Application ─────────────────────────────────────────────────

/**
 * Applies a move to a board and returns the new board along with
 * whether the piece became a king during this move.
 * Does NOT mutate the original.
 */
export function applyMove(board: Board, move: Move): { newBoard: Board; pieceBecameKing: boolean } {
  const result = cloneBoard(board);
  const piece = result[move.from.row][move.from.col];

  if (!piece) throw new Error('No piece at source position');

  // Clear source
  result[move.from.row][move.from.col] = null;

  // Remove captured pieces
  for (const cap of move.captures) {
    result[cap.row][cap.col] = null;
  }

  // Place piece at destination
  result[move.to.row][move.to.col] = {
    color: piece.color,
    king: move.becomesKing ? true : piece.king,
  };

  return { newBoard: result, pieceBecameKing: move.becomesKing };
}
