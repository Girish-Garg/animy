import { useAuth } from '@clerk/clerk-react';
import { setTokenGetter, clearTokenGetter } from '@/lib/tokenBridge';

/**
 * Registers Clerk's getToken() with the token bridge so the (non-React) axios
 * interceptor can attach a fresh token to every request. Use once at the app
 * root (App.jsx).
 *
 * Registration happens during render (not in an effect) so the getter is
 * available before any child component's effects fire an API call — this is
 * what lets us drop the old "wait for auth to initialize" setTimeout hacks.
 * The bridge is a module singleton, so repeated calls are idempotent.
 */
export const useAuthInit = () => {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  if (isLoaded) {
    if (isSignedIn) {
      setTokenGetter(getToken);
    } else {
      clearTokenGetter();
    }
  }

  return { isLoaded, isSignedIn };
};
