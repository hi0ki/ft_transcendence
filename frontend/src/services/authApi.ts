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

        localStorage.setItem(TOKEN_KEY, data.access_token);

        return data;
    }


    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }


    isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }

    async refreshToken(): Promise<void> {
        const token = this.getToken();
        if (!token) return;
    
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            if (response.status === 401 || response.status === 403) {
                this.logout();
                window.location.href = '/login';
                return;
            }
    
            if (!response.ok) return;
    
            const data = await response.json();
            localStorage.setItem(TOKEN_KEY, data.access_token);
        } catch {
            return;
        }
    }


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
                avatarUrl: null,
            };
        } catch {
            return null;
        }
    }

    async reLoginWithFreshToken(): Promise<void> {
        const token = this.getToken();
        if (!token) return;
    
        const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    
        if (!response.ok) {
            this.logout();
            window.location.href = '/login';
            return;
        }
    
        const data = await response.json();
        localStorage.setItem(TOKEN_KEY, data.access_token);
    }
    
  
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

 
    async getProfile(username: string): Promise<any | null> {
        const token = this.getToken();
        if (!token) return null;

        try {
            const response = await fetch(`${API_BASE_URL}/api/profiles/${username}`, {
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
            
         
            sessionStorage.removeItem('user_profile');
            
            return result;
        } catch {
            return null;
        }
    }



    logout(): void {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        sessionStorage.removeItem('user_profile');
    }
}

export const authAPI = new AuthAPI();


export function getAvatarSrc(avatarUrl: string | null | undefined, username: string): string {
    if (avatarUrl && avatarUrl.trim() !== '') return avatarUrl;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
}
