const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

export interface PendingRequest {
    senderId: number;
    username: string;
    avatarUrl: string | null;
    createdAt: string;
}

export interface Friend {
    id: number;
    username: string;
    avatarUrl: string | null;
}

export type FriendshipStatus = 'NONE' | 'PENDING' | 'ACCEPTED' | 'BLOCKED' | 'SELF';

export interface FriendshipStatusResponse {
    status: FriendshipStatus;
    requestedBy?: number;
}

class FriendsAPI {
    // ← removed headers() method entirely

    async sendRequest(targetUserId: number): Promise<{ message: string }> {
        const res = await fetch(`${API_BASE_URL}/api/friends/request/${targetUserId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',             // ← replaced this.headers()
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to send friend request');
        }
        return res.json();
    }

    async acceptRequest(senderId: number): Promise<{ message: string }> {
        const res = await fetch(`${API_BASE_URL}/api/friends/accept/${senderId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',             // ← replaced this.headers()
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to accept friend request');
        }
        return res.json();
    }

    async rejectRequest(senderId: number): Promise<{ message: string }> {
        const res = await fetch(`${API_BASE_URL}/api/friends/reject/${senderId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',             // ← replaced this.headers()
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to reject friend request');
        }
        return res.json();
    }

    async getPendingRequests(): Promise<PendingRequest[]> {
        const res = await fetch(`${API_BASE_URL}/api/friends/pending`, {
            credentials: 'include',             // ← replaced this.headers()
        });
        if (!res.ok) return [];
        return res.json();
    }

    async getFriends(): Promise<Friend[]> {
        const res = await fetch(`${API_BASE_URL}/api/friends`, {
            credentials: 'include',             // ← replaced this.headers()
        });
        if (!res.ok) return [];
        return res.json();
    }

    async removeFriend(friendId: number): Promise<{ message: string }> {
        const res = await fetch(`${API_BASE_URL}/api/friends/${friendId}`, {
            method: 'DELETE',
            credentials: 'include',             // ← replaced this.headers()
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to remove friend');
        }
        return res.json();
    }

    async getFriendsByUser(userId: number): Promise<Friend[]> {
        const res = await fetch(`${API_BASE_URL}/api/friends/user/${userId}`, {
            credentials: 'include',             // ← replaced this.headers()
        });
        if (!res.ok) return [];
        return res.json();
    }

    async getStatus(targetUserId: number): Promise<FriendshipStatusResponse> {
        const res = await fetch(`${API_BASE_URL}/api/friends/status/${targetUserId}`, {
            credentials: 'include',             // ← replaced this.headers()
        });
        if (!res.ok) return { status: 'NONE' };
        return res.json();
    }
}

export const friendsAPI = new FriendsAPI();