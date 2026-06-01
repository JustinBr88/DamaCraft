/**
 * Helper to resolve a Clerk user to a MongoDB User document.
 * Creates the user on first access if they don't exist (fallback for webhook misses).
 */
import { getClerkClient } from './clerk.js';
import { User, type IUser } from '../models/User.js';

/**
 * Resolves a MongoDB user from a Clerk user ID.
 * Creates the user on first access if they don't exist.
 */
export async function resolveUser(clerkId: string): Promise<IUser> {
  const existing = await User.findOne({ clerkId });
  if (existing) return existing;

  // Fallback: fetch from Clerk API and create locally
  try {
    const client = getClerkClient();
    const clerkUser = await client.users.getUser(clerkId);

    const newUser = await User.create({
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses?.[0]?.emailAddress ?? '',
      username: clerkUser.username ?? clerkUser.firstName ?? 'Player',
    });

    console.log(`✅ User auto-created via resolver: ${clerkId}`);
    return newUser;
  } catch (error) {
    console.error('Failed to resolve user:', error);
    throw new Error('User not found and could not be created');
  }
}
