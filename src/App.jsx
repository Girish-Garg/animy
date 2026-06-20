import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuthInit } from './hooks/useAuth';
import '../sentry.js';

// Route components are code-split so each page is a separate chunk instead of
// one large bundle.
const Signup = lazy(() => import('./pages/auth/SignUp'));
const SSOCallbackPage = lazy(() => import('./pages/auth/SSOCallback'));
const SignIn = lazy(() => import('./pages/auth/SignIn'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Layout = lazy(() => import('./pages/SideBar'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const BillingPage = lazy(() => import('./pages/BillingPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ChatSideBar = lazy(() => import('./pages/ChatSideBar'));

function RouteFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#070B14]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-[#0075FF]" />
    </div>
  );
}

function AppContent() {
  useAuthInit();

  return (
    <div className="h-screen overflow-hidden">
      <main className="h-full">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/sso-callback" element={<SSOCallbackPage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            {/* All protected routes live behind a single auth guard. */}
            <Route element={<RequireAuth />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
              <Route path="/chat/*" element={<ChatSideBar />} />
            </Route>
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
