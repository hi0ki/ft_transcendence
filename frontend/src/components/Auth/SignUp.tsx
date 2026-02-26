import React, { useState } from 'react';
import { authAPI } from '../../services/authApi';
import './Auth.css';

interface SignUpProps {
    onSignUpSuccess: () => void;
    onSwitchToLogin: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUpSuccess, onSwitchToLogin }) => {
    const [email, setEmail] = useState('');
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

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await authAPI.register(email, password);
            onSignUpSuccess();
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
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
                    <button type="button" className="auth-oauth-btn" onClick={() => handleOAuthClick('Google')}>
                        <span className="auth-oauth-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.83c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        </span>
                        <span>Continue with Google</span>
                    </button>
                    <button type="button" className="auth-oauth-btn" onClick={() => handleOAuthClick('42 Intra')}>
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
                    <span>OR CONTINUE WITH</span>
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
