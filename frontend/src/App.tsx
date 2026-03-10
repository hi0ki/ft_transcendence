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
      // User logged out — disconnect cleanly
      if (socketService.isConnected()) {
        socketService.disconnect();
      }
      return;
    }

    // ✅ FIX: Only connect if not already connected OR connecting.
    // Previously this ran twice in React StrictMode (dev), calling connect()
    // twice — the second call killed the first socket immediately, causing
    // Jana's rapid connect/disconnect loop in the logs.
    if (socketService.isConnected()) {
      socketService.emit('request_online_users');
      return;
    }

    let cancelled = false;

    socketService.connect()
      .then(() => {
        if (!cancelled) {
          socketService.emit('request_online_users');
        }
      })
      .catch(() => { });

    const handleFocus = () => {
      if (socketService.isConnected()) {
        socketService.emit('request_online_users');
      } else if (!cancelled) {
        socketService.connect().catch(() => { });
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      // ✅ FIX: Mark as cancelled so the async connect() callback doesn't
      // emit after cleanup. Do NOT disconnect here — that would kill the
      // socket every time any component re-renders.
      cancelled = true;
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

  if (user?.role !== 'ADMIN') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#020617', color: '#94a3b8', fontSize: '1.1rem' }}>
        Access Denied — Admin only
      </div>
    );
  }

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
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    if (authAPI.isAuthenticated()) {
      setIsAuthed(true);
      return;
    }
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
      } catch (err) { }
    };

    const interval = setInterval(debouncedRefresh, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

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