import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
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
      onSignUpSuccess={() => navigate('/profile')}
      onSwitchToLogin={() => navigate('/login')}
    />
  );
}

/**
 * Global socket hook — ONLY manages connection lifecycle.
 * Online-user state is handled inside socketService via subscribeOnlineUsers.
 */
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
          // Socket is now connected — request the fresh online list immediately
          // instead of waiting up to 1s for the server's periodic broadcast.
          socketService.emit('request_online_users');
        })
        .catch((err: any) => {
          console.warn('Global socket connection failed:', err);
        });
    } else {
      // Already connected — request fresh online list immediately
      socketService.emit('request_online_users');
    }

    // Re-request when user focuses the tab
    const handleFocus = () => {
      if (socketService.isConnected()) {
        socketService.emit('request_online_users');
      } else if (isAuthenticated) {
        socketService.connect().catch(() => { });
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

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="placeholder-content" style={{ padding: '40px', color: 'white', width: '100%', height: '100%' }}>
    <h2>{title} Page</h2>
    <p>This is a placeholder for the {title.toLowerCase()} functionality.</p>
  </div>
);

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
  const [isAuthed, setIsAuthed] = useState(authAPI.isAuthenticated());

  const handleLoggedOut = () => setIsAuthed(false);
  const handleLoggedIn = () => setIsAuthed(true);

  // Connects / disconnects socket based on auth state
  useGlobalSocket(isAuthed);
  useHeartbeat(isAuthed);

  // ── FIX: Debounced token refresh to prevent 429 rate limiting errors ──
  useEffect(() => {
    let lastRefreshTime = 0;
    const REFRESH_COOLDOWN = 120000; // 120 seconds (2 minutes) between refresh calls

    const debouncedRefresh = async () => {
      if (!authAPI.isAuthenticated()) return;

      const now = Date.now();
      const timeSinceLastRefresh = now - lastRefreshTime;

      // If less than 120 seconds since last refresh, skip this attempt
      if (timeSinceLastRefresh < REFRESH_COOLDOWN) {
        return;
      }

      lastRefreshTime = now;
      try {
        await authAPI.refreshToken();
      } catch (err) {
        // Silently handle rate limit errors - token is probably still valid
        if (err instanceof Error && !err.message.includes('429')) {
          console.error('Token refresh failed:', err);
        }
      }
    };

    // DON'T refresh on load - just start the interval
    // debouncedRefresh(); ← Removed this

    // Check every 30 seconds (but actual refresh respects 120 second cooldown)
    const interval = setInterval(debouncedRefresh, 30 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
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
    </Router>
  );
}

export default App;
