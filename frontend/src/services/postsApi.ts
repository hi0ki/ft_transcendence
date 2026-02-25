

import { authAPI } from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

interface BackendPost {
    id: number;
    userId: number;
    type: 'HELP' | 'RESOURCE' | 'MEME';
    title: string;
    content: string;
    createdAt: string;
    user?: {
        id: number;
        email: string;
        profile?: {
            username: string;
            avatarUrl: string;
        };
    };
}


export interface Post {
    id: string;
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
}


export interface CreatePostPayload {
    type: 'HELP' | 'RESOURCE' | 'MEME';
    content: string;
}

class PostsAPI {

    private transformPost(backendPost: BackendPost): Post {
        // Get current user's username from JWT as fallback
        const currentUser = authAPI.getCurrentUser();
        const fallbackName = currentUser?.username || currentUser?.email?.split('@')[0] || 'Anonymous';

        const authorName = backendPost.user?.profile?.username || fallbackName;
        const authorHandle = `@${authorName.toLowerCase().replace(/\s+/g, '')}`;
        const authorAvatar = backendPost.user?.profile?.avatarUrl
            || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorName}`;

        return {
            id: backendPost.id.toString(),
            author: {
                name: authorName,
                handle: authorHandle,
                avatar: authorAvatar
            },
            timeAgo: this.formatTimeAgo(backendPost.createdAt),
            content: backendPost.content,
            tags: [],
            likes: 0,
            comments: 0,
            type: this.capitalizeFirstLetter(backendPost.type) as 'Help' | 'Resource' | 'Meme'
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
            'Content-Type': 'application/json'
        };
    }


    async getAllPosts(): Promise<Post[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/posts/`, {
                method: 'GET',
                headers: this.getAuthHeader()
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Failed to fetch posts' }));
                throw new Error(error.message || `HTTP ${response.status}: Failed to fetch posts`);
            }

            const data: BackendPost[] = await response.json();
            return data.map(post => this.transformPost(post));
        } catch (error) {
            console.error('Error fetching posts:', error);
            throw error;
        }
    }

    async getPost(id: string): Promise<Post> {
        try {
            const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
                method: 'GET',
                headers: this.getAuthHeader()
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Failed to fetch post' }));
                throw new Error(error.message || `HTTP ${response.status}: Failed to fetch post`);
            }

            const data: BackendPost = await response.json();
            return this.transformPost(data);
        } catch (error) {
            console.error('Error fetching post:', error);
            throw error;
        }
    }


    async createPost(payload: CreatePostPayload): Promise<Post> {
        try {
            const response = await fetch(`${API_BASE_URL}/posts/`, {
                method: 'POST',
                headers: this.getAuthHeader(),
                body: JSON.stringify({
                    type: payload.type,
                    title: payload.content.substring(0, 100),
                    content: payload.content
                })
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Failed to create post' }));
                throw new Error(error.message || `HTTP ${response.status}: Failed to create post`);
            }

            const data: BackendPost = await response.json();
            return this.transformPost(data);
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    }


    async updatePost(id: string, payload: { title?: string; content?: string }): Promise<Post> {
        try {
            const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
                method: 'PATCH',
                headers: this.getAuthHeader(),
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Failed to update post' }));
                throw new Error(error.message || `HTTP ${response.status}: Failed to update post`);
            }

            const data: BackendPost = await response.json();
            return this.transformPost(data);
        } catch (error) {
            console.error('Error updating post:', error);
            throw error;
        }
    }


    async deletePost(id: string): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeader()
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Failed to delete post' }));
                throw new Error(error.message || `HTTP ${response.status}: Failed to delete post`);
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            throw error;
        }
    }
}

export const postsAPI = new PostsAPI();
