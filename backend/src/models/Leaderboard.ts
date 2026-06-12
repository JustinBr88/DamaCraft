import { Schema, model, type Document, type Types } from 'mongoose';

type Difficulty = 'easy' | 'medium' | 'hard';

// ─── Interface ─────────────────────────────────────────────────────────

export interface ILeaderboard extends Document {
  userId: Types.ObjectId;
  clerkId: string;
  username: string;
  difficulty: Difficulty;
  moves: number;
  elapsedSeconds: number;
  gameId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────

const leaderboardSchema = new Schema<ILeaderboard>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    clerkId: { type: String, required: true, index: true },
    username: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    moves: { type: Number, required: true, min: 0 },
    elapsedSeconds: { type: Number, required: true, min: 0 },
    gameId: { type: Schema.Types.ObjectId, ref: 'Game' },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────

// One record per user per difficulty
leaderboardSchema.index({ userId: 1, difficulty: 1 }, { unique: true });

// Ranking index: sort by difficulty, then moves, then elapsedSeconds
leaderboardSchema.index({ difficulty: 1, moves: 1, elapsedSeconds: 1, updatedAt: 1 });

// ─── Statics ──────────────────────────────────────────────────────────

/**
 * Upsert a better score for a user+difficulty.
 * Only updates if:
 *   - No existing record, OR
 *   - New moves < existing moves, OR
 *   - Moves equal AND new elapsedSeconds < existing elapsedSeconds
 */
leaderboardSchema.statics.upsertScore = async function (
  userId: Types.ObjectId,
  clerkId: string,
  username: string,
  difficulty: Difficulty,
  moves: number,
  elapsedSeconds: number,
  gameId?: Types.ObjectId
) {
  const existing = await this.findOne({ userId, difficulty });

  if (!existing) {
    // First score — always create
    return this.create({ userId, clerkId, username, difficulty, moves, elapsedSeconds, gameId });
  }

  // Already have a score — check if new one is better
  if (moves < existing.moves) {
    // Fewer moves is always better
    existing.moves = moves;
    existing.elapsedSeconds = elapsedSeconds;
    existing.username = username;
    existing.gameId = gameId;
    return existing.save();
  }

  if (moves === existing.moves && elapsedSeconds < existing.elapsedSeconds) {
    // Same moves, faster — update time only
    existing.elapsedSeconds = elapsedSeconds;
    existing.gameId = gameId;
    return existing.save();
  }

  // Not better — keep existing record
  return existing;
};

// ─── Model Export ─────────────────────────────────────────────────────

export const Leaderboard = model<ILeaderboard>('Leaderboard', leaderboardSchema);