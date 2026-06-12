/**
 * Leaderboard API routes.
 *
 * Endpoints:
 * - GET  /api/leaderboard?difficulty=easy|medium|hard  -> Top 5 for difficulty (public)
 * - POST /api/leaderboard                             -> Submit/update score (protected)
 */
import { Hono } from 'hono';
import { requireAuth, getClerkUserId } from '../lib/clerk.js';
import { resolveUser } from '../lib/user-resolver.js';
import { Leaderboard } from '../models/Leaderboard.js';
import { Game } from '../models/Game.js';

export const leaderboardRouter = new Hono();

// ─── Helpers ──────────────────────────────────────────────────────────

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

type Difficulty = 'easy' | 'medium' | 'hard';

// ─── GET Top-5 (Public) ───────────────────────────────────────────────

/**
 * GET /api/leaderboard?difficulty=easy|medium|hard
 * Returns the top 5 players for the given difficulty.
 */
leaderboardRouter.get('/', async (c) => {
  const difficulty = c.req.query('difficulty') as Difficulty | undefined;

  if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
    return c.json({ error: 'Missing or invalid difficulty query param (easy|medium|hard)' }, 400);
  }

  try {
    const entries = await Leaderboard
      .find({ difficulty })
      .sort({ moves: 1, elapsedSeconds: 1, updatedAt: 1 })
      .limit(5)
      .select('username moves elapsedSeconds difficulty');

    const ranked = entries.map((entry, index) => ({
      rank: index + 1,
      playerName: entry.username,
      moves: entry.moves,
      time: formatElapsed(entry.elapsedSeconds),
      difficulty: entry.difficulty,
    }));

    return c.json({ entries: ranked });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return c.json({ error: 'Failed to fetch leaderboard' }, 500);
  }
});

// ─── POST Submit Score (Protected) ───────────────────────────────────

/**
 * POST /api/leaderboard
 * Submits or updates a player's score after winning against the AI.
 *
 * Body: { gameId: string, moves: number, elapsedSeconds: number }
 *
 * Authorization: Bearer <clerk token>
 *
 * Rules:
 * - Only winning (winner === 'player') finished games are accepted
 * - The game must belong to the authenticated user
 * - Difficulty comes from the stored game, NOT from the client
 * - Update only if new moves < existing OR (moves equal AND time lower)
 */
leaderboardRouter.post('/', requireAuth(), async (c) => {
  try {
    const clerkId = getClerkUserId(c);
    if (!clerkId) return c.json({ error: 'Unauthorized' }, 401);

    const body = await c.req.json();
    const { gameId, moves, elapsedSeconds } = body;

    // Validate input
    if (!gameId || typeof gameId !== 'string') {
      return c.json({ error: 'gameId is required and must be a string' }, 400);
    }
    if (typeof moves !== 'number' || moves < 0 || !Number.isInteger(moves)) {
      return c.json({ error: 'moves must be a non-negative integer' }, 400);
    }
    if (typeof elapsedSeconds !== 'number' || elapsedSeconds < 0 || !Number.isInteger(elapsedSeconds)) {
      return c.json({ error: 'elapsedSeconds must be a non-negative integer' }, 400);
    }

    // Resolve MongoDB user
    const user = await resolveUser(clerkId);

    // Fetch game — authority for difficulty, winner, and status
    const game = await Game.findById(gameId);
    if (!game) return c.json({ error: 'Game not found' }, 404);
    if (game.userId.toString() !== user._id.toString()) {
      return c.json({ error: 'Not your game' }, 403);
    }
    if (game.status !== 'finished') {
      return c.json({ error: 'Game is not finished' }, 400);
    }
    if (game.winner !== 'player') {
      return c.json({ error: 'Only winning games count for the leaderboard' }, 400);
    }

    // Upsert — only updates if the new score is better
    const updated = await Leaderboard.upsertScore(
      user._id,
      clerkId,
      user.username,           // username from Mongo (falls back to Clerk name on creation)
      game.difficulty as Difficulty,
      moves,
      elapsedSeconds,
      game._id
    );

    return c.json({
      message: 'Score recorded',
      improved: updated.moves === moves && updated.elapsedSeconds === elapsedSeconds,
      entry: {
        rank: 'update',       // caller should refetch GET to get actual rank
        playerName: updated.username,
        moves: updated.moves,
        time: formatElapsed(updated.elapsedSeconds),
        difficulty: updated.difficulty,
      },
    });
  } catch (error) {
    console.error('Error submitting leaderboard score:', error);
    return c.json({ error: 'Failed to submit score' }, 500);
  }
});