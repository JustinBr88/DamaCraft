/**
 * useCheckout hook
 * Handles Stripe Checkout session creation with Clerk auth.
 */
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';

export function useCheckout() {
  const { getToken, isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async (packageId: string): Promise<string | null> => {
    if (!isSignedIn) {
      // Return null → StorePage will redirect to sign-in
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ packageId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? 'Checkout failed');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
        return url;
      }
      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { startCheckout, isLoading, error };
}