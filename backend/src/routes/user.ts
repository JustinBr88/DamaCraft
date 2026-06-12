/**
 * User API routes.
 *
 * Endpoints:
 * - GET  /api/users/me              -> Current user profile + inventory
 * - PATCH /api/users/me             -> Update user preferences (username)
 * - PATCH /api/users/me/equipment   -> Equip items (skin, fondo, disco)
 */
import { Hono } from 'hono';
import { requireAuth, getClerkUserId } from '../lib/clerk.js';
import { resolveUser } from '../lib/user-resolver.js';
import { User } from '../models/User.js';
import { PACKAGES } from '../lib/catalog.js';

export const userRouter = new Hono();

// All user routes require authentication
userRouter.use('/*', requireAuth());

/**
 * GET /api/users/me
 * Returns the current user's profile and full inventory.
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
      inventory: user.inventory,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return c.json({ error: 'Failed to fetch user profile' }, 500);
  }
});

/**
 * PATCH /api/users/me
 * Updates user preferences (username only — no equipment here).
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
      inventory: user.inventory,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return c.json({ error: 'Failed to update user profile' }, 500);
  }
});

/**
 * PATCH /api/users/me/equipment
 * Equip skins, fondos, or discos. Validates ownership server-side.
 */
userRouter.patch('/me/equipment', async (c) => {
  try {
    const clerkId = getClerkUserId(c);
    if (!clerkId) {
      return c.json({ error: 'Not authenticated' }, 401);
    }

    const body = await c.req.json();
    const updateFields: Record<string, unknown> = {};
    const user = await resolveUser(clerkId);
    const inv = user.inventory as unknown as Record<string, unknown>;
    const unlockedPieceSets = (inv.unlockedPieceSets as string[]) ?? ['overworld'];
    const unlockedGameThemes = (inv.unlockedGameThemes as string[]) ?? ['overworld'];
    const unlockedMenuBackgrounds = (inv.unlockedMenuBackgrounds as string[]) ?? ['menu', 'overworld'];
    const unlockedDiscos = (inv.unlockedDiscos as string[]) ?? [];

    // Validate and apply pieceSet
    if (body.equippedPieceSet) {
      const ps = body.equippedPieceSet as string;
      if (ps !== 'overworld' && !unlockedPieceSets.includes(ps)) {
        return c.json({ error: 'Piece set not owned' }, 403);
      }
      updateFields['inventory.equippedPieceSet'] = ps;
    }

    // Validate and apply gameTheme
    if (body.equippedGameTheme) {
      const gt = body.equippedGameTheme as string;
      if (gt !== 'overworld' && !unlockedGameThemes.includes(gt)) {
        return c.json({ error: 'Game theme not owned' }, 403);
      }
      updateFields['inventory.equippedGameTheme'] = gt;
    }

    // Validate and apply menuBackground
    if (body.equippedMenuBackground) {
      const mb = body.equippedMenuBackground as string;
      if (mb !== 'menu' && !unlockedMenuBackgrounds.includes(mb)) {
        return c.json({ error: 'Menu background not owned' }, 403);
      }
      updateFields['inventory.equippedMenuBackground'] = mb;
    }

    // Validate and apply disco
    if (body.equippedDisco) {
      const disco = body.equippedDisco as string;
      if (!unlockedDiscos.includes(disco)) {
        return c.json({ error: 'Disco not owned' }, 403);
      }
      updateFields['inventory.equippedDisco'] = disco;
    }

    if (Object.keys(updateFields).length === 0) {
      return c.json({ error: 'No valid equipment fields to update' }, 400);
    }

    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({
      inventory: updatedUser.inventory,
    });
  } catch (error) {
    console.error('Error updating equipment:', error);
    return c.json({ error: 'Failed to update equipment' }, 500);
  }
});

// Legacy placeholder routes (keep for backward compatibility)
userRouter.get('/', (c) => c.json({ message: 'Users endpoint - use /me instead' }));
userRouter.get('/:id', (c) => c.json({ message: 'Use /me instead' }));
userRouter.post('/', async (c) => {
  return c.json({ message: 'Users are created via Clerk webhook' });
});
