import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { authAPI } from './services/authApi'
import { socketService } from './services/socketService'
import ChatApp from './components/Chat/ChatApp'
import Navbar from './components/Navbar/Navbar'
import Login from './components/Auth/Login'
import SignUp from './components/Auth/SignUp'
import FeedPage from './components/Feed/FeedPage'
import AuthCallback from './components/Auth/AuthCallback'
import ProfilePage from './components/Profile/ProfilePage'
import SettingsPage from './components/Settings/SettingsPage'
import { useHeartbeat } from './hooks/useHeartbeat'
import AdminPage from './components/Admin/AdminPage'
import { PrivacyPolicyPage, TermsOfServicePage } from './components/Legal/LegalPages'
import SearchPage from './components/Search/SearchPage'
import './App.css'

function LoginPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const navigate = useNavigate();
  return (
    <Login
      onLoginSuccess={() => { onLoginSuccess(); navigate('/home'); }}
      onSwitchToSignUp={() => navigate('/register')}
    />
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  return (
    <SignUp
      onSignUpSuccess={() => navigate('/home')}
      onSwitchToLogin={() => navigate('/login')}
    />
  );
}

function useGlobalSocket(isAuthenticated: boolean) {
  useEffect(() => {
    if (!isAuthenticated) {
      if (socketService.isConnected()) {
        socketService.disconnect();
      }
      return;
    }

    if (!socketService.isConnected()) {
      socketService.connect()
        .then(() => {
          socketService.emit('request_online_users');
        })
        .catch((err: any) => {});
    } else {
      socketService.emit('request_online_users');
    }

    const handleFocus = () => {
      if (socketService.isConnected()) {
        socketService.emit('request_online_users');
      } else if (isAuthenticated) {
        socketService.connect().catch(() => {});
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated]);
}

function ProtectedLayout({
  children,
  onLogout,
}: {
  children: React.ReactNode;
  onLogout?: () => void;
}) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = authAPI.getCurrentUser();

  const handleLogout = () => {
    socketService.disconnect();
    authAPI.logout();
    onLogout?.();
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
        {children}
      </div>
    </div>
  );
}

function SettingsPageWrapper({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!authAPI.isAuthenticated()) return <Navigate to="/login" replace />;

  const user = authAPI.getCurrentUser();

  const handleLogout = () => {
    socketService.disconnect();
    authAPI.logout();
    onLogout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}
      <Navbar username={user?.email?.split('@')[0] || 'User'} onLogout={handleLogout} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
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

function ProfilePageWrapper({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!authAPI.isAuthenticated()) return <Navigate to="/login" replace />;

  const user = authAPI.getCurrentUser();

  const handleLogout = () => {
    socketService.disconnect();
    authAPI.logout();
    onLogout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}
      <Navbar username={user?.email?.split('@')[0] || 'User'} onLogout={handleLogout} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
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

function AdminPageWrapper() {
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
        <AdminPage />
      </div>
    </div>
  );
}

function App() {
  // null = still checking, true/false = resolved
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    // If sessionStorage already has the user (e.g. same-tab navigation), use it immediately
    if (authAPI.isAuthenticated()) {
      setIsAuthed(true);
      return;
    }
    // Otherwise try to hydrate from the cookie (e.g. page refresh or return visit)
    authAPI.fetchAndCacheUser().then((user) => {
      setIsAuthed(!!user);
    });
  }, []);

  const handleLoggedOut = () => setIsAuthed(false);
  const handleLoggedIn = () => setIsAuthed(true);

  useGlobalSocket(!!isAuthed);
  useHeartbeat(!!isAuthed);

  useEffect(() => {
    let lastRefreshTime = 0;
    const REFRESH_COOLDOWN = 120000;

    const debouncedRefresh = async () => {
      if (!authAPI.isAuthenticated()) return;
      const now = Date.now();
      if (now - lastRefreshTime < REFRESH_COOLDOWN) return;
      lastRefreshTime = now;
      try {
        await authAPI.refreshToken();
      } catch (err) {}
    };

    const interval = setInterval(debouncedRefresh, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Wait for auth check to complete before rendering routes
  // This prevents the flicker where protected routes redirect to /login
  if (isAuthed === null) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#020617',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid rgba(255,255,255,0.05)',
          borderTop: '3px solid #6366f1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoggedIn} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/callback" element={<AuthCallback />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />

        <Route path="/" element={<Navigate to={isAuthed ? '/chat' : '/login'} replace />} />

        <Route path="/home" element={<ProtectedLayout onLogout={handleLoggedOut}><FeedPage /></ProtectedLayout>} />
        <Route path="/chat" element={<ProtectedLayout onLogout={handleLoggedOut}><ChatApp /></ProtectedLayout>} />
        <Route path="/search" element={<ProtectedLayout onLogout={handleLoggedOut}><SearchPage /></ProtectedLayout>} />
        <Route path="/profile" element={<ProfilePageWrapper onLogout={handleLoggedOut} />} />
        <Route path="/profile/:username" element={<ProfilePageWrapper onLogout={handleLoggedOut} />} />
        <Route path="/settings" element={<SettingsPageWrapper onLogout={handleLoggedOut} />} />
        <Route path="/moderation" element={<AdminPageWrapper />} />

        <Route path="*" element={<Navigate to={isAuthed ? '/home' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;