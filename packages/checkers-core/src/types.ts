/**
 * Core types for the checkers game.
 *
 * Board convention:
 * - board[row][col] where row 0 is the TOP of the board (player's perspective)
 * - Row 0-2: AI pieces (black, start at top)
 * - Row 5-7: Player pieces (red, start at bottom)
 *
 * Color convention:
 * - 'player': the human player (red, starts at bottom rows 5-7)
 * - 'ai': the AI opponent (black, starts at top rows 0-2)
 */

// ─── Pieces ───────────────────────────────────────────────────────────

export interface Piece {
  readonly color: 'player' | 'ai';
  readonly king: boolean;
}

export type Cell = Piece | null;

// ─── Board ────────────────────────────────────────────────────────────

/** 8x8 grid. board[row][col] */
export type Board = Cell[][];

export function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

export function opponent(color: 'player' | 'ai'): 'player' | 'ai' {
  return color === 'player' ? 'ai' : 'player';
}

// ─── Positions ────────────────────────────────────────────────────────

export interface Position {
  readonly row: number;
  readonly col: number;
}

// ─── Moves ────────────────────────────────────────────────────────────

export interface Move {
  readonly from: Position;
  readonly to: Position;
  readonly captures: readonly Position[];
  readonly becomesKing: boolean;
}

// ─── Game State ───────────────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard';

export type PlayerColor = 'player' | 'ai';

export type GameStatus = 'active' | 'player_wins' | 'ai_wins' | 'draw';

export interface ChainState {
  active: boolean;
  piece: Position | null;
}

export interface GameState {
  board: Board;
  currentTurn: PlayerColor;
  chainState: ChainState;
  status: GameStatus;
  winner: PlayerColor | null;
  moveHistory: Move[];
  captures: { player: number; ai: number };
  difficulty: Difficulty;
}

// ─── API Contracts ────────────────────────────────────────────────────

export interface AiMoveRequest {
  readonly board: Board;
  readonly turn: 'player' | 'ai';
  readonly difficulty: Difficulty;
  readonly chainState?: ChainState;
}

export interface AiMoveResponse {
  readonly move: Move;
  readonly evaluationScore: number;
  readonly depthReached: number;
  readonly timeMs: number;
}

export interface AiHealthResponse {
  readonly status: 'ok';
}
