import { authAPI } from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

export interface BackendComment {
    id: number;
    postId: number;
    userId: number;
    content: string;
    createdAt: string;
    author?: {
        profile?: {
            username: string;
            avatarUrl: string | null;
        };
    };
}

export interface CommentDisplay {
    id: string;
    userId?: number;
    author: {
        name: string;
        handle: string;
        avatar: string;
    };
    timeAgo: string;
    content: string;
}

class CommentsAPI {
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

    private formatTimeAgo(isoDate: string): string {
        const now = new Date();
        const date = new Date(isoDate);
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) return 'Just now';
        if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
        if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
        if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
        return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) > 1 ? 's' : ''} ago`;
    }

    private transformComment(bc: BackendComment): CommentDisplay {
        const username = bc.author?.profile?.username || 'Anonymous';
        return {
            id: bc.id.toString(),
            userId: bc.userId,
            author: {
                name: username,
                handle: `@${username.toLowerCase()}`,
                avatar: bc.author?.profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${bc.userId}`,
            },
            timeAgo: this.formatTimeAgo(bc.createdAt),
            content: bc.content,
        };
    }

    async getCommentsByPost(postId: number): Promise<CommentDisplay[]> {
        const response = await fetch(`${API_BASE_URL}/comments/post/${postId}`, {
            method: 'GET',
            headers: this.getAuthHeader(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to fetch comments' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        const data: BackendComment[] = await response.json();
        return data.map((c) => this.transformComment(c));
    }

    async getCommentCount(postId: number): Promise<number> {
        const response = await fetch(`${API_BASE_URL}/comments/post/${postId}/count`, {
            method: 'GET',
            headers: this.getAuthHeader(),
        });

        if (!response.ok) {
            return 0;
        }

        return response.json();
    }

    async createComment(postId: number, content: string): Promise<CommentDisplay> {
        const response = await fetch(`${API_BASE_URL}/comments/`, {
            method: 'POST',
            headers: this.getAuthHeader(),
            body: JSON.stringify({ postId, content }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to create comment' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        const data: BackendComment = await response.json();
        return this.transformComment(data);
    }

    async updateComment(commentId: number, postId: number, content: string): Promise<CommentDisplay> {
        const response = await fetch(`${API_BASE_URL}/comments/update`, {
            method: 'PUT',
            headers: this.getAuthHeader(),
            body: JSON.stringify({ commentId, postId, content }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to update comment' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        const data: BackendComment = await response.json();
        return this.transformComment(data);
    }

    async deleteComment(commentId: number, postId: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/comments/${commentId}?postId=${postId}`, {
            method: 'DELETE',
            headers: this.getAuthHeader(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to delete comment' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }
    }
}

export const commentsAPI = new CommentsAPI();
