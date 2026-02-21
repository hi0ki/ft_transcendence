import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { authAPI } from './services/authApi'
import ChatApp from './components/Chat/ChatApp'
import Navbar from './components/Navbar/Navbar'
import Login from './components/Auth/Login'
import SignUp from './components/Auth/SignUp'
import './App.css'

function LoginPage() {
  const navigate = useNavigate();

  return (
    <Login
      onLoginSuccess={() => navigate('/chat')}
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

function ChatPage() {
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
        onNavigate={(id) => {
          if (id === 'messages') {
            // already on chat
          }
        }}
        onLogout={handleLogout}
      />
      <div className="app-content">
        <ChatApp />
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
        <Route path="/chat" element={<ChatPage />} />
        {/* Default redirect: if authed go to chat, else login */}
        <Route
          path="*"
          element={<Navigate to={isAuthed ? '/chat' : '/login'} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App
