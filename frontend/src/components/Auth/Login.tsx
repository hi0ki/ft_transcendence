import React, { useState } from 'react';
import { authAPI } from '../../services/authApi';
import './Auth.css';

interface LoginProps {
    onLoginSuccess: () => void;
    onSwitchToSignUp: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onSwitchToSignUp }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authAPI.login(email, password);
            onLoginSuccess();
        } catch (err: any) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthClick = (provider: string) => {
        alert(`${provider} authentication coming soon!`);
    };

    return (
        <div className="auth-page">
            <div className="auth-hero">
                {/* Logo */}
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <span className="auth-logo-book">📚</span>
                    </div>
                </div>
                <h1 className="auth-title">Peer Study Hub</h1>
                <p className="auth-subtitle">Connect. Learn. Grow Together.</p>
            </div>

            <div className="auth-card">
                <h2 className="auth-card-title">Welcome Back</h2>
                <p className="auth-card-subtitle">Sign in to continue your learning journey</p>

                {/* OAuth Buttons */}
                <div className="auth-oauth">
                    <button
                        type="button"
                        className="auth-oauth-btn"
                        onClick={() => handleOAuthClick('Google')}
                    >
                        <span className="auth-oauth-icon auth-google-icon">G</span>
                        <span>Continue with Google</span>
                    </button>
                    <button
                        type="button"
                        className="auth-oauth-btn"
                        onClick={() => handleOAuthClick('42 Intra')}
                    >
                        <span className="auth-oauth-icon auth-42-icon">42</span>
                        <span>Continue with 42 Intra</span>
                    </button>
                </div>

                {/* Divider */}
                <div className="auth-divider">
                    <span>OR CONTINUE WITH</span>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="auth-error">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {/* Login Form */}
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <p className="auth-switch">
                    Don't have an account?{' '}
                    <button type="button" className="auth-switch-link" onClick={onSwitchToSignUp}>
                        Sign Up
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
