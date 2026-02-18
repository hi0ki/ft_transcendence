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

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password requirements
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])/.test(password)) {
            setError('Password must contain uppercase, lowercase, and special character');
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
                    <div className="auth-logo-icon">
                        <span className="auth-logo-book">📚</span>
                    </div>
                </div>
                <h1 className="auth-title">Peer Study Hub</h1>
                <p className="auth-subtitle">Connect. Learn. Grow Together.</p>
            </div>

            <div className="auth-card">
                <h2 className="auth-card-title">Create Account</h2>
                <p className="auth-card-subtitle">Join the community and start learning</p>

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

                <div className="auth-divider">
                    <span>OR CONTINUE WITH</span>
                </div>

                {error && (
                    <div className="auth-error">
                        <span>⚠️</span> {error}
                    </div>
                )}

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
                            autoComplete="email"
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
                            autoComplete="new-password"
                        />
                        <span className="auth-field-hint">
                            Min 6 chars, uppercase, lowercase, and special character
                        </span>
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
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{' '}
                    <button type="button" className="auth-switch-link" onClick={onSwitchToLogin}>
                        Sign In
                    </button>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
