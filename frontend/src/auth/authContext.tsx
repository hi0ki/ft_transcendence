import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/authApi';
import type { AuthUser } from '../services/authApi';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
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

    let lastRefreshTime = 0;
    let refreshTimeout: NodeJS.Timeout | null = null;
    const REFRESH_COOLDOWN = 120000;

    // ✅ Instant role-change handler — no throttle, no debounce
    const handleRoleChange = async () => {
      if (!authAPI.isAuthenticated()) return;

      try {
        const oldRole = authAPI.getCurrentUser()?.role;
        await authAPI.refreshToken();
        const newRole = authAPI.getCurrentUser()?.role;

        if (oldRole && newRole && oldRole !== newRole) {
          try {
            await authAPI.reLoginWithFreshToken();
            setUser(authAPI.getCurrentUser());
            // Removed the 500ms setTimeout — reload happens immediately
            window.location.reload();
          } catch (err) {
            console.error('Role change redirect failed:', err);
            window.location.reload();
          }
        }
      } catch (err) {
        console.error('Token refresh failed during role check:', err);
      }
    };

    // ✅ Throttled refresh for routine background checks (unchanged behavior)
    const debouncedCheckRole = async () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);

      const now = Date.now();
      const timeSinceLastRefresh = now - lastRefreshTime;

      if (timeSinceLastRefresh < REFRESH_COOLDOWN) {
        const delay = REFRESH_COOLDOWN - timeSinceLastRefresh;
        refreshTimeout = setTimeout(() => {
          debouncedCheckRole();
        }, delay);
        return;
      }

      lastRefreshTime = now;
      if (!authAPI.isAuthenticated()) return;

      try {
        const oldRole = authAPI.getCurrentUser()?.role;
        await authAPI.refreshToken();
        const newRole = authAPI.getCurrentUser()?.role;

        if (oldRole && newRole && oldRole !== newRole) {
          // Delegate to the instant handler
          await handleRoleChange();
        }
      } catch (err) {
        console.error('Token refresh failed:', err);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // ✅ Use instant handler on tab focus/visibility — no cooldown delay
        handleRoleChange();
      }
    };

    // ✅ Focus also triggers instant role check
    window.addEventListener('focus', handleRoleChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Background interval still uses throttled version (fine for periodic checks)
    const interval = setInterval(debouncedCheckRole, 10_000);

    return () => {
      window.removeEventListener('focus', handleRoleChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
      if (refreshTimeout) clearTimeout(refreshTimeout);
    };
  }, []);

  const login = async (email: string, password: string) => {
    await authAPI.login(email, password);
    setUser(authAPI.getCurrentUser());
  };

  const register = async (email: string, password: string, username: string) => {
    await authAPI.register(email, password, username);
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