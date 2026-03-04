import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConnectedUser, DBConversation, DBMessage } from './chat.interface';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);

    // socketId -> ConnectedUser mapping (online tracking)
    private connectedUsers: Map<string, ConnectedUser> = new Map();
    
    // userId -> JWT token mapping (for authenticated HTTP requests)
    private userTokens: Map<number, string> = new Map();

    // Auth service base URL (internal Docker network)
    private readonly AUTH_SERVICE_URL = 'http://auth_service:3000';

    constructor(private readonly httpService: HttpService) { }

    // ─── Online User Tracking ───

    addConnectedUser(socketId: string, userId: number, email: string, username?: string, token?: string): ConnectedUser {
        const user: ConnectedUser = { socketId, userId, email, username };
        this.connectedUsers.set(socketId, user);
        
        // Store JWT token for this user
        if (token) {
            this.userTokens.set(userId, token);
        }
        
        this.logger.log(`User connected: ${username || email} (userId: ${userId}, socketId: ${socketId})`);
        return user;
    }

    removeConnectedUser(socketId: string): ConnectedUser | undefined {
        const user = this.connectedUsers.get(socketId);
        if (user) {
            this.connectedUsers.delete(socketId);
            
            // Only remove token if no other sockets exist for this user
            const hasOtherSockets = Array.from(this.connectedUsers.values())
                .some(u => u.userId === user.userId);
            if (!hasOtherSockets) {
                this.userTokens.delete(user.userId);
            }
            
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
    
    private getTokenForUser(userId: number): string | undefined {
        return this.userTokens.get(userId);
    }

    // ─── Auth Service REST API Calls ───

    async findOrCreateConversation(userId1: number, userId2: number): Promise<DBConversation> {
        try {
            const token = this.getTokenForUser(userId1) || this.getTokenForUser(userId2);
            if (!token) {
                throw new Error('No authentication token available');
            }
            
            const response = await firstValueFrom(
                this.httpService.post(`${this.AUTH_SERVICE_URL}/chat/conversation/find-or-create`, {
                    userId1,
                    userId2,
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            );
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to find/create conversation: ${error.message}`);
            throw error;
        }
    }

    async sendMessageToDB(conversationId: number, senderId: number, content: string, type: string = 'TEXT', fileUrl: string | null = null): Promise<DBMessage> {
        try {
            const token = this.getTokenForUser(senderId);
            if (!token) {
                throw new Error('No authentication token for sender');
            }
            
            const response = await firstValueFrom(
                this.httpService.post(`${this.AUTH_SERVICE_URL}/chat/new-message`, {
                    conversationId,
                    senderId,
                    content,
                    type,
                    fileUrl,
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
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
            const token = Array.from(this.userTokens.values())[0];
            if (!token) {
                throw new Error('No authentication token available');
            }
            
            const response = await firstValueFrom(
                this.httpService.get(`${this.AUTH_SERVICE_URL}/chat/conversation/${conversationId}/messages`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            );
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to get messages: ${error.message}`);
            throw error;
        }
    }

    async getUserConversations(userId: number): Promise<DBConversation[]> {
        try {
            const token = this.getTokenForUser(userId);
            if (!token) {
                throw new Error('No authentication token for user');
            }
            
            const response = await firstValueFrom(
                this.httpService.get(`${this.AUTH_SERVICE_URL}/chat/user/${userId}/conversations`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            );
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to get user conversations: ${error.message}`);
            throw error;
        }
    }

    async updateMessageInDB(messageId: number, userId: number, content: string): Promise<DBMessage> {
        try {
            const token = this.getTokenForUser(userId);
            if (!token) {
                throw new Error('No authentication token for user');
            }
            
            const response = await firstValueFrom(
                this.httpService.put(`${this.AUTH_SERVICE_URL}/chat/message`, {
                    messageId,
                    userId,
                    content,
                    type: 'TEXT',
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
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
            const token = this.getTokenForUser(userId);
            if (!token) {
                throw new Error('No authentication token for user');
            }
            
            await firstValueFrom(
                this.httpService.post(`${this.AUTH_SERVICE_URL}/chat/message/delete`, {
                    messageId,
                    userId,
                    deleteType,
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            );
        } catch (error) {
            this.logger.error(`Failed to delete message from DB: ${error.message}`);
            throw error;
        }
    }
}
