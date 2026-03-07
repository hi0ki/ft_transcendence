const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

// ← removed getAuthHeaders() entirely — cookies sent automatically

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
    private readonly BASE = `${API_BASE_URL}/api/chat`;

    async getUsers(): Promise<DBUser[]> {
        const response = await fetch(`${this.BASE}/users`, {
            credentials: 'include',             // ← replaced getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    }

    async getUser(userId: number): Promise<DBUser> {
        const response = await fetch(`${this.BASE}/users/${userId}`, {
            credentials: 'include',             // ← replaced getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch user');
        return response.json();
    }

    async getUserConversations(userId: number): Promise<DBConversation[]> {
        const response = await fetch(`${this.BASE}/user/${userId}/conversations`, {
            credentials: 'include',             // ← replaced getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch conversations');
        return response.json();
    }

    async getConversationMessages(conversationId: number, userId?: number): Promise<DBMessage[]> {
        const url = userId
            ? `${this.BASE}/conversation/${conversationId}/messages?userId=${userId}`
            : `${this.BASE}/conversation/${conversationId}/messages`;

        const response = await fetch(url, {
            credentials: 'include',             // ← replaced getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch messages');
        return response.json();
    }

    async deleteMessage(messageId: number, userId: number, deleteType: string = 'FOR_ALL'): Promise<void> {
        const response = await fetch(`${this.BASE}/message/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',             // ← replaced getAuthHeaders()
            body: JSON.stringify({ messageId, userId, deleteType }),
        });
        if (!response.ok) throw new Error('Failed to delete message');
    }

    async findOrCreateConversation(userId1: number, userId2: number): Promise<DBConversation> {
        const response = await fetch(`${this.BASE}/conversation/find-or-create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',             // ← replaced getAuthHeaders()
            body: JSON.stringify({ userId1, userId2 }),
        });
        if (!response.ok) throw new Error('Failed to find or create conversation');
        return response.json();
    }

    async sendMessage(conversationId: number, senderId: number, content?: string, type: string = 'TEXT', fileUrl?: string): Promise<DBMessage> {
        const response = await fetch(`${this.BASE}/new-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',             // ← replaced getAuthHeaders()
            body: JSON.stringify({ conversationId, senderId, content: content || null, type, fileUrl: fileUrl || null }),
        });
        if (!response.ok) throw new Error('Failed to send message');
        return response.json();
    }

    async uploadFile(file: File | Blob, fileName?: string): Promise<{ fileUrl: string; fileName: string; fileSize: number; fileType: string; mimeType: string }> {
        const formData = new FormData();
        if (file instanceof Blob && !(file instanceof File)) {
            formData.append('file', file, fileName || 'voice-message.webm');
        } else {
            formData.append('file', file);
        }

        const response = await fetch(`${this.BASE}/upload`, {
            method: 'POST',
            credentials: 'include',             // ← removed Authorization header, cookie handles it
            body: formData,
        });
        if (!response.ok) throw new Error('Failed to upload file');
        return response.json();
    }

    async updateMessage(messageId: number, userId: number, content: string): Promise<DBMessage> {
        const response = await fetch(`${this.BASE}/message`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',             // ← replaced getAuthHeaders()
            body: JSON.stringify({ messageId, userId, content }),
        });
        if (!response.ok) throw new Error('Failed to update message');
        return response.json();
    }

    async deleteConversation(conversationId: number): Promise<void> {
        const response = await fetch(`${this.BASE}/conversation/${conversationId}`, {
            method: 'DELETE',
            credentials: 'include',             // ← replaced getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete conversation');
    }
}

export const chatAPI = new ChatAPI();