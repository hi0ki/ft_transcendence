// Auth API service — connects to backend auth endpoints

const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface AuthUser {
    id: number;
    email: string;
    role?: string;
    username?: string;
    avatarUrl?: string | null;
}

export interface LoginResponse {
    access_token: string;
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
    // Register a new user
    async register(email: string, password: string, username: string): Promise<RegisterResponse> {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, username }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        return response.json();
    }

    // Login and get JWT token
    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        const data: LoginResponse = await response.json();

        // Store token
        localStorage.setItem(TOKEN_KEY, data.access_token);

        return data;
    }

    // Get stored token
    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    // Check if user is authenticated
    isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) return false;

        // Check if token is expired (decode JWT payload)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }

    // Get current user info from token
    getCurrentUser(): AuthUser | null {
        const token = this.getToken();
        if (!token) return null;
    
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                id: payload.id,
                email: payload.email,
                role: payload.role || 'USER',
                username: payload.username,
                avatarUrl: null, // ← always get avatarUrl from getMyProfile() instead
            };
        } catch {
            return null;
        }
    }

    // Fetch current user's profile (including avatarUrl) from the backend
    async getMyProfile(): Promise<UserProfile | null> {
        const token = this.getToken();
        if (!token) return null;

        try {
            const response = await fetch(`${API_BASE_URL}/api/profiles/me`, {
                headers: { Authorization: `Bearer ${token}` },
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
        const token = this.getToken();
        if (!token) return null;
    
        try {
            const response = await fetch(`${API_BASE_URL}/api/profiles`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) return null;
            const result = await response.json();
            
            // ← Clear cache so Navbar fetches fresh profile with new avatar
            sessionStorage.removeItem('user_profile');
            
            return result;
        } catch {
            return null;
        }
    }


    // Logout — clear stored data
    logout(): void {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        sessionStorage.removeItem('user_profile');
    }
}

export const authAPI = new AuthAPI();

/**
 * Returns the correct avatar src:
 * - uses avatarUrl if it exists and is non-empty
 * - otherwise falls back to a DiceBear avatar seeded by username
 */
export function getAvatarSrc(avatarUrl: string | null | undefined, username: string): string {
    if (avatarUrl && avatarUrl.trim() !== '') return avatarUrl;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
}
