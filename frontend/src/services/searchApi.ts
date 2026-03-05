import { authAPI, getAvatarSrc } from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

interface BackendPost {
    id: number;
    userId: number;
    type: 'HELP' | 'RESOURCE' | 'MEME';
    title: string;
    content: string;
    createdAt: string;
    imageUrl?: string;
    contentUrl?: string;
    user?: {
        id: number;
        email: string;
        profile?: {
            username: string;
            avatarUrl: string;
        };
    };
    _count?: {
        likes: number;
        comments: number;
    };
}

export interface Post {
    id: string;
    title: string;
    author: {
        name: string;
        handle: string;
        avatar: string;
    };
    timeAgo: string;
    content: string;
    tags?: string[];
    likes: number;
    comments: number;
    type?: 'Help' | 'Resource' | 'Meme';
    imageUrl?: string;
    contentUrl?: string;
}

export interface SearchParams {
    q?: string;
    type?: string;
    sortBy?: string;
    order?: string;
    page?: number;
    limit?: number;
}

export interface UserResult {
    userId: number;
    username: string;
    avatarUrl: string | null;
    bio: string | null;
    skills: string[];
}

export interface SearchResponse {
    data: Post[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface UserSearchResponse {
    data: UserResult[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

class SearchAPI {
    private transformPost(backendPost: BackendPost): Post {
        const currentUser = authAPI.getCurrentUser();
        const fallbackName = currentUser?.username || currentUser?.email?.split('@')[0] || 'Anonymous';

        const authorName = backendPost.user?.profile?.username || fallbackName;
        const authorHandle = `@${authorName.toLowerCase().replace(/\s+/g, '')}`;
        const authorAvatar = getAvatarSrc(backendPost.user?.profile?.avatarUrl, authorName);

        return {
            id: backendPost.id.toString(),
            title: backendPost.title,
            author: {
                name: authorName,
                handle: authorHandle,
                avatar: authorAvatar,
            },
            timeAgo: this.formatTimeAgo(backendPost.createdAt),
            content: backendPost.content,
            tags: [],
            likes: backendPost._count?.likes ?? 0,
            comments: backendPost._count?.comments ?? 0,
            type: this.capitalizeFirstLetter(backendPost.type) as 'Help' | 'Resource' | 'Meme',
            imageUrl: backendPost.imageUrl,
            contentUrl: backendPost.contentUrl,
        };
    }

    private capitalizeFirstLetter(str: string): string {
        return str.charAt(0) + str.slice(1).toLowerCase();
    }

    private formatTimeAgo(isoDate: string): string {
        const now = new Date();
        const postDate = new Date(isoDate);
        const diffMs = now.getTime() - postDate.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) return 'Just now';
        if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
        if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
        if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
        if (diffDay < 30) return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) > 1 ? 's' : ''} ago`;
        return `${Math.floor(diffDay / 30)} month${Math.floor(diffDay / 30) > 1 ? 's' : ''} ago`;
    }

    private getAuthHeader(): Record<string, string> {
        const token = authAPI.getToken();
        if (!token) {
            throw new Error('Not authenticated');
        }
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    }

    async search(params: SearchParams): Promise<SearchResponse> {
        const qs = new URLSearchParams();
        if (params.q) qs.set('q', params.q);
        if (params.type) qs.set('type', params.type);
        if (params.sortBy) qs.set('sortBy', params.sortBy);
        if (params.order) qs.set('order', params.order);
        if (params.page) qs.set('page', params.page.toString());
        if (params.limit) qs.set('limit', params.limit.toString());

        const response = await fetch(`${API_BASE_URL}/posts/search?${qs.toString()}`, {
            method: 'GET',
            headers: this.getAuthHeader(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Search failed' }));
            throw new Error(error.message || `HTTP ${response.status}: Search failed`);
        }

        const json = await response.json();
        return {
            data: json.data.map((p: BackendPost) => this.transformPost(p)),
            total: json.total,
            page: json.page,
            limit: json.limit,
            totalPages: json.totalPages,
        };
    }

    async searchUsers(params: { q?: string; page?: number; limit?: number }): Promise<UserSearchResponse> {
        const qs = new URLSearchParams();
        if (params.q) qs.set('q', params.q);
        if (params.page) qs.set('page', params.page.toString());
        if (params.limit) qs.set('limit', params.limit.toString());

        const response = await fetch(`${API_BASE_URL}/profiles/search?${qs.toString()}`, {
            method: 'GET',
            headers: this.getAuthHeader(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'User search failed' }));
            throw new Error(error.message || `HTTP ${response.status}: User search failed`);
        }

        return response.json();
    }
}

export const searchAPI = new SearchAPI();
