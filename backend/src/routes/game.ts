/**
 * Game API routes.
 *
 * Endpoints:
 * - GET  /api/games           -> List user's games
 * - GET  /api/games/:id       -> Get game details
 * - POST /api/games/start     -> Start a new game vs AI
 * - POST /api/games/:id/move  -> Make a move
 */
import { Hono } from 'hono';
import { requireAuth, getClerkUserId } from '../lib/clerk.js';
import { resolveUser } from '../lib/user-resolver.js';
import { Game } from '../models/Game.js';
import { startNewGame, makePlayerMove } from '../services/game-service.js';
import type { Difficulty } from '@damastro/checkers-core';

export const gameRouter = new Hono();

// All game routes require authentication
gameRouter.use('/*', requireAuth());

// ─── Helpers ──────────────────────────────────────────────────────────

async function getUserIdFromClerk(c: any): Promise<string | null> {
  const clerkId = getClerkUserId(c);
  if (!clerkId) return null;
  try {
    const user = await resolveUser(clerkId);
    return user._id.toString();
  } catch {
    return null;
  }
}

// ─── List Games ───────────────────────────────────────────────────────

/**
 * GET /api/games
 * Returns the user's game history, sorted by most recent.
 */
gameRouter.get('/', async (c) => {
  try {
    const userId = await getUserIdFromClerk(c);
    if (!userId) return c.json({ error: 'User not found' }, 404);

    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = parseInt(c.req.query('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const games = await Game.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('difficulty status winner stats createdAt');

    const total = await Game.countDocuments({ userId });

    return c.json({
      games,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error listing games:', error);
    return c.json({ error: 'Failed to list games' }, 500);
  }
});

// ─── Get Game ─────────────────────────────────────────────────────────

/**
 * GET /api/games/:id
 * Returns full game details.
 */
gameRouter.get('/:id', async (c) => {
  try {
    const userId = await getUserIdFromClerk(c);
    if (!userId) return c.json({ error: 'User not found' }, 404);

    const game = await Game.findById(c.req.param('id'));
    if (!game) return c.json({ error: 'Game not found' }, 404);

    if (game.userId.toString() !== userId) {
      return c.json({ error: 'Not your game' }, 403);
    }

    return c.json({ game });
  } catch (error) {
    console.error('Error fetching game:', error);
    return c.json({ error: 'Failed to fetch game' }, 500);
  }
});

// ─── Start New Game ───────────────────────────────────────────────────

/**
 * POST /api/games/start
 * Starts a new game against the AI with the specified difficulty.
 *
 * Body: { difficulty: "easy" | "medium" | "hard" }
 */
gameRouter.post('/start', async (c) => {
  try {
    const userId = await getUserIdFromClerk(c);
    if (!userId) return c.json({ error: 'User not found' }, 404);

    const body = await c.req.json();
    const { difficulty } = body;

    if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
      return c.json({ error: 'Invalid difficulty. Must be: easy, medium, or hard' }, 400);
    }

    const game = await startNewGame(userId, difficulty as Difficulty);

    return c.json({
      message: 'Game started',
      game: {
        id: game._id,
        difficulty: game.difficulty,
        status: game.status,
        board: game.gameData.board,
        currentTurn: game.gameData.currentTurn,
        chainState: game.gameData.chainState,
        createdAt: game.createdAt,
      },
    }, 201);
  } catch (error) {
    console.error('Error starting game:', error);
    return c.json({ error: 'Failed to start game' }, 500);
  }
});

// ─── Make a Move ──────────────────────────────────────────────────────

/**
 * POST /api/games/:id/move
 * Makes a move in an active game.
 *
 * Body: { from: { row, col }, to: { row, col } }
 */
gameRouter.post('/:id/move', async (c) => {
  const startTime = Date.now();

  try {
    const userId = await getUserIdFromClerk(c);
    if (!userId) return c.json({ error: 'User not found' }, 404);

    const gameId = c.req.param('id');
    const body = await c.req.json();
    const { from, to } = body;

    if (!from || typeof from.row !== 'number' || typeof from.col !== 'number') {
      return c.json({ error: 'Invalid move: missing or invalid "from" position' }, 400);
    }
    if (!to || typeof to.row !== 'number' || typeof to.col !== 'number') {
      return c.json({ error: 'Invalid move: missing or invalid "to" position' }, 400);
    }

    const result = await makePlayerMove(
      gameId,
      userId,
      from.row,
      from.col,
      to.row,
      to.col
    );

    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }

    const elapsed = Date.now() - startTime;

    // ── AI service unavailable — player's move was saved ────────────────
    // Return 503 so the frontend knows the game was updated but the AI
    // response is missing. The game stays `active` with `currentTurn = 'ai'`.
    if (result.aiError) {
      return c.json({
        message: 'Move applied',
        error: result.aiError,
        game: {
          id: result.game!._id,
          status: result.game!.status,
          winner: result.game!.winner,
          board: result.game!.gameData.board,
          currentTurn: result.game!.gameData.currentTurn,
          chainState: result.game!.gameData.chainState,
          stats: result.game!.stats,
        },
        aiMove: null,
        aiTimeMs: null,
        totalTimeMs: elapsed,
      }, 503);
    }

    return c.json({
      message: 'Move applied',
      game: {
        id: result.game!._id,
        status: result.game!.status,
        winner: result.game!.winner,
        board: result.game!.gameData.board,
        currentTurn: result.game!.gameData.currentTurn,
        chainState: result.game!.gameData.chainState,
        stats: result.game!.stats,
      },
      aiMove: result.aiMove ?? null,
      aiTimeMs: result.aiTimeMs ?? 0,
      totalTimeMs: elapsed,
    });
  } catch (error) {
    console.error('Error making move:', error);
    return c.json({ error: 'Failed to process move' }, 500);
  }
});
