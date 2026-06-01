import { Schema, model, type Document } from 'mongoose';

// ─── Stats Sub-Schema ─────────────────────────────────────────────────

interface IStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  currentStreak: number;
}

// ─── Skins Sub-Schema ─────────────────────────────────────────────────

interface ISkins {
  unlockedBoards: string[];
  unlockedPieceSets: string[];
  equippedBoard: string;
  equippedPieceSet: string;
}

// ─── User Interface ───────────────────────────────────────────────────

export interface IUser extends Document {
  clerkId: string;
  email: string;
  username: string;
  stats: IStats;
  skins: ISkins;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────

const statsSchema = new Schema<IStats>(
  {
    gamesPlayed: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    gamesLost: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
  },
  { _id: false }
);

const skinsSchema = new Schema<ISkins>(
  {
    unlockedBoards: { type: [String], default: ['overwold'] },
    unlockedPieceSets: { type: [String], default: ['overwold'] },
    equippedBoard: { type: String, default: 'overwold' },
    equippedPieceSet: { type: String, default: 'overwold' },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    stats: { type: statsSchema, default: () => ({}) },
    skins: { type: skinsSchema, default: () => ({}) },
  },
  {
    timestamps: true,
  }
);

// ─── Model Export ─────────────────────────────────────────────────────

export const User = model<IUser>('User', userSchema);
