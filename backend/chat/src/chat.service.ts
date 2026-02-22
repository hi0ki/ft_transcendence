import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConnectedUser, DBConversation, DBMessage } from './chat.interface';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);

    // socketId -> ConnectedUser mapping (online tracking)
    private connectedUsers: Map<string, ConnectedUser> = new Map();

    // Auth service base URL (internal Docker network)
    private readonly AUTH_SERVICE_URL = 'http://auth_service:3000';

    constructor(private readonly httpService: HttpService) { }

    // ─── Online User Tracking ───

    addConnectedUser(socketId: string, userId: number, email: string, username?: string): ConnectedUser {
        const user: ConnectedUser = { socketId, userId, email, username };
        this.connectedUsers.set(socketId, user);
        this.logger.log(`User connected: ${username || email} (userId: ${userId}, socketId: ${socketId})`);
        return user;
    }

    removeConnectedUser(socketId: string): ConnectedUser | undefined {
        const user = this.connectedUsers.get(socketId);
        if (user) {
            this.connectedUsers.delete(socketId);
            this.logger.log(`User disconnected: ${user.username || user.email} (userId: ${user.userId})`);
        }
        return user;
    }

    getConnectedUser(socketId: string): ConnectedUser | undefined {
        return this.connectedUsers.get(socketId);
    }

    getAllConnectedUsers(): ConnectedUser[] {
        return Array.from(this.connectedUsers.values());
    }

    getOnlineUserIds(): number[] {
        return Array.from(this.connectedUsers.values()).map(u => u.userId);
    }

    // Find socket ID for a given userId (for targeting messages)
    getSocketIdForUser(userId: number): string | undefined {
        for (const [socketId, user] of this.connectedUsers.entries()) {
            if (user.userId === userId) return socketId;
        }
        return undefined;
    }

    // ─── Auth Service REST API Calls ───

    async findOrCreateConversation(userId1: number, userId2: number): Promise<DBConversation> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.AUTH_SERVICE_URL}/chat/conversation/find-or-create`, {
                    userId1,
                    userId2,
                })
            );
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to find/create conversation: ${error.message}`);
            throw error;
        }
    }

    async sendMessageToDB(conversationId: number, senderId: number, content: string): Promise<DBMessage> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.AUTH_SERVICE_URL}/chat/new-message`, {
                    conversationId,
                    senderId,
                    content,
                    type: 'TEXT',
                })
            );
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to send message to DB: ${error.message}`);
            throw error;
        }
    }

    async getConversationMessages(conversationId: number): Promise<DBMessage[]> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.AUTH_SERVICE_URL}/chat/conversation/${conversationId}/messages`)
            );
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to get messages: ${error.message}`);
            throw error;
        }
    }

    async getUserConversations(userId: number): Promise<DBConversation[]> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.AUTH_SERVICE_URL}/chat/user/${userId}/conversations`)
            );
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to get user conversations: ${error.message}`);
            throw error;
        }
    }

    async updateMessageInDB(messageId: number, userId: number, content: string): Promise<DBMessage> {
        try {
            const response = await firstValueFrom(
                this.httpService.put(`${this.AUTH_SERVICE_URL}/chat/message`, {
                    messageId,
                    userId,
                    content,
                    type: 'TEXT',
                })
            );
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to update message in DB: ${error.message}`);
            throw error;
        }
    }

    async deleteMessageFromDB(messageId: number, userId: number, deleteType: string = 'FOR_ALL'): Promise<void> {
        try {
            await firstValueFrom(
                this.httpService.post(`${this.AUTH_SERVICE_URL}/chat/message/delete`, {
                    messageId,
                    userId,
                    deleteType,
                })
            );
        } catch (error) {
            this.logger.error(`Failed to delete message from DB: ${error.message}`);
            throw error;
        }
    }
}
