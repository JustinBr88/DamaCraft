/**
 * Heuristic evaluation function for checkers board positions.
 *
 * Scoring breakdown:
 * - Material: regular piece = 100, king = 300
 * - Position: center control, advancement, king path proximity
 * - Mobility: more legal moves = better position
 * - Safety: exposed pieces penalized
 */
import type { Board, Piece } from '@damastro/checkers-core';
import { getAllLegalMoves, countPieces } from '@damastro/checkers-core';

// ─── Evaluation Constants ─────────────────────────────────────────────

const PIECE_VALUE = 100;
const KING_VALUE = 300;
const CENTER_BONUS = 15;
const ADVANCEMENT_BONUS = 8;
const KING_PATH_BONUS = 5;
const MOBILITY_WEIGHT = 3;
const EDGE_PENALTY = 5;
const BACK_ROW_DEFENSE_BONUS = 12;

// Center squares are more strategic
const CENTER_SQUARES = [
  [2, 3], [2, 4],
  [3, 3], [3, 4],
  [4, 3], [4, 4],
  [5, 3], [5, 4],
];

/**
 * Evaluates the board from the perspective of the given color.
 * Positive score = good for `color`, negative = bad.
 */
export function evaluateBoard(board: Board, color: 'player' | 'ai'): number {
  let score = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) continue;

      const pieceScore = evaluatePiece(board, row, col, piece, color);
      score += piece.color === color ? pieceScore : -pieceScore;
    }
  }

  // Mobility bonus
  const myMoves = getAllLegalMoves(board, color).length;
  const oppMoves = getAllLegalMoves(board, opponent(color)).length;
  score += (myMoves - oppMoves) * MOBILITY_WEIGHT;

  return score;
}

function opponent(color: 'player' | 'ai'): 'player' | 'ai' {
  return color === 'player' ? 'ai' : 'player';
}

function evaluatePiece(board: Board, row: number, col: number, piece: Piece, perspective: 'player' | 'ai'): number {
  let score = 0;

  // Material value
  score += piece.king ? KING_VALUE : PIECE_VALUE;

  // Center control
  if (isCenter(row, col)) {
    score += CENTER_BONUS;
  }

  // Edge penalty (less mobility)
  if (col === 0 || col === 7) {
    score -= EDGE_PENALTY;
  }

  // Piece-specific bonuses
  if (piece.color === 'player') {
    // Player pieces: advance toward AI side (row 0)
    if (!piece.king) {
      score += (7 - row) * ADVANCEMENT_BONUS;
      // King path: bonus for being close to row 0
      score += (7 - row) * KING_PATH_BONUS;
    }
    // Back row defense (row 7)
    if (row === 7 && !piece.king) {
      score += BACK_ROW_DEFENSE_BONUS;
    }
  } else {
    // AI pieces: advance toward player side (row 7)
    if (!piece.king) {
      score += row * ADVANCEMENT_BONUS;
      score += row * KING_PATH_BONUS;
    }
    // Back row defense (row 0)
    if (row === 0 && !piece.king) {
      score += BACK_ROW_DEFENSE_BONUS;
    }
  }

  return score;
}

function isCenter(row: number, col: number): boolean {
  return CENTER_SQUARES.some(([r, c]) => r === row && c === col);
}
