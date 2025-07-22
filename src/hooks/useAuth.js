import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import authManager from '@/lib/authManager';

/**
 * Hook to initialize the authentication manager with Clerk
 * This should be used once in your app's root component (App.jsx or main layout)
 */
export const useAuthInit = () => {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    console.log('Auth state changed:', { isLoaded, isSignedIn });
    
    if (isLoaded && isSignedIn) {
      // Initialize auth manager with Clerk's getToken function
      console.log('Initializing auth manager...');
      authManager.initialize(getToken);
    } else if (isLoaded && !isSignedIn) {
      // Clear token if user is signed out
      console.log('User not signed in, clearing token...');
      authManager.clearToken();
    }
  }, [getToken, isSignedIn, isLoaded]);

  return {
    isAuthenticated: isLoaded && isSignedIn && authManager.isAuthenticated(),
    isLoaded,
    isSignedIn
  };
};

/**
 * Hook to get authentication status without initializing
 * Use this in components that need to check auth state
 */
export const useAuthStatus = () => {
  const { isSignedIn, isLoaded } = useAuth();
  
  return {
    isAuthenticated: isLoaded && isSignedIn && authManager.isAuthenticated(),
    isLoaded,
    isSignedIn,
    currentToken: authManager.getCurrentToken()
  };
};
