// Chat API service — connects to auth service REST endpoints for DB-backed chat

const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

// Helper to get auth token
function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

// ─── Types matching the DB schema ───

export interface UserProfile {
    username: string;
    fullName?: string;
    avatarUrl?: string;
}

export interface DBUser {
    id: number;
    email: string;
    profile?: UserProfile | null;
}

export interface DBMessage {
    id: number;
    conversationId: number;
    senderId: number;
    content: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    sender?: DBUser;
}

export interface DBConversation {
    id: number;
    user1: DBUser;
    user2: DBUser;
    createdAt: string;
    lastMessage?: DBMessage | null;
}

class ChatAPI {
    // All endpoints use /api/ prefix to route through nginx to auth_service
    private readonly BASE = `${API_BASE_URL}/api/chat`;

    // Get all registered users with their profiles
    async getUsers(): Promise<DBUser[]> {
        const response = await fetch(`${this.BASE}/users`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    }

    // Get a single user with profile
    async getUser(userId: number): Promise<DBUser> {
        const response = await fetch(`${this.BASE}/users/${userId}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch user');
        return response.json();
    }

    // Get all conversations for a user
    async getUserConversations(userId: number): Promise<DBConversation[]> {
        const response = await fetch(`${this.BASE}/user/${userId}/conversations`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch conversations');
        return response.json();
    }

    // Get messages for a conversation
    async getConversationMessages(conversationId: number): Promise<DBMessage[]> {
        const response = await fetch(`${this.BASE}/conversation/${conversationId}/messages`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch messages');
        return response.json();
    }

    // Find or create a conversation between two users
    async findOrCreateConversation(userId1: number, userId2: number): Promise<DBConversation> {
        const response = await fetch(`${this.BASE}/conversation/find-or-create`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ userId1, userId2 }),
        });
        if (!response.ok) throw new Error('Failed to create conversation');
        return response.json();
    }

    // Send a message via REST (backup — normally we use WebSocket)
    async sendMessage(conversationId: number, senderId: number, content: string): Promise<DBMessage> {
        const response = await fetch(`${this.BASE}/new-message`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                conversationId,
                senderId,
                content,
                type: 'TEXT',
            }),
        });
        if (!response.ok) throw new Error('Failed to send message');
        return response.json();
    }
}

export const chatAPI = new ChatAPI();
