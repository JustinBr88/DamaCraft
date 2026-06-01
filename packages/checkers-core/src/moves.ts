/**
 * Legal move generation for checkers.
 *
 * Rules implemented:
 * - Regular pieces move diagonally forward one square
 * - Queens slide any number of empty squares diagonally
 * - Queen captures: jump over exactly one enemy piece, land on any empty square beyond
 * - Captures are NOT mandatory (player can choose any legal move)
 * - Chain capture: after a capture, if the same piece can capture again, chain state activates
 * - Chain forces capturing piece to continue until no more captures or coronation
 * - Coronation: piece reaching the last row becomes king (ends chain immediately)
 */
import type { Board, Piece, Position, Move, ChainState, PlayerColor } from './types';
import { isInBounds } from './types';
import { getDirections } from './board';

// ─── Queen Moves ──────────────────────────────────────────────────────

/**
 * Get all diagonal slides for a queen piece.
 * Queen can move any number of empty squares diagonally.
 */
function getQueenSlides(board: Board, row: number, col: number, _color: PlayerColor): Position[] {
  const positions: Position[] = [];
  const dirs: [number, number][] = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

  for (const [dRow, dCol] of dirs) {
    let r = row + dRow;
    let c = col + dCol;
    while (isInBounds(r, c) && board[r][c] === null) {
      positions.push({ row: r, col: c });
      r += dRow;
      c += dCol;
    }
  }

  return positions;
}

/**
 * Get all capture moves for a queen.
 * Queen slides in a diagonal direction; the first enemy piece encountered
 * can be captured if there are empty squares beyond it. The queen lands
 * on ANY empty square beyond the captured piece.
 */
function getQueenCaptures(board: Board, row: number, col: number, color: PlayerColor): Move[] {
  const moves: Move[] = [];
  const dirs: [number, number][] = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

  for (const [dRow, dCol] of dirs) {
    let r = row + dRow;
    let c = col + dCol;
    let foundEnemy = false;
    let enemyRow = -1;
    let enemyCol = -1;

    while (isInBounds(r, c)) {
      const cell = board[r][c];

      if (cell === null) {
        if (foundEnemy) {
          // Empty square beyond enemy = valid landing spot
          moves.push({
            from: { row, col },
            to: { row: r, col: c },
            captures: [{ row: enemyRow, col: enemyCol }],
            becomesKing: false,
          });
        }
        // If no enemy found yet, keep scanning
      } else {
        if (cell.color === color) {
          // Friendly piece — stop this direction entirely
          break;
        }
        if (foundEnemy) {
          // Second enemy piece — stop (queen captures exactly one per move)
          break;
        }
        // First enemy piece found — mark it and continue scanning for landing squares
        foundEnemy = true;
        enemyRow = r;
        enemyCol = c;
      }

      r += dRow;
      c += dCol;
    }
  }

  return moves;
}

// ─── Simple Moves (non-capture) ───────────────────────────────────────

function getSimpleMoves(board: Board, row: number, col: number, piece: Piece): Move[] {
  // Queen: generate slides in all diagonal directions
  if (piece.king) {
    return getQueenSlides(board, row, col, piece.color).map(pos => ({
      from: { row, col },
      to: pos,
      captures: [],
      becomesKing: false, // queen is already king
    }));
  }

  // Regular piece: single diagonal forward
  const moves: Move[] = [];
  const directions = getDirections(piece);

  for (const dRow of directions) {
    for (const dCol of [-1, 1]) {
      const newRow = row + dRow;
      const newCol = col + dCol;

      if (!isInBounds(newRow, newCol)) continue;
      if (board[newRow][newCol] !== null) continue;

      const becomesKing = becomesKingAt(piece, newRow);

      moves.push({
        from: { row, col },
        to: { row: newRow, col: newCol },
        captures: [],
        becomesKing,
      });
    }
  }

  return moves;
}

// ─── Capture Moves ────────────────────────────────────────────────────

/**
 * Returns all single-capture moves from a given position.
 * Multi-capture chains are handled at the game level via chain state.
 */
