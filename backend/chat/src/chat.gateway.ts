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

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3001'],
        credentials: true,
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(ChatGateway.name);
    private readonly JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';

    constructor(private readonly chatService: ChatService) { }

    async handleConnection(client: Socket) {
        try {
            // Extract JWT token from handshake
            const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');

            if (!token) {
                this.logger.warn(`Client ${client.id} connected without token — disconnecting`);
                client.emit('error', { message: 'Authentication required' });
                client.disconnect();
                return;
            }

            // Decode JWT to get user info
            const payload: any = jwt.verify(token, this.JWT_SECRET);
            const userId = payload.id || payload.sub;
            const email = payload.email;
            const username = payload.username;

            if (!userId) {
                this.logger.warn(`Client ${client.id} token has no userId — disconnecting`);
                client.emit('error', { message: 'Invalid token' });
                client.disconnect();
                return;
            }

            // Register connected user
            const user = this.chatService.addConnectedUser(client.id, userId, email, username);

            // Send welcome with user info
            client.emit('welcome', {
                socketId: client.id,
                userId: user.userId,
                email: user.email,
                username: user.username,
            });

            // Broadcast updated online users list
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

            // Find or create conversation in DB
            const conversation = await this.chatService.findOrCreateConversation(
                currentUser.userId,
                data.targetUserId,
            );

            // Join both users to a socket.io room (using conversation DB ID)
            const roomName = `conversation_${conversation.id}`;
            client.join(roomName);

            // If the other user is online, join them to the room too
            const targetSocketId = this.chatService.getSocketIdForUser(data.targetUserId);
            if (targetSocketId) {
                const targetSocket = this.server.sockets.sockets.get(targetSocketId);
                if (targetSocket) {
                    targetSocket.join(roomName);
                }
            }

            // Notify the creator about the room
            client.emit('room_created', {
                conversationId: conversation.id,
                conversation,
            });

            // Also notify the target user if online
            if (targetSocketId) {
                this.server.to(targetSocketId).emit('room_created', {
                    conversationId: conversation.id,
                    conversation,
                });
            }

            this.logger.log(`Conversation ${conversation.id} created/found between users ${currentUser.userId} and ${data.targetUserId}`);
        } catch (error) {
            this.logger.error(`Create room error: ${error.message}`);
            client.emit('error', { message: error.message });
        }
    }

    @SubscribeMessage('join_room')
    handleJoinRoom(
        @MessageBody() data: { conversationId: number },
        @ConnectedSocket() client: Socket,
    ) {
        const roomName = `conversation_${data.conversationId}`;
        client.join(roomName);
        client.emit('joined_room', { conversationId: data.conversationId });
        this.logger.log(`Client ${client.id} joined conversation ${data.conversationId}`);
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

            // Persist message to database via auth_service
            const savedMessage = await this.chatService.sendMessageToDB(
                data.conversationId,
                currentUser.userId,
                data.message,
                data.type || 'TEXT',
                data.fileUrl || null,
            );

            // Broadcast to all participants in the room
            const roomName = `conversation_${data.conversationId}`;
            this.server.to(roomName).emit('room_message', savedMessage);

            // Also emit to sender in case they haven't joined the room yet
            client.emit('room_message', savedMessage);

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

            const updatedMessage = await this.chatService.updateMessageInDB(
                data.messageId,
                currentUser.userId,
                data.content,
            );

            const roomName = `conversation_${data.conversationId}`;
            this.server.to(roomName).emit('message_updated', updatedMessage);
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

            const deleteType = data.deleteType || 'FOR_ALL';
            await this.chatService.deleteMessageFromDB(data.messageId, currentUser.userId, deleteType);

            if (deleteType === 'FOR_ALL') {
                const roomName = `conversation_${data.conversationId}`;
                this.server.to(roomName).emit('message_deleted', {
                    messageId: data.messageId,
                    conversationId: data.conversationId,
                    deleteType: 'FOR_ALL'
                });
            } else {
                // FOR_ME: only notify the sender
                client.emit('message_deleted', {
                    messageId: data.messageId,
                    conversationId: data.conversationId,
                    deleteType: 'FOR_ME'
                });
            }
            this.logger.log(`Message ${data.messageId} deleted (${deleteType}) by user ${currentUser.userId}`);
        } catch (error) {
            this.logger.error(`Delete message error: ${error.message}`);
            client.emit('error', { message: error.message });
        }
    }

    private broadcastOnlineUsers() {
        const onlineUserIds = this.chatService.getOnlineUserIds();
        this.server.emit('online_users', onlineUserIds);
    }
}
