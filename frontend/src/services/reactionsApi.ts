const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

export type ReactionType = 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD';

export const REACTION_EMOJI: Record<ReactionType, string> = {
    LIKE: '👍', LOVE: '❤️', HAHA: '😂', WOW: '😮', SAD: '😢',
};

export const REACTION_LABELS: Record<ReactionType, string> = {
    LIKE: 'Like', LOVE: 'Love', HAHA: 'Haha', WOW: 'Wow', SAD: 'Sad',
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
        profile?: { username: string; avatarUrl: string | null; };
    };
}

class ReactionsAPI {

    async toggle(postId: number, type: ReactionType): Promise<ToggleResult> {
        const response = await fetch(`${API_BASE_URL}/reactions/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ postId, type }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to toggle reaction' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }
        return response.json();
    }

    async update(postId: number, type: ReactionType): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/reactions/update`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ postId, type }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to update reaction' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }
    }

    async getCount(postId: number): Promise<number> {
        try {
            const response = await fetch(`${API_BASE_URL}/reactions/post/${postId}/count`, {
                credentials: 'include',
            });
            if (!response.ok) return 0;
            return response.json();
        } catch { return 0; }
    }

    async getReactionsByPost(postId: number): Promise<ReactionWithUser[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/reactions/post/${postId}`, {
                credentials: 'include',
            });
            if (!response.ok) return [];
            return response.json();
        } catch { return []; }
    }

    async getMyReaction(postId: number): Promise<{ type: ReactionType } | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/reactions/mine/${postId}`, {
                credentials: 'include',
            });
            if (!response.ok) return null;
            return await response.json();
        } catch { return null; }
    }
}

export const reactionsAPI = new ReactionsAPI();