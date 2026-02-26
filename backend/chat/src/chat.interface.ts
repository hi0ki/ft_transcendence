export interface ConnectedUser {
    socketId: string;
    userId: number;
    email: string;
    username?: string;
}

export interface DBUser {
    id: number;
    email: string;
    profile?: {
        username: string;
        avatarUrl?: string;
    };
}

export interface DBConversation {
    id: number;
    user1: DBUser;
    user2: DBUser;
    createdAt: string;
    lastMessage?: DBMessage | null;
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
