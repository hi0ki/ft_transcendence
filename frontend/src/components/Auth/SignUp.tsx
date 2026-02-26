import React, { useState } from 'react';
import { authAPI } from '../../services/authApi';
import './Auth.css';

interface SignUpProps {
    onSignUpSuccess: () => void;
    onSwitchToLogin: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUpSuccess, onSwitchToLogin }) => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
    
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
    
        if (username.length < 3 || username.length > 20) {
            setError('Username must be between 3 and 20 characters');
            return;
        }
    
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            setError('Username can only contain letters, numbers, and underscores');
            return;
        }
    
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
    
        setLoading(true);
    
        try {
            // 1️⃣ Register user
            await authAPI.register(email, password, username);
    
            // 2️⃣ Automatically log them in
            await authAPI.login(email, password);
    
            // 3️⃣ Now they are authenticated → go to home
            onSignUpSuccess();
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleOAuthClick = () => {
        window.location.href = 'http://localhost:8080/auth/42';
    };

    return (
        <div className="auth-page">
            <div className="auth-hero">
                <div className="auth-logo">
                    <div className="auth-logo-box">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M8 7h6" /><path d="M8 11h8" /></svg>
                    </div>
                </div>
                <h1 className="auth-title">Peer Study Hub</h1>
                <p className="auth-subtitle">Connect. Learn. Grow Together.</p>
            </div>

            <div className="auth-card">
                <h2 className="auth-card-title">Create Account</h2>
                <p className="auth-card-subtitle">Join the community and start learning</p>

                <div className="auth-oauth">
                    <button type="button" className="auth-oauth-btn" onClick={handleOAuthClick}>
                        <span className="auth-oauth-icon">
                            <svg width="20" height="20" viewBox="0 -200 960 960" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <polygon points="32,412.6 362.1,412.6 362.1,578 526.8,578 526.8,279.1 197.3,279.1 526.8,-51.1 362.1,-51.1 32,279.1" />
                                <polygon points="597.9,114.2 762.7,-51.1 597.9,-51.1" />
                                <polygon points="762.7,114.2 597.9,279.1 597.9,443.9 762.7,443.9 762.7,279.1 928,114.2 928,-51.1 762.7,-51.1" />
                                <polygon points="928,279.1 762.7,443.9 928,443.9" />
                            </svg>
                        </span>
                        <span>Continue with 42 Intra</span>
                    </button>
                </div>

                <div className="auth-divider">
                    <span>OR SIGN UP WITH EMAIL</span>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>

                    <div className="auth-field">
                        <label htmlFor="signup-email">Email</label>
                        <input
                            id="signup-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="signup-username">Username</label>
                        <input
                            id="signup-username"
                            type="text"
                            placeholder="your_username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase())}
                            minLength={3}
                            maxLength={20}
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="signup-password">Password</label>
                        <input
                            id="signup-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="signup-confirm">Confirm Password</label>
                        <input
                            id="signup-confirm"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account? <button type="button" className="auth-switch-link" onClick={onSwitchToLogin}>Sign In</button>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
