/**
 * User API routes.
 *
 * Endpoints:
 * - GET  /api/users/me      -> Current user profile
 * - PATCH /api/users/me     -> Update user preferences (skins)
 */
import { Hono } from 'hono';
import { requireAuth, getClerkUserId } from '../lib/clerk.js';
import { resolveUser } from '../lib/user-resolver.js';
import { User } from '../models/User.js';

export const userRouter = new Hono();

// All user routes require authentication
userRouter.use('/*', requireAuth());

/**
 * GET /api/users/me
 * Returns the current user's profile.
 */
userRouter.get('/me', async (c) => {
  try {
    const clerkId = getClerkUserId(c);
    if (!clerkId) {
      return c.json({ error: 'Not authenticated' }, 401);
    }

    const user = await resolveUser(clerkId);

    return c.json({
      id: user._id.toString(),
      clerkId: user.clerkId,
      email: user.email,
      username: user.username,
      stats: user.stats,
      skins: user.skins,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return c.json({ error: 'Failed to fetch user profile' }, 500);
  }
});

/**
 * PATCH /api/users/me
 * Updates user preferences (skins, username).
 */
userRouter.patch('/me', async (c) => {
  try {
    const clerkId = getClerkUserId(c);
    if (!clerkId) {
      return c.json({ error: 'Not authenticated' }, 401);
    }

    const body = await c.req.json();
    const updateFields: Record<string, unknown> = {};

    // Only allow updating safe fields
    if (body.username && typeof body.username === 'string') {
      updateFields.username = body.username.trim().slice(0, 30);
    }

    if (body.equippedBoard && typeof body.equippedBoard === 'string') {
      updateFields['skins.equippedBoard'] = body.equippedBoard;
    }

    if (body.equippedPieceSet && typeof body.equippedPieceSet === 'string') {
      updateFields['skins.equippedPieceSet'] = body.equippedPieceSet;
    }

    if (Object.keys(updateFields).length === 0) {
      return c.json({ error: 'No valid fields to update' }, 400);
    }

    const user = await User.findOneAndUpdate(
      { clerkId },
      { $set: updateFields },
      { new: true }
    );

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({
      id: user._id.toString(),
      username: user.username,
      stats: user.stats,
      skins: user.skins,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return c.json({ error: 'Failed to update user profile' }, 500);
  }
});

// Legacy placeholder routes (keep for backward compatibility)
userRouter.get('/', (c) => c.json({ message: 'Users endpoint - use /me instead' }));
userRouter.get('/:id', (c) => c.json({ message: 'Use /me instead' }));
userRouter.post('/', async (c) => {
  return c.json({ message: 'Users are created via Clerk webhook' });
});
