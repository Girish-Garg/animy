import { SignedIn, SignedOut, UserButton, RedirectToSignIn } from '@clerk/clerk-react';
import { Routes, Route, Link, BrowserRouter, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/login';
import Signup from './pages/SignUp';
import { useEffect } from 'react';

// Component to use the useLocation hook
function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  
  // Apply styles to prevent scrollbars on auth pages
  useEffect(() => {
    if (isAuthPage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAuthPage]);

  return (
    <div className={`${isAuthPage ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      {!isAuthPage && (
        <header className="p-4 border-b flex justify-between items-center bg-white">
          <Link to="/" className="text-xl font-bold">Animy</Link>
          <div className="flex items-center gap-4">
            <SignedOut>
              <Link to="/login" className="px-4 py-2 rounded text-blue-600 hover:bg-blue-50">Log In</Link>
              <Link to="/signup" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Sign Up</Link>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="px-4 py-2 rounded text-blue-600 hover:bg-blue-50">Dashboard</Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
        </header>
      )}
      
      <main className={isAuthPage ? 'h-full' : ''}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={
            <SignedOut>
              <Login />
            </SignedOut>
          } />
          <Route path="/signup" element={
            <SignedOut>
              <Signup />
            </SignedOut>
          } />
          <Route path="/dashboard" element={
            <>
              <SignedIn>
                <Dashboard />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

// Simple home component
function Home() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to Animy</h1>
      <p className="text-lg">Sign in or create an account to get started.</p>
    </div>
  );
}

// Dashboard component (protected, only for signed-in users)
function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Your Dashboard</h1>
      <p className="text-lg mb-4">Welcome to your personal dashboard!</p>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Protected Content</h2>
        <p>This content is only visible to authenticated users.</p>
      </div>
    </div>
  );
}