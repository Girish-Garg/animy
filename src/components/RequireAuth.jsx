import { useAuth } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Centralized route guard. Use as a layout route wrapping protected routes,
 * or with explicit children. Renders nothing until Clerk has loaded, redirects
 * to /signin when signed out, and otherwise renders the protected content.
 */
export default function RequireAuth({ children }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/signin" replace />;

  return children ?? <Outlet />;
}
