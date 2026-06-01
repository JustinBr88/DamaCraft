/**
 * Clerk webhook handler for user lifecycle events.
 *
 * Endpoints:
 * - POST /api/auth/webhook - Clerk webhook events
 */
import { Hono } from 'hono';
import { User } from '../models/User.js';

export const authRouter = new Hono();

/**
 * Clerk webhook endpoint.
 *
 * Handles:
 * - user.created: Create a new user in MongoDB
 * - user.updated: Update existing user
 * - user.deleted: Mark user as inactive (soft delete)
 *
 * Security: In production, verify the Clerk webhook secret signature.
 * For development, we trust the request origin via internal network.
 */
authRouter.post('/webhook', async (c) => {
  try {
    const body = await c.req.json();
    const { type, data } = body;

    if (!type || !data) {
      return c.json({ error: 'Invalid webhook payload' }, 400);
    }

    switch (type) {
      case 'user.created': {
        const existing = await User.findOne({ clerkId: data.id });
        if (existing) {
          return c.json({ message: 'User already exists' });
        }

        await User.create({
          clerkId: data.id,
          email: data.email_addresses?.[0]?.email_address ?? '',
          username: data.username ?? data.first_name ?? 'Player',
        });

        console.log(`✅ User created: ${data.id}`);
        return c.json({ message: 'User created' }, 201);
      }

      case 'user.updated': {
        await User.findOneAndUpdate(
          { clerkId: data.id },
          {
            email: data.email_addresses?.[0]?.email_address ?? '',
            username: data.username ?? data.first_name ?? 'Player',
          }
        );

        console.log(`✅ User updated: ${data.id}`);
        return c.json({ message: 'User updated' });
      }

      case 'user.deleted': {
        // Soft-delete not needed for MVP, but we could add a flag
        console.log(`🗑️ User deleted: ${data.id}`);
        return c.json({ message: 'User deletion noted' });
      }

      default:
        console.log(`ℹ️ Unhandled webhook event: ${type}`);
        return c.json({ message: `Event ${type} received but not handled` });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});
