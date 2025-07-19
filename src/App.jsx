import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Signup from './pages/auth/SignUp';
import SSOCallbackPage from './pages/auth/SSOCallback';
import SignIn from './pages/auth/SignIn';
import ForgotPassword from './pages/auth/ForgotPassword';
import Layout from './pages/SideBar';
import DashboardPage from './pages/DashboardPage';
import BillingPage from './pages/BillingPage';
import ProfilePage from './pages/ProfilePage';
import ChatSideBar from './pages/ChatSideBar';

function AppContent() {
  return (
    <div className="h-screen overflow-hidden">
      <main className="h-full">
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/sso-callback" element={<SSOCallbackPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="/chat" element={<ChatSideBar />} />
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