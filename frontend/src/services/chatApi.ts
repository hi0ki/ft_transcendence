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
    fileUrl?: string | null;
    isRead: boolean;
    deletedFor: number[];
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
    async getConversationMessages(conversationId: number, userId?: number): Promise<DBMessage[]> {
        const url = userId
            ? `${this.BASE}/conversation/${conversationId}/messages?userId=${userId}`
            : `${this.BASE}/conversation/${conversationId}/messages`;

        const response = await fetch(url, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch messages');
        return response.json();
    }

    // ... update deleteMessage ...
    async deleteMessage(messageId: number, userId: number, deleteType: string = 'FOR_ALL'): Promise<void> {
        const response = await fetch(`${this.BASE}/message/delete`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ messageId, userId, deleteType }),
        });
        if (!response.ok) throw new Error('Failed to delete message');
    }

    // Find or create a conversation between two users
    async findOrCreateConversation(userId1: number, userId2: number): Promise<DBConversation> {
        const response = await fetch(`${this.BASE}/conversation/find-or-create`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ userId1, userId2 }),
        });
        if (!response.ok) throw new Error('Failed to find or create conversation');
        return response.json();
    }

    // Send a message (text, image, video, voice, file)
    async sendMessage(conversationId: number, senderId: number, content?: string, type: string = 'TEXT', fileUrl?: string): Promise<DBMessage> {
        const response = await fetch(`${this.BASE}/new-message`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ conversationId, senderId, content: content || null, type, fileUrl: fileUrl || null }),
        });
        if (!response.ok) throw new Error('Failed to send message');
        return response.json();
    }

    // Upload a file (image, video, voice, document)
    async uploadFile(file: File | Blob, fileName?: string): Promise<{ fileUrl: string; fileName: string; fileSize: number; fileType: string; mimeType: string }> {
        const formData = new FormData();
        if (file instanceof Blob && !(file instanceof File)) {
            formData.append('file', file, fileName || 'voice-message.webm');
        } else {
            formData.append('file', file);
        }

        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${this.BASE}/upload`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
        });
        if (!response.ok) throw new Error('Failed to upload file');
        return response.json();
    }

    // Update a message
    async updateMessage(messageId: number, userId: number, content: string): Promise<DBMessage> {
        const response = await fetch(`${this.BASE}/message`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ messageId, userId, content }),
        });
        if (!response.ok) throw new Error('Failed to update message');
        return response.json();
    }

    // Delete an empty conversation (no messages)
    async deleteConversation(conversationId: number): Promise<void> {
        const response = await fetch(`${this.BASE}/conversation/${conversationId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete conversation');
    }
}

export const chatAPI = new ChatAPI();
