/**
 * Game status evaluation.
 * Determines if a game is finished and who won.
 *
 * Rules:
 * - Game ends when a player has 0 pieces
 * - Game ends when the player whose turn it is has NO legal moves (stalemate = loss)
 * - Draw when both sides have only kings with equal counts
 */
import type { Board, GameStatus, PlayerColor } from './types';
import { countPieces, hasNoLegalMoves } from './moves';

/**
 * Evaluates the current board and returns the game status.
 * Checks piece count AND whether the active player can make any legal moves.
 */
export function evaluateGameStatus(board: Board): GameStatus {
  const playerPieces = countPieces(board, 'player');
  const aiPieces = countPieces(board, 'ai');

  if (playerPieces === 0) return 'ai_wins';
  if (aiPieces === 0) return 'player_wins';

  // Stalemate: player whose turn it is has no legal moves = that player loses
  // When evaluating after a move, the turn will have switched, so we check both.
  if (hasNoLegalMoves(board, 'player')) return 'ai_wins';
  if (hasNoLegalMoves(board, 'ai')) return 'player_wins';

  // Draw check: only kings left with equal counts
  if (areKingsOnly(board, 'player') && areKingsOnly(board, 'ai')) {
    if (playerPieces === aiPieces) return 'draw';
  }

  return 'active';
}

function areKingsOnly(board: Board, color: PlayerColor): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color && !piece.king) return false;
    }
  }
  return true;
}