function getCaptureMovesFrom(board: Board, row: number, col: number, piece: Piece): Move[] {
  // Queen: use queen capture logic
  if (piece.king) {
    return getQueenCaptures(board, row, col, piece.color);
  }

  // Regular piece: single-jump capture
  const moves: Move[] = [];
  const directions = getDirections(piece);

  for (const dRow of directions) {
    for (const dCol of [-1, 1]) {
      const midRow = row + dRow;
      const midCol = col + dCol;
      const newRow = row + 2 * dRow;
      const newCol = col + 2 * dCol;

      if (!isInBounds(midRow, midCol) || !isInBounds(newRow, newCol)) continue;

      const midPiece = board[midRow][midCol];
      if (midPiece === null || midPiece.color === piece.color) continue;

      const destPiece = board[newRow][newCol];
      if (destPiece !== null) continue;

      const becomesKing = becomesKingAt(piece, newRow);

      moves.push({
        from: { row, col },
        to: { row: newRow, col: newCol },
        captures: [{ row: midRow, col: midCol }],
        becomesKing,
      });
    }
  }

  return moves;
}

// ─── Public API ───────────────────────────────────────────────────────

/**
 * Returns ALL legal moves for a given piece at (row, col).
 * Captures are NOT mandatory — all simple moves and captures are returned.
 */
export function getLegalMovesForPiece(board: Board, row: number, col: number): Move[] {
  const piece = board[row][col];
  if (!piece) return [];
  return [...getSimpleMoves(board, row, col, piece), ...getCaptureMovesFrom(board, row, col, piece)];
}

/**
 * Checks if any piece of the given color has a capture move available.
 */
export function hasCaptureAvailable(board: Board, color: PlayerColor): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        if (getCaptureMovesFrom(board, row, col, piece).length > 0) return true;
      }
    }
  }
  return false;
}

/**
 * Returns ALL legal moves for a given color.
 *
 * If `chainState` is active, only capture moves for the chaining piece
 * are returned. Otherwise, all simple and capture moves for every piece
 * of that color are returned (captures are NOT mandatory).
 */
export function getAllLegalMoves(board: Board, color: PlayerColor, chainState?: ChainState): Move[] {
  // Chain state: only the chaining piece can move (capture only)
  if (chainState?.active && chainState.piece) {
    return getChainCaptureMoves(board, chainState.piece);
  }

  // Normal turn: all moves for all pieces, captures NOT mandatory
  const allMoves: Move[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        allMoves.push(...getSimpleMoves(board, row, col, piece));
        allMoves.push(...getCaptureMovesFrom(board, row, col, piece));
      }
    }
  }

  return allMoves;
}

/**
 * Returns only capture moves for a specific piece (used in chain state).
 */
export function getChainCaptureMoves(board: Board, piece: Position): Move[] {
  const p = board[piece.row][piece.col];
  if (!p) return [];
  return getCaptureMovesFrom(board, piece.row, piece.col, p);
}

/**
 * Returns true if the given color has no legal moves (lost).
 */
export function hasNoLegalMoves(board: Board, color: PlayerColor): boolean {
  return getAllLegalMoves(board, color).length === 0;
}

/**
 * Counts pieces of a given color.
 */
export function countPieces(board: Board, color: PlayerColor): number {
  let count = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) count++;
    }
  }
  return count;
}

// ─── Chain State ──────────────────────────────────────────────────────

/**
 * Determines the next chain state after a move has been applied.
 *
 * Chain activates when:
 * - The move captured at least one piece
 * - The piece did NOT become king (coronation ends the turn)
 * - The piece can capture again from its new position
 */
export function getNextChainState(board: Board, lastMove: Move, _playerColor: PlayerColor): ChainState {
  // No capture → no chain
  if (lastMove.captures.length === 0) {
    return { active: false, piece: null };
  }

  // Coronation ends the turn even if further captures are possible
  if (lastMove.becomesKing) {
    return { active: false, piece: null };
  }

  // Check if piece can capture again from its new position
  const to = lastMove.to;
  const piece = board[to.row][to.col];
  if (!piece) return { active: false, piece: null };

  const furtherCaptures = getCaptureMovesFrom(board, to.row, to.col, piece);
  if (furtherCaptures.length > 0) {
    return { active: true, piece: { row: to.row, col: to.col } };
  }

  return { active: false, piece: null };
}

// ─── Helpers ──────────────────────────────────────────────────────────

function becomesKingAt(piece: Piece, newRow: number): boolean {
  if (piece.king) return false;
  if (piece.color === 'player' && newRow === 0) return true;
  if (piece.color === 'ai' && newRow === 7) return true;
  return false;
}
