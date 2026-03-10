import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/authApi';

const AuthCallback: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const hasError = params.get('error');

        if (hasError) {
            navigate('/login');
            return;
        }

        // Cookie is set by the backend — populate sessionStorage cache so
        // isAuthenticated() returns true before navigating to /home
        authAPI.fetchAndCacheUser().then((user) => {
            if (user) {
                navigate('/home');
            } else {
                navigate('/login');
            }
        });
    }, [location, navigate]);

    return (
        <div className="auth-callback" style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at 20% 20%, #1e1b4b 0%, #0f172a 40%, #020617 100%)',
            color: 'white',
            flexDirection: 'column',
            gap: '24px'
        }}>
            <div className="auth-spinner" style={{
                width: '40px',
                height: '40px',
                border: '4px solid rgba(255,255,255,0.05)',
                borderTop: '4px solid #6366f1',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }}></div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            <p>Completing login...</p>
        </div>
    );
};

export default AuthCallback;