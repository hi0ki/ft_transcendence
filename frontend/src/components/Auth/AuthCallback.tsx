import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthCallback: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            console.log('Login successful, saving token...');
            localStorage.setItem('auth_token', token);
            // Optional: You could fetch user data here if needed
            navigate('/chat');
        } else {
            console.error('No token found in callback URL');
            navigate('/login');
        }
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
        </div >
    );
};

export default AuthCallback;
