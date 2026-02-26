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

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3001'],
        credentials: true,
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly chatService: ChatService) { }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);

        // Add user to the system
        const user = this.chatService.addUser(client.id);

        // Send welcome message to the connected client
        client.emit('welcome', { socketId: user.socketId, index: user.index });

        // Broadcast updated user list to all clients
        this.broadcastUserList();
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);

        // Remove user from the system
        this.chatService.removeUser(client.id);

        // Broadcast updated user list to all clients
        this.broadcastUserList();
    }

    @SubscribeMessage('create_room')
    handleCreateRoom(
        @MessageBody() data: { to: string; meta?: any },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const room = this.chatService.createRoom(client.id, data.to, data.meta);

            // Join both users to the room
            client.join(room.roomId);
            const toSocket = this.server.sockets.sockets.get(data.to);
            if (toSocket) {
                toSocket.join(room.roomId);
            }

            // Notify both participants about the new room
            this.server.to(room.roomId).emit('room_created', {
                roomId: room.roomId,
                participants: room.participants,
                createdBy: room.createdBy,
                meta: room.meta,
            });

            console.log(`Room created: ${room.roomId}`);
        } catch (error) {
            client.emit('error', { message: error.message });
        }
    }

    @SubscribeMessage('join_room')
    handleJoinRoom(
        @MessageBody() data: { roomId: string },
        @ConnectedSocket() client: Socket,
    ) {
        client.join(data.roomId);
        client.emit('joined_room', { roomId: data.roomId });
        console.log(`Client ${client.id} joined room ${data.roomId}`);
    }

    @SubscribeMessage('leave_room')
    handleLeaveRoom(
        @MessageBody() data: { roomId: string },
        @ConnectedSocket() client: Socket,
    ) {
        client.leave(data.roomId);
        client.emit('left_room', { roomId: data.roomId });
        console.log(`Client ${client.id} left room ${data.roomId}`);
    }

    @SubscribeMessage('room_message')
    handleRoomMessage(
        @MessageBody() data: { roomId: string; message: string },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const message = this.chatService.addMessage(
                data.roomId,
                client.id,
                data.message,
            );

            // Broadcast message to all participants in the room
            this.server.to(data.roomId).emit('room_message', message);

            console.log(`Message sent to room ${data.roomId}: ${data.message}`);
        } catch (error) {
            client.emit('error', { message: error.message });
        }
    }

    private broadcastUserList() {
        const users = this.chatService.getAllUsers();
        this.server.emit('user_list', users);
    }
}
