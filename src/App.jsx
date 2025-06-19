import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Signup from './pages/SignUp';
import SSOCallbackPage from './pages/SSOCallback';
import SignIn from './pages/SignIn';
import ForgotPassword from './pages/ForgotPassword';
import Layout from './pages/SideBar';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import BillingPage from './pages/BillingPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
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
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
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