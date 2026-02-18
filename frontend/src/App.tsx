import { useState } from 'react'
import { authAPI } from './services/authApi'
import ChatApp from './components/Chat/ChatApp'
import Navbar from './components/Navbar/Navbar'
import Login from './components/Auth/Login'
import SignUp from './components/Auth/SignUp'
import './App.css'

type Page = 'login' | 'signup' | 'chat';

function App() {
  const [page, setPage] = useState<Page>(
    authAPI.isAuthenticated() ? 'chat' : 'login'
  );

  const handleLoginSuccess = () => {
    setPage('chat');
  };

  const handleLogout = () => {
    authAPI.logout();
    setPage('login');
  };

  // Auth pages — no navbar
  if (page === 'login') {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignUp={() => setPage('signup')}
      />
    );
  }

  if (page === 'signup') {
    return (
      <SignUp
        onSignUpSuccess={() => setPage('login')}
        onSwitchToLogin={() => setPage('login')}
      />
    );
  }

  // Main app — with navbar
  const user = authAPI.getCurrentUser();

  return (
    <div className="app-layout">
      <Navbar
        username={user?.email?.split('@')[0] || 'User'}
        onNavigate={(id) => {
          if (id === 'messages') {
            // Already on chat
          }
        }}
        onLogout={handleLogout}
      />
      <div className="app-content">
        <ChatApp />
      </div>
    </div>
  )
}

export default App
