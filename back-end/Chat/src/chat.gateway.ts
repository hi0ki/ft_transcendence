import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Injectable } from '@nestjs/common';
import { Message, Room } from './chat.interface';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:5173'],
    credentials: true,
  },
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private nextIndex = 1;

  constructor(private readonly chatService: ChatService) { }

  handleConnection(client: Socket) {
    const index = this.nextIndex++;
    const user = this.chatService.addUser(client.id, index);

    client.emit('welcome', { socketId: client.id, index });
    this.broadcastUserList();

    console.log(`User connected: ${client.id} (index: ${index})`);
  }

  handleDisconnect(client: Socket) {
    this.chatService.removeUser(client.id);
    this.broadcastUserList();

    console.log(`User disconnected: ${client.id}`);
  }

  private broadcastUserList() {
    const users = this.chatService.getAllUsers();
    this.server.emit('user_list', users);
  }

  // Create a room and join both participants
  @SubscribeMessage('create_room')
  async handleCreateRoom(
    @MessageBody() payload: { to: string; meta?: any },
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.chatService.createRoom(client.id, payload.to, payload.meta);

    // Join creator to room
    await client.join(room.roomId);

    // Join target user if online
    if (payload.to) {
      const targetSocket = this.server.sockets.sockets.get(payload.to);
      if (targetSocket) {
        await targetSocket.join(room.roomId);
        targetSocket.emit('room_created', {
          roomId: room.roomId,
          participants: room.participants,
          createdBy: client.id,
          meta: payload.meta,
        });
      }
    }

    client.emit('room_created', {
      roomId: room.roomId,
      participants: room.participants,
      createdBy: client.id,
      meta: payload.meta,
    });

    return { success: true, room };
  }

  // Join an existing room
  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() payload: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.chatService.getRoom(payload.roomId);

    if (!room) {
      client.emit('error', { message: 'Room not found' });
      return;
    }

    await client.join(payload.roomId);
    this.chatService.addParticipantToRoom(payload.roomId, client.id);

    client.emit('joined_room', { roomId: payload.roomId });

    // Notify other participants
    client.to(payload.roomId).emit('user_joined', {
      roomId: payload.roomId,
      user: this.chatService.getUser(client.id),
    });
  }

  // Leave a room
  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @MessageBody() payload: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(payload.roomId);
    this.chatService.removeParticipantFromRoom(payload.roomId, client.id);

    client.emit('left_room', { roomId: payload.roomId });

    // Notify other participants
    client.to(payload.roomId).emit('user_left', {
      roomId: payload.roomId,
      user: this.chatService.getUser(client.id),
    });
  }

  // Send message to a room
  @SubscribeMessage('room_message')
  handleRoomMessage(
    @MessageBody() payload: { roomId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const message = this.chatService.addMessage(
      payload.roomId,
      client.id,
      payload.message,
    );

    if (!message) {
      client.emit('error', { message: 'Failed to send message' });
      return;
    }

    // Broadcast to all participants in the room (including sender)
    this.server.to(payload.roomId).emit('room_message', message);

    return { success: true, message };
  }

  // Public methods for controller to use
  async joinSocketsToRoom(roomId: string, fromSocketId: string, toSocketId?: string) {
    const fromSocket = this.server.sockets.sockets.get(fromSocketId);
    if (fromSocket) {
      await fromSocket.join(roomId);
    }

    if (toSocketId) {
      const toSocket = this.server.sockets.sockets.get(toSocketId);
      if (toSocket) {
        await toSocket.join(roomId);
      }
    }
  }

  notifyRoomCreated(room: Room) {
    room.participants.forEach((participant) => {
      const socket = this.server.sockets.sockets.get(participant.socketId);
      if (socket) {
        socket.emit('room_created', {
          roomId: room.roomId,
          participants: room.participants,
          createdBy: room.createdBy,
          meta: room.meta,
        });
      }
    });
  }

  broadcastMessage(message: Message) {
    this.server.to(message.roomId).emit('room_message', message);
  }

  notifyRoomDeleted(roomId: string) {
    this.server.to(roomId).emit('room_deleted', { roomId });
  }
}