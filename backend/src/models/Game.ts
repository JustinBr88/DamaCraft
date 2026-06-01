import { Schema, model, type Document, type Types } from 'mongoose';
import type { Difficulty, Cell, ChainState } from '@damastro/checkers-core';

// ─── Move Sub-Schema ──────────────────────────────────────────────────

interface IMoveRecord {
  actor: 'player' | 'ai';
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  captures: { row: number; col: number }[];
  becomesKing: boolean;
  timestamp: Date;
}

// ─── Game Data Sub-Schema ─────────────────────────────────────────────

interface IGameData {
  board: Cell[][];
  currentTurn: 'player' | 'ai';
  moveHistory: IMoveRecord[];
  chainState: ChainState;
}

// ─── Game Stats Sub-Schema ────────────────────────────────────────────

interface IGameStats {
  totalMoves: number;
  playerCaptures: number;
  aiCaptures: number;
  durationSeconds: number;
}

// ─── Game Interface ───────────────────────────────────────────────────

export interface IGame extends Document {
  userId: Types.ObjectId;
  difficulty: Difficulty;
  status: 'active' | 'finished' | 'abandoned';
  winner: 'player' | 'ai' | null;
  gameData: IGameData;
  stats: IGameStats;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schemas ──────────────────────────────────────────────────────────

const positionSchema = new Schema(
  {
    row: { type: Number, required: true },
    col: { type: Number, required: true },
  },
  { _id: false }
);

const moveRecordSchema = new Schema<IMoveRecord>(
  {
    actor: { type: String, enum: ['player', 'ai'], required: true },
    fromRow: { type: Number, required: true },
    fromCol: { type: Number, required: true },
    toRow: { type: Number, required: true },
    toCol: { type: Number, required: true },
    captures: { type: [positionSchema], default: [] },
    becomesKing: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const chainStateSchema = new Schema(
  {
    active: { type: Boolean, required: true },
    piece: {
      type: { row: { type: Number }, col: { type: Number } },
      default: null,
    },
  },
  { _id: false }
);

const gameDataSchema = new Schema<IGameData>(
  {
    board: { type: Schema.Types.Mixed, required: true },
    currentTurn: { type: String, enum: ['player', 'ai'], required: true },
    moveHistory: { type: [moveRecordSchema], default: [] },
    chainState: { type: chainStateSchema, default: () => ({ active: false, piece: null }) },
  },
  { _id: false }
);

const gameStatsSchema = new Schema<IGameStats>(
  {
    totalMoves: { type: Number, default: 0 },
    playerCaptures: { type: Number, default: 0 },
    aiCaptures: { type: Number, default: 0 },
    durationSeconds: { type: Number, default: 0 },
  },
  { _id: false }
);

const gameSchema = new Schema<IGame>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'finished', 'abandoned'],
      default: 'active',
    },
    winner: { type: String, enum: ['player', 'ai', null], default: null },
    gameData: { type: gameDataSchema, required: true },
    stats: { type: gameStatsSchema, default: () => ({}) },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────

gameSchema.index({ userId: 1, createdAt: -1 });

// ─── Model Export ─────────────────────────────────────────────────────

export const Game = model<IGame>('Game', gameSchema);
