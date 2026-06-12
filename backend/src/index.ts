import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import mongoose from 'mongoose';
import { userRouter } from './routes/user.js';
import { gameRouter } from './routes/game.js';
import { authRouter } from './routes/auth.js';
import { checkoutRouter } from './routes/checkout.js';
import { stripeRouter } from './routes/stripe.js';
import { leaderboardRouter } from './routes/leaderboard.js';
import dotenv from 'dotenv';

dotenv.config();

// Validate critical env vars
const requiredEnvVars = ['CLERK_SECRET_KEY', 'MONGO_URI'];
for (const v of requiredEnvVars) {
  if (!process.env[v]) {
    console.warn(`⚠️  Missing environment variable: ${v}`);
  }
}

const app = new Hono();
const PORT = process.env.PORT || 3001;

// Middleware
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Routes
app.route('/api/auth', authRouter);
app.route('/api/users', userRouter);
app.route('/api/games', gameRouter);
app.route('/api/checkout', checkoutRouter); // POST /api/checkout/session
app.route('/api/stripe', stripeRouter);      // POST /api/stripe/webhook
app.route('/api/leaderboard', leaderboardRouter); // GET/POST top-5 and score submission

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// MongoDB connection
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://damastro:damastro_local@localhost:27017/damastro?authSource=admin';

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Don't exit in dev mode, let it retry
  }
};

// Start server
const start = async () => {
  await connectDB();

  serve({
    fetch: app.fetch,
    port: Number(PORT)
  });

  console.log(`🚀 Backend running on http://localhost:${PORT}`);
};

start();

export default app;