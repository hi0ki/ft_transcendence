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
        profile?: { username: string; avatarUrl: string; };
    };
}

export interface Post {
    id: string;
    title: string;
    author: { name: string; handle: string; avatar: string; };
    timeAgo: string;
    content: string;
    tags?: string[];
    likes: number;
    comments: number;
    type?: 'Help' | 'Resource' | 'Meme';
    imageUrl?: string;
    contentUrl?: string;
}

export interface CreatePostPayload {
    type: 'HELP' | 'RESOURCE' | 'MEME';
    title: string;
    content: string;
    imageFile?: File;
    contentUrl?: string;
}

class PostsAPI {
    private toAbsoluteMediaUrl(url?: string): string | undefined {
        if (!url) return undefined;
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
        return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    }

    private transformPost(backendPost: BackendPost): Post {
        const currentUser = authAPI.getCurrentUser();
        const fallbackName = currentUser?.username || currentUser?.email?.split('@')[0] || 'Anonymous';
        const authorName = backendPost.user?.profile?.username || fallbackName;
        const authorHandle = `@${authorName.toLowerCase().replace(/\s+/g, '')}`;
        const authorAvatar = getAvatarSrc(backendPost.user?.profile?.avatarUrl, authorName);

        return {
            id: backendPost.id.toString(),
            title: backendPost.title,
            author: { name: authorName, handle: authorHandle, avatar: authorAvatar },
            timeAgo: this.formatTimeAgo(backendPost.createdAt),
            content: backendPost.content,
            tags: [],
            likes: 0,
            comments: 0,
            type: this.capitalizeFirstLetter(backendPost.type) as 'Help' | 'Resource' | 'Meme',
            imageUrl: this.toAbsoluteMediaUrl(backendPost.imageUrl),
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

    async getAllPosts(): Promise<Post[]> {
        const response = await fetch(`${API_BASE_URL}/posts/`, {
            credentials: 'include',
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to fetch posts' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }
        const data: BackendPost[] = await response.json();
        return data.map(post => this.transformPost(post));
    }

    async getPost(id: string): Promise<Post> {
        const response = await fetch(`${API_BASE_URL}/posts/detail/${id}`, {
            credentials: 'include',
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to fetch post' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }
        const data: BackendPost = await response.json();
        return this.transformPost(data);
    }

    async createPost(payload: CreatePostPayload): Promise<Post> {
        const formData = new FormData();
        formData.append('type', payload.type);
        formData.append('title', payload.title);
        formData.append('content', payload.content);
        if (payload.contentUrl) formData.append('contentUrl', payload.contentUrl);
        if (payload.imageFile) formData.append('image', payload.imageFile);

        const response = await fetch(`${API_BASE_URL}/posts/`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to create post' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }
        const data: BackendPost = await response.json();
        return this.transformPost(data);
    }

    async updatePost(id: string, payload: { title?: string; content?: string; imageUrl?: string; contentUrl?: string }): Promise<Post> {
        const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to update post' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }
        const data: BackendPost = await response.json();
        return this.transformPost(data);
    }

    async deletePost(id: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to delete post' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }
    }
}

export const postsAPI = new PostsAPI();