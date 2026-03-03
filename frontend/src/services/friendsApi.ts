import { authAPI } from './authApi';

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

export type FriendshipStatus =
    | 'NONE'
    | 'PENDING'
    | 'ACCEPTED'
    | 'BLOCKED'
    | 'SELF';

export interface FriendshipStatusResponse {
    status: FriendshipStatus;
    requestedBy?: number;
}

class FriendsAPI {
    private headers() {
        const token = authAPI.getToken();
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        };
    }

    /** Send a friend request to targetUserId */
    async sendRequest(targetUserId: number): Promise<{ message: string }> {
        const res = await fetch(`${API_BASE_URL}/api/friends/request/${targetUserId}`, {
            method: 'POST',
            headers: this.headers(),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to send friend request');
        }
        return res.json();
    }

    /** Accept an incoming friend request from senderId */
    async acceptRequest(senderId: number): Promise<{ message: string }> {
        const res = await fetch(`${API_BASE_URL}/api/friends/accept/${senderId}`, {
            method: 'POST',
            headers: this.headers(),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to accept friend request');
        }
        return res.json();
    }

    /** Reject / cancel a friend request from senderId */
    async rejectRequest(senderId: number): Promise<{ message: string }> {
        const res = await fetch(`${API_BASE_URL}/api/friends/reject/${senderId}`, {
            method: 'DELETE',
            headers: this.headers(),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to reject friend request');
        }
        return res.json();
    }

    /** Get incoming pending friend requests */
    async getPendingRequests(): Promise<PendingRequest[]> {
        const res = await fetch(`${API_BASE_URL}/api/friends/pending`, {
            headers: this.headers(),
        });
        if (!res.ok) return [];
        return res.json();
    }

    /** Get accepted friends list */
    async getFriends(): Promise<Friend[]> {
        const res = await fetch(`${API_BASE_URL}/api/friends`, {
            headers: this.headers(),
        });
        if (!res.ok) return [];
        return res.json();
    }

    /** Remove an accepted friend */
    async removeFriend(friendId: number): Promise<{ message: string }> {
        const res = await fetch(`${API_BASE_URL}/api/friends/${friendId}`, {
            method: 'DELETE',
            headers: this.headers(),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to remove friend');
        }
        return res.json();
    }

    /** Get friends list of any user by their id */
    async getFriendsByUser(userId: number): Promise<Friend[]> {
        const res = await fetch(`${API_BASE_URL}/api/friends/user/${userId}`, {
            headers: this.headers(),
        });
        if (!res.ok) return [];
        return res.json();
    }

    /** Get friendship status between current user and targetUserId */
    async getStatus(targetUserId: number): Promise<FriendshipStatusResponse> {
        const res = await fetch(`${API_BASE_URL}/api/friends/status/${targetUserId}`, {
            headers: this.headers(),
        });
        if (!res.ok) return { status: 'NONE' };
        return res.json();
    }
}

export const friendsAPI = new FriendsAPI();
