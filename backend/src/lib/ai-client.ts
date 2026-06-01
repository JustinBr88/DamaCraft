/**
 * HTTP client for the AI microservice.
 *
 * FAILURE MODE CONTRACT
 * ─────────────────────
 * Every failure returns `{ success: false, status }` where `status` is one of:
 *
 *   `'no_moves'`    → AI service responded successfully but has no legal moves
 *                     (legitimate game-over condition — player wins)
 *
 *   `'timeout'`     → The fetch was aborted after AI_TIMEOUT_MS (7s)
 *                     (infrastructure error — player's move WAS applied)
 *
 *   `'unavailable'` → Connection refused, DNS failure, HTTP 500, or any other
 *                     transport/HTTP error
 *                     (infrastructure error — player's move WAS applied)
 */
import type { Board, Difficulty, AiMoveResponse, Move, ChainState } from '@damastro/checkers-core';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3002';
const AI_TIMEOUT_MS = 7_000; // Backend timeout (IA has 6s internal budget)

/** Discriminator for failure modes — always present when `success === false`. */
export type AiFailureStatus = 'no_moves' | 'unavailable' | 'timeout';

export interface AiCallResult {
  success: boolean;
  /** Set when `success === false` — tells the caller HOW to react. */
  status?: AiFailureStatus;
  move?: Move;
  evaluationScore?: number;
  depthReached?: number;
  timeMs?: number;
  error?: string;
}

/**
 * Calls the AI microservice to get the best move for the given board state.
 *
 * @returns AiCallResult — see FAILURE MODE CONTRACT above for status values.
 */
export async function getAiMove(
  board: Board,
  turn: 'player' | 'ai',
  difficulty: Difficulty,
  chainState?: ChainState
): Promise<AiCallResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const body: Record<string, unknown> = { board, turn, difficulty };
    if (chainState?.active) {
      body.chainState = chainState;
    }

    const response = await fetch(`${AI_SERVICE_URL}/api/ai/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // ── HTTP error (500, 502, etc.) → unavailable ──────────────────────
    if (!response.ok) {
      const errorBody = await response.text();
      return {
        success: false,
        status: 'unavailable',
        error: `AI service error (${response.status}): ${errorBody}`,
      };
    }

    // ── Successful HTTP response ──────────────────────────────────────
    const data: AiMoveResponse & { status?: string } = await response.json();

    // AI has no legal moves → player wins legitimately
    if (!data.move) {
      if (data.status === 'no_moves') {
        return {
          success: false,
          status: 'no_moves',
          error: 'AI has no legal moves',
        };
      }

      // Unexpected: successful HTTP but no move AND no 'no_moves' status
      return {
        success: false,
        status: 'unavailable',
        error: 'AI returned null move without no_moves status',
      };
    }

    // ── Success ───────────────────────────────────────────────────────
    return {
      success: true,
      move: data.move,
      evaluationScore: data.evaluationScore,
      depthReached: data.depthReached,
      timeMs: data.timeMs,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    // ── Timeout (AbortController signal) → timeout ────────────────────
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        success: false,
        status: 'timeout',
        error: 'AI service timeout after 7s',
      };
    }

    // ── Connection error (ECONNREFUSED, DNS, etc.) → unavailable ──────
    return {
      success: false,
      status: 'unavailable',
      error: `AI service unreachable: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Checks if the AI service is healthy.
 */
export async function isAiHealthy(): Promise<boolean> {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(3_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
