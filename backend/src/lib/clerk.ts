/**
 * Clerk authentication middleware and helpers.
 *
 * Uses verifyToken directly for JWT-based auth from Bearer tokens.
 */
import { createClerkClient, type ClerkClient, verifyToken } from '@clerk/backend';
import type { Context, MiddlewareHandler } from 'hono';

let clerkClient: ClerkClient | null = null;

export function getClerkClient(): ClerkClient {
  if (!clerkClient) {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('CLERK_SECRET_KEY environment variable is required');
    }
    clerkClient = createClerkClient({ secretKey });
  }
  return clerkClient;
}

/**
 * Middleware to require authentication.
 * Extracts the Bearer token from the Authorization header,
 * verifies it with Clerk's verifyToken, and stores the session info.
 */
export function requireAuth(): MiddlewareHandler {
  return async (c: Context, next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized: Missing or invalid Authorization header' }, 401);
    }

    const token = authHeader.slice(7);

    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      // Store auth info in context for downstream handlers
      c.set('auth', {
        userId: payload.sub,
        sessionId: payload.sid ?? '',
      });

      await next();
    } catch (error) {
      console.error('Clerk auth error:', error);
      return c.json({ error: 'Authentication failed: Invalid or expired token' }, 401);
    }
  };
}

/**
 * Helper to get auth info from context.
 */
export function getAuth(c: Context): { userId: string; sessionId: string } | null {
  return c.get('auth') ?? null;
}

/**
 * Gets the Clerk User ID from the authenticated request.
 */
export function getClerkUserId(c: Context): string | null {
  const auth = getAuth(c);
  return auth?.userId ?? null;
}

// ─── Hono Type Extension ─────────────────────────────────────────────

declare module 'hono' {
  interface ContextVariableMap {
    auth: {
      userId: string;
      sessionId: string;
    };
  }
}
