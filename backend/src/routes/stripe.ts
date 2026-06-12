/**
 * Stripe webhook handler.
 * NO Clerk auth — protected by Stripe signature verification.
 *
 * POST /api/stripe/webhook
 */
import { Hono } from 'hono';
import Stripe from 'stripe';
import { User } from '../models/User.js';
import { PACKAGES, applyPackageUnlocks, applyBonusDiscs } from '../lib/catalog.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-01-27.acacia',
});

export const stripeRouter = new Hono();

stripeRouter.post('/webhook', async (c) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

  const signature = c.req.header('stripe-signature');
  if (!signature) {
    return c.json({ error: 'Missing Stripe signature' }, 400);
  }

  let event: Stripe.Event;
  try {
    const rawBody = await c.req.raw.text();
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return c.json({ error: 'Invalid signature' }, 400);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== 'paid') {
      return c.json({ received: true });
    }

    const { clerkUserId, packageId } = session.metadata ?? {};
    if (!clerkUserId || !packageId) {
      console.error('Webhook missing metadata:', session.id);
      return c.json({ error: 'Missing metadata' }, 400);
    }

    if (!PACKAGES[packageId]) {
      console.error('Unknown packageId in webhook:', packageId);
      return c.json({ error: 'Unknown package' }, 400);
    }

    // Idempotency: check if already fulfilled
    const existingPurchase = await User.findOne(
      { clerkId: clerkUserId, 'inventory.purchasedPacks': packageId },
      { _id: 1 }
    ).lean();

    if (existingPurchase) {
      console.log(`Package ${packageId} already fulfilled for user ${clerkUserId}, skipping`);
      return c.json({ received: true });
    }

    // Apply unlocks
    const user = await User.findOne({ clerkId: clerkUserId });
    if (!user) {
      console.error('User not found for webhook fulfillment:', clerkUserId);
      return c.json({ error: 'User not found' }, 404);
    }

    applyPackageUnlocks(user.inventory as Parameters<typeof applyPackageUnlocks>[0], packageId);
    applyBonusDiscs(user.inventory as Parameters<typeof applyBonusDiscs>[0]);

    if (session.customer) {
      user.stripeCustomerId = session.customer as string;
    }

    await user.save();

    console.log(`Fulfilled ${packageId} for user ${clerkUserId}`);
  }

  return c.json({ received: true });
});