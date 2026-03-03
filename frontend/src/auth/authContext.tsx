import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/authApi';
import type { AuthUser } from '../services/authApi';

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(authAPI.getCurrentUser());

    useEffect(() => {
        if (authAPI.isAuthenticated()) {
            setUser(authAPI.getCurrentUser());
        } else {
            setUser(null);
        }
    
        const checkRole = async () => {
            if (!authAPI.isAuthenticated()) return;
            const oldRole = authAPI.getCurrentUser()?.role;
            await authAPI.refreshToken();
            const newRole = authAPI.getCurrentUser()?.role;
            if (oldRole && newRole && oldRole !== newRole) {
                try {
                    await authAPI.reLoginWithFreshToken();
                    setUser(authAPI.getCurrentUser());
                    // Force a hard refresh instead of programmatic redirect
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                } catch (err) {
                    console.error('Role change redirect failed:', err);
                    window.location.reload();
                }
            }
            
        };
    
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') checkRole();
        };
    
        window.addEventListener('focus', checkRole);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        const interval = setInterval(checkRole, 10_000);
    
        return () => {
            window.removeEventListener('focus', checkRole);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearInterval(interval);
        };
    }, []);

    const login = async (email: string, password: string) => {
        await authAPI.login(email, password);
        setUser(authAPI.getCurrentUser());
    };

    const register = async (email: string, password: string) => {
        await authAPI.register(email, password);
    };

    const logout = () => {
        authAPI.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user && authAPI.isAuthenticated(),
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
