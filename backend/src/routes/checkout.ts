/**
 * Checkout routes — Stripe Checkout session creation.
 * Requires Clerk auth.
 *
 * POST /api/checkout/session  -> Body: { packageId: string }
 */
import { Hono } from 'hono';
import Stripe from 'stripe';
import { requireAuth, getClerkUserId } from '../lib/clerk.js';
import { resolveUser } from '../lib/user-resolver.js';
import { PACKAGES } from '../lib/catalog.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-01-27.acacia',
});

export const checkoutRouter = new Hono();

checkoutRouter.post('/session', requireAuth(), async (c) => {
  const clerkId = getClerkUserId(c);
  if (!clerkId) return c.json({ error: 'Unauthorized' }, 401);

  const { packageId } = await c.req.json<{ packageId: string }>();

  if (!packageId || !PACKAGES[packageId]) {
    return c.json({ error: 'Invalid package ID' }, 400);
  }

  const pkg = PACKAGES[packageId];

  if (!pkg.stripePriceId) {
    return c.json({ error: 'Package price not configured' }, 500);
  }

  // Check if already purchased
  const user = await resolveUser(clerkId);
  if ((user.inventory.purchasedPacks as string[]).includes(packageId)) {
    return c.json({ error: 'Package already purchased' }, 400);
  }

  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: pkg.stripePriceId,
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${frontendUrl}/store?purchase=success&package=${packageId}`,
    cancel_url: `${frontendUrl}/store?purchase=cancelled`,
    metadata: {
      clerkUserId: clerkId,
      packageId,
    },
    client_reference_id: clerkId,
  });

  return c.json({ url: session.url });
});