import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { authAPI } from './services/authApi'
import ChatApp from './components/Chat/ChatApp'
import Navbar from './components/Navbar/Navbar'
import Login from './components/Auth/Login'
import SignUp from './components/Auth/SignUp'
import FeedPage from './components/Feed/FeedPage'
import AuthCallback from './components/Auth/AuthCallback'
import ProfilePage from './components/Profile/ProfilePage'
import SettingsPage from './components/Settings/SettingsPage'
import './App.css'

function LoginPage() {
  const navigate = useNavigate();

  return (
    <Login
      onLoginSuccess={() => navigate('/home')}
      onSwitchToSignUp={() => navigate('/register')}
    />
  );
}

function RegisterPage() {
  const navigate = useNavigate();

  return (
    <SignUp
      onSignUpSuccess={() => navigate('/login')}
      onSwitchToLogin={() => navigate('/login')}
    />
  );
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  if (!authAPI.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = authAPI.getCurrentUser();

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <Navbar
        username={user?.email?.split('@')[0] || 'User'}
        onLogout={handleLogout}
      />
      <div className="app-content">
        {children}
      </div>
    </div>
  );
}

// Placeholder for other routes to prevent accidental logouts
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="placeholder-content" style={{ padding: '40px', color: 'white', width: '100%', height: '100%' }}>
    <h2>{title} Page</h2>
    <p>This is a placeholder for the {title.toLowerCase()} functionality.</p>
  </div>
);

function SettingsPageWrapper() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!authAPI.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = authAPI.getCurrentUser();

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}
      <Navbar
        username={user?.email?.split('@')[0] || 'User'}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="app-content">
        <header className="mobile-header">
          <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <span className="mobile-logo">Peer Hub</span>
        </header>
        <SettingsPage />
      </div>
    </div>
  );
}

function ProfilePageWrapper() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!authAPI.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = authAPI.getCurrentUser();

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}
      <Navbar
        username={user?.email?.split('@')[0] || 'User'}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="app-content">
        <header className="mobile-header">
          <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <span className="mobile-logo">Peer Hub</span>
        </header>
        <ProfilePage />
      </div>
    </div>
  );
}

function App() {
  const isAuthed = authAPI.isAuthenticated();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/callback" element={<AuthCallback />} />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to={isAuthed ? '/chat' : '/login'} replace />} />

        {/* Protected Routes */}
        <Route path="/home" element={<ProtectedLayout><FeedPage /></ProtectedLayout>} />
        <Route path="/chat" element={<ProtectedLayout><ChatApp /></ProtectedLayout>} />
        <Route path="/search" element={<ProtectedLayout><PlaceholderPage title="Search" /></ProtectedLayout>} />
        <Route path="/notifications" element={<ProtectedLayout><PlaceholderPage title="Notifications" /></ProtectedLayout>} />
        <Route path="/profile" element={<ProfilePageWrapper />} />
        <Route path="/profile/:username" element={<ProfilePageWrapper />} />
        <Route path="/settings" element={<SettingsPageWrapper />} />
        <Route path="/moderation" element={<ProtectedLayout><PlaceholderPage title="Moderation" /></ProtectedLayout>} />

        {/* Default redirect: if authed go to home, else login */}
        <Route
          path="*"
          element={<Navigate to={isAuthed ? '/home' : '/login'} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;