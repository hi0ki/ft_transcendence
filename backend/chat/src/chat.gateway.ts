import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

/** Inline XSS sanitization */
function stripTags(input: string): string {
    return input.replace(/<[^>]*>/g, '');
}
function escapeHtml(input: string): string {
    const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
    return input.replace(/[&<>"']/g, (c) => map[c] || c);
}
function sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    return escapeHtml(stripTags(input.trim()));
}

@WebSocketGateway({
    cors: {
        origin: [
            'https://localhost'
        ],
        credentials: true,
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(ChatGateway.name);
    private readonly JWT_SECRET = process.env.JWT_SECRET;

    constructor(private readonly chatService: ChatService) { }

    afterInit() {
        setInterval(() => {
            if (this.server) {
                this.broadcastOnlineUsers();
            }
        }, 30_000);
    }

    async handleConnection(client: Socket) {
        try {
            const cookieHeader = client.handshake.headers?.cookie;
            const match = cookieHeader?.split(';').find(c => c.trim().startsWith('auth_token='));
            const token = match?.split('=')[1]?.trim();

            if (!token) {
                this.logger.warn(`Client ${client.id} connected without token — disconnecting`);
                client.emit('error', { message: 'Authentication required' });
                client.disconnect();
                return;
            }

            const payload: any = jwt.verify(token, this.JWT_SECRET);
            const userId = Number(payload.id || payload.sub);
            const email = payload.email;
            const username = payload.username;

            if (!userId) {
                this.logger.warn(`Client ${client.id} token has no userId — disconnecting`);
                client.emit('error', { message: 'Invalid token' });
                client.disconnect();
                return;
            }

            const user = this.chatService.addConnectedUser(client.id, userId, email, username, token);

            client.emit('welcome', {
                socketId: client.id,
                userId: user.userId,
                email: user.email,
                username: user.username,
            });

            this.broadcastOnlineUsers();

        } catch (error) {
            this.logger.error(`Client ${client.id} auth failed: ${error.message}`);
            client.emit('error', { message: 'Authentication failed' });
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const user = this.chatService.removeConnectedUser(client.id);
        if (user) {
            this.broadcastOnlineUsers();
        }
    }

    @SubscribeMessage('create_room')
    async handleCreateRoom(
        @MessageBody() data: { targetUserId: number },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const currentUser = this.chatService.getConnectedUser(client.id);
            if (!currentUser) {
                client.emit('error', { message: 'Not authenticated' });
                return;
            }

            const conversation = await this.chatService.findOrCreateConversation(
                currentUser.userId,
                data.targetUserId,
            );

            const roomName = `conversation_${conversation.id}`;

            // Both users join the room immediately
            client.join(roomName);

            const targetSocketId = this.chatService.getSocketIdForUser(data.targetUserId);
            if (targetSocketId) {
                const targetSocket = this.server.sockets.sockets.get(targetSocketId);
                if (targetSocket) {
                    targetSocket.join(roomName);
                }
            }

            // Emit to initiator
            client.emit('room_created', {
                conversationId: conversation.id,
                conversation,
                initiatorId: currentUser.userId,
            });

            // Emit to recipient if online
            if (targetSocketId) {
                this.server.to(targetSocketId).emit('room_created', {
                    conversationId: conversation.id,
                    conversation,
                    initiatorId: currentUser.userId,
                });
            }

            this.logger.log(`Conversation ${conversation.id} created/found between users ${currentUser.userId} and ${data.targetUserId}`);
        } catch (error) {
            this.logger.error(`Create room error: ${error.message}`);
            client.emit('error', { message: error.message });
        }
    }

    @SubscribeMessage('join_room')
    async handleJoinRoom(
        @MessageBody() data: { conversationId: number },
        @ConnectedSocket() client: Socket,
    ) {
        const currentUser = this.chatService.getConnectedUser(client.id);
        if (!currentUser) {
            client.emit('error', { message: 'Not authenticated' });
            return;
        }

        // SECURITY: verify this user is actually a participant in the conversation
        const conversation = await this.chatService.getConversation(data.conversationId, currentUser.userId);
        if (
            !conversation ||
            (conversation.user1.id !== currentUser.userId && conversation.user2.id !== currentUser.userId)
        ) {
            client.emit('error', { message: 'Access denied: not a member of this conversation' });
            this.logger.warn(`User ${currentUser.userId} tried to join conversation ${data.conversationId} without access`);
            return;
        }

        // Join the room
        const roomName = `conversation_${data.conversationId}`;
        client.join(roomName);
        client.emit('joined_room', { conversationId: data.conversationId });
        this.logger.log(`Client ${client.id} (user ${currentUser.userId}) joined conversation ${data.conversationId}`);
    }

    @SubscribeMessage('leave_room')
    handleLeaveRoom(
        @MessageBody() data: { conversationId: number },
        @ConnectedSocket() client: Socket,
    ) {
        const roomName = `conversation_${data.conversationId}`;
        client.leave(roomName);
        client.emit('left_room', { conversationId: data.conversationId });
    }

    @SubscribeMessage('room_message')
    async handleRoomMessage(
        @MessageBody() data: { conversationId: number; message: string; type?: string; fileUrl?: string },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const currentUser = this.chatService.getConnectedUser(client.id);
            if (!currentUser) {
                client.emit('error', { message: 'Not authenticated' });
                return;
            }

            // Verify sender is a participant in this conversation
            const conversation = await this.chatService.getConversation(data.conversationId, currentUser.userId);
            if (
                !conversation ||
                (conversation.user1.id !== currentUser.userId && conversation.user2.id !== currentUser.userId)
            ) {
                client.emit('error', { message: 'Access denied: not a member of this conversation' });
                this.logger.warn(`User ${currentUser.userId} tried to send message to conversation ${data.conversationId} without access`);
                return;
            }

            const sanitizedMessage = data.message ? sanitizeInput(data.message) : '';
            const sanitizedFileUrl = data.fileUrl ? sanitizeInput(data.fileUrl) : null;

            const savedMessage = await this.chatService.sendMessageToDB(
                data.conversationId,
                currentUser.userId,
                sanitizedMessage,
                data.type || 'TEXT',
                sanitizedFileUrl,
            );

            const roomName = `conversation_${data.conversationId}`;

            this.server.in(roomName).emit('room_message', savedMessage);

            this.logger.log(`Message sent to conversation ${data.conversationId} by user ${currentUser.userId}`);
        } catch (error) {
            this.logger.error(`Send message error: ${error.message}`);
            client.emit('error', { message: error.message });
        }
    }

    @SubscribeMessage('update_message')
    async handleUpdateMessage(
        @MessageBody() data: { conversationId: number; messageId: number; content: string },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const currentUser = this.chatService.getConnectedUser(client.id);
            if (!currentUser) {
                client.emit('error', { message: 'Not authenticated' });
                return;
            }

            // Verify sender is a participant in this conversation
            const conversation = await this.chatService.getConversation(data.conversationId, currentUser.userId);
            if (
                !conversation ||
                (conversation.user1.id !== currentUser.userId && conversation.user2.id !== currentUser.userId)
            ) {
                client.emit('error', { message: 'Access denied: not a member of this conversation' });
                this.logger.warn(`User ${currentUser.userId} tried to update message in conversation ${data.conversationId} without access`);
                return;
            }

            const sanitizedContent = data.content ? sanitizeInput(data.content) : '';

            const updatedMessage = await this.chatService.updateMessageInDB(
                data.messageId,
                currentUser.userId,
                sanitizedContent,
            );

            const roomName = `conversation_${data.conversationId}`;
            this.server.in(roomName).emit('message_updated', updatedMessage);
            this.logger.log(`Message ${data.messageId} updated by user ${currentUser.userId}`);
        } catch (error) {
            this.logger.error(`Update message error: ${error.message}`);
            client.emit('error', { message: error.message });
        }
    }

    @SubscribeMessage('delete_message')
    async handleDeleteMessage(
        @MessageBody() data: { conversationId: number; messageId: number; deleteType?: string },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const currentUser = this.chatService.getConnectedUser(client.id);
            if (!currentUser) {
                client.emit('error', { message: 'Not authenticated' });
                return;
            }

            // Verify sender is a participant in this conversation
            const conversation = await this.chatService.getConversation(data.conversationId, currentUser.userId);
            if (
                !conversation ||
                (conversation.user1.id !== currentUser.userId && conversation.user2.id !== currentUser.userId)
            ) {
                client.emit('error', { message: 'Access denied: not a member of this conversation' });
                this.logger.warn(`User ${currentUser.userId} tried to delete message in conversation ${data.conversationId} without access`);
                return;
            }

            const deleteType = data.deleteType || 'FOR_ALL';
            await this.chatService.deleteMessageFromDB(data.messageId, currentUser.userId, deleteType);

            if (deleteType === 'FOR_ALL') {
                const roomName = `conversation_${data.conversationId}`;
                this.server.in(roomName).emit('message_deleted', {
                    messageId: data.messageId,
                    conversationId: data.conversationId,
                    deleteType: 'FOR_ALL',
                });
            } else {
                client.emit('message_deleted', {
                    messageId: data.messageId,
                    conversationId: data.conversationId,
                    deleteType: 'FOR_ME',
                });
            }
            this.logger.log(`Message ${data.messageId} deleted (${deleteType}) by user ${currentUser.userId}`);
        } catch (error) {
            this.logger.error(`Delete message error: ${error.message}`);
            client.emit('error', { message: error.message });
        }
    }

    private broadcastOnlineUsers() {
        const onlineUserIds = [...new Set(this.chatService.getOnlineUserIds())];
        this.server.emit('online_users', onlineUserIds);
    }

    @SubscribeMessage('heartbeat')
    handleHeartbeat(@ConnectedSocket() client: Socket) {
        const user = this.chatService.getConnectedUser(client.id);
        if (user) {
            client.emit('heartbeat_ack', { userId: user.userId });
        }
    }

    @SubscribeMessage('request_online_users')
    handleRequestOnlineUsers(@ConnectedSocket() client: Socket) {
        const currentUser = this.chatService.getConnectedUser(client.id);
        if (currentUser) {
            const onlineUserIds = this.chatService.getOnlineUserIds();
            client.emit('online_users', onlineUserIds);
        }
    }
}