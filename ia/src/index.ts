/**
 * AI Microservice - Hono HTTP server
 *
 * Endpoints:
 * - GET  /health       -> { status: "ok" }
 * - POST /api/ai/move  -> { move, evaluationScore, depthReached, timeMs }
 */
import { Hono } from 'hono';
import type { Board, Difficulty, AiMoveRequest, Move, ChainState } from '@damastro/checkers-core';
import { getAllLegalMoves } from '@damastro/checkers-core';
import { findBestMove } from './search';

// ─── Config ───────────────────────────────────────────────────────────

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3002;
const MAX_TIME_MS = 6_000; // Maximum compute time in milliseconds

// ─── App ──────────────────────────────────────────────────────────────

const app = new Hono();

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

// AI Move endpoint
app.post('/api/ai/move', async (c) => {
  const startTime = Date.now();

  try {
    const body: AiMoveRequest = await c.req.json();
    const { board, turn, difficulty, chainState } = body;

    // Validate request
    if (!board || !turn || !difficulty) {
      return c.json({ error: 'Missing required fields: board, turn, difficulty' }, 400);
    }

    if (turn !== 'player' && turn !== 'ai') {
      return c.json({ error: 'Invalid turn value. Must be "player" or "ai"' }, 400);
    }

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return c.json({ error: 'Invalid difficulty. Must be "easy", "medium", or "hard"' }, 400);
    }

    if (!isValidBoard(board)) {
      return c.json({ error: 'Invalid board. Must be 8x8 array' }, 400);
    }

    // Get legal moves (respecting chain state if active)
    const legalMoves = chainState?.active
      ? getAllLegalMoves(board, turn, chainState as ChainState)
      : getAllLegalMoves(board, turn);

    if (legalMoves.length === 0) {
      return c.json({
        move: null,
        evaluationScore: 0,
        depthReached: 0,
        timeMs: Date.now() - startTime,
        status: 'no_moves',
      });
    }

    // Calculate deadline: remaining time within our 6s budget
    const elapsed = Date.now() - startTime;
    const remainingMs = Math.max(100, MAX_TIME_MS - elapsed);

    // Find best move using AI (pass chain state for root-level filtering)
    const result = findBestMove(board, turn, difficulty as Difficulty, remainingMs, chainState);

    const totalTime = Date.now() - startTime;

    const response: {
      move: Move | null;
      evaluationScore: number;
      depthReached: number;
      timeMs: number;
      status?: string;
    } = {
      move: result.bestMove!,
      evaluationScore: result.evaluation,
      depthReached: result.depthReached,
      timeMs: totalTime,
    };

    if (result.bestMove === null && legalMoves.length > 0) {
      // Fallback: return first legal move
      response.move = legalMoves[0];
      response.status = 'fallback';
    }

    return c.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('AI service error:', errorMessage);
    return c.json({ error: 'Internal server error', detail: errorMessage }, 500);
  }
});

// Catch-all for 404
app.notFound((c) => c.json({ error: 'Not found' }, 404));

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

// ─── Startup ──────────────────────────────────────────────────────────

console.log(`🧠 AI Microservice starting on port ${PORT}...`);
console.log(`⚙️  Max compute time: ${MAX_TIME_MS}ms`);

Bun.serve({
  fetch: app.fetch,
  port: PORT,
});

console.log(`✅ AI Microservice running at http://localhost:${PORT}`);

// ─── Validation ───────────────────────────────────────────────────────

function isValidBoard(board: unknown): board is Board {
  if (!Array.isArray(board)) return false;
  if (board.length !== 8) return false;

  for (let row = 0; row < 8; row++) {
    const r = board[row];
    if (!Array.isArray(r) || r.length !== 8) return false;
  }

  return true;
}
