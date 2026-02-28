import { authAPI } from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

export type ReactionType = 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD';

export const REACTION_EMOJI: Record<ReactionType, string> = {
    LIKE: '👍',
    LOVE: '❤️',
    HAHA: '😄',
    WOW: '😮',
    SAD: '😢',
};

export interface ReactionCounts {
    total: number;
    byType: Partial<Record<ReactionType, number>>;
}

export interface ToggleResult {
    action: 'created' | 'removed';
    reaction: { userId: number; postId: number; type: ReactionType } | null;
}

export interface ReactionWithUser {
    userId: number;
    postId: number;
    type: ReactionType;
    user: {
        id: number;
        email: string;
        profile?: {
            username: string;
            avatarUrl: string | null;
        };
    };
}

class ReactionsAPI {
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

    /** Toggle a reaction on a post (create or remove). */
    async toggle(postId: number, type: ReactionType): Promise<ToggleResult> {
        const response = await fetch(`${API_BASE_URL}/reactions/toggle`, {
            method: 'POST',
            headers: this.getAuthHeader(),
            body: JSON.stringify({ postId, type }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to toggle reaction' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /** Update reaction type on a post (e.g. LIKE → LOVE). */
    async update(postId: number, type: ReactionType): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/reactions/update`, {
            method: 'PUT',
            headers: this.getAuthHeader(),
            body: JSON.stringify({ postId, type }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to update reaction' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }
    }

    /** Get total reaction count for a post. */
    async getCount(postId: number): Promise<number> {
        try {
            const response = await fetch(`${API_BASE_URL}/reactions/post/${postId}/count`, {
                method: 'GET',
                headers: this.getAuthHeader(),
            });
            if (!response.ok) return 0;
            return response.json();
        } catch {
            return 0;
        }
    }

    /** Get all reactions for a post with user profiles. */
    async getReactionsByPost(postId: number): Promise<ReactionWithUser[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/reactions/post/${postId}`, {
                method: 'GET',
                headers: this.getAuthHeader(),
            });
            if (!response.ok) return [];
            return response.json();
        } catch {
            return [];
        }
    }

    /** Get the current user's reaction on a post. */
    async getMyReaction(postId: number): Promise<{ type: ReactionType } | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/reactions/mine/${postId}`, {
                method: 'GET',
                headers: this.getAuthHeader(),
            });
            if (!response.ok) return null;
            const data = await response.json();
            return data;
        } catch {
            return null;
        }
    }
}

export const reactionsAPI = new ReactionsAPI();
