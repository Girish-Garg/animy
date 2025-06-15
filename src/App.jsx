import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Signup from './pages/SignUp';
import SSOCallbackPage from './pages/SSOCallback';
import SignIn from './pages/SignIn';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/SideBar';
function AppContent() {
  return (
    <div className="h-screen overflow-hidden">
      <main className="h-full">
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/sso-callback" element={<SSOCallbackPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
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