const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

export interface AuthUser {
    id: number;
    email: string;
    role?: string;
    username?: string;
    avatarUrl?: string | null;
}

export interface RegisterResponse {
    id: number;
    email: string;
    username: string;
}

export interface UserProfile {
    username: string;
    bio?: string;
    avatarUrl?: string;
    skills?: string[];
}

class AuthAPI {

    async register(email: string, password: string, username: string): Promise<RegisterResponse> {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password, username }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        const data = await response.json();
        return data;
    }

    async login(email: string, password: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        await this.fetchAndCacheUser();
    }

    getToken(): string | null {
        return null;
    }

    isAuthenticated(): boolean {
        try {
            const cached = sessionStorage.getItem('auth_user');
            if (cached) {
                const user = JSON.parse(cached);
                return !!user?.id;
            }
            return false;
        } catch {
            return false;
        }
    }

    async refreshToken(): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                credentials: 'include',
            });

            if (response.status === 401 || response.status === 403) {
                this.logout();
                window.location.href = '/login';
                return;
            }

            if (!response.ok) return;

            await this.fetchAndCacheUser();
        } catch {
            return;
        }
    }

    async fetchAndCacheUser(): Promise<AuthUser | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/profiles/me`, {
                credentials: 'include',
            });
            if (!response.ok) return null;
            const data = await response.json();
            const user: AuthUser = {
                id: data.user?.id,
                email: data.user?.email,
                role: data.user?.role || 'USER',
                username: data.username,
                avatarUrl: data.avatarUrl || null,
            };
            sessionStorage.setItem('auth_user', JSON.stringify(user));
            return user;
        } catch {
            return null;
        }
    }

    getCurrentUser(): AuthUser | null {
        try {
            const cached = sessionStorage.getItem('auth_user');
            if (cached) return JSON.parse(cached);
            return null;
        } catch {
            return null;
        }
    }

    async reLoginWithFreshToken(): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            credentials: 'include',
        });

        if (!response.ok) {
            this.logout();
            window.location.href = '/login';
            return;
        }

        await this.fetchAndCacheUser();
    }

    async getMyProfile(): Promise<UserProfile | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/profiles/me`, {
                credentials: 'include',
            });
            if (!response.ok) return null;
            return await response.json();
        } catch {
            return null;
        }
    }

    async getProfile(username: string): Promise<any | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/profiles/${username}`, {
                credentials: 'include',
            });
            if (!response.ok) return null;
            return await response.json();
        } catch {
            return null;
        }
    }

    async updateProfile(data: {
        username?: string;
        bio?: string;
        skills?: string[];
        avatarUrl?: string | null;
    }): Promise<UserProfile | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/profiles`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to update profile' }));
                throw new Error(errorData.message || 'Failed to update profile');
            }

            sessionStorage.removeItem('user_profile');
            // Re-cache user in case username or avatar changed
            await this.fetchAndCacheUser();
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    async logout(): Promise<void> {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        }).catch(() => { });

        sessionStorage.removeItem('auth_user');
        sessionStorage.removeItem('user_profile');
    }
}

export const authAPI = new AuthAPI();

export function getAvatarSrc(avatarUrl: string | null | undefined, username: string): string {
    if (avatarUrl && avatarUrl.trim() !== '') return avatarUrl;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
}