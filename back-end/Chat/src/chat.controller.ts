import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { CreateRoomDto, SendMessageDto } from './chat.interface';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly gateway: ChatGateway,
  ) { }

  // Get all online users
  @Get('users')
  getUsers() {
    return this.chatService.getAllUsers();
  }

  // Get all rooms
  @Get('rooms')
  getAllRooms() {
    return this.chatService.getAllRooms();
  }

  // Get rooms for a specific user
  @Get('rooms/user/:socketId')
  getUserRooms(@Param('socketId') socketId: string) {
    return this.chatService.getRoomsByUser(socketId);
  }

  // Get specific room details
  @Get('rooms/:roomId')
  getRoom(@Param('roomId') roomId: string) {
    const room = this.chatService.getRoom(roomId);
    if (!room) {
      return { error: 'Room not found' };
    }
    return room;
  }

  // Get room participants
  @Get('rooms/:roomId/participants')
  getRoomParticipants(@Param('roomId') roomId: string) {
    return this.chatService.getRoomParticipants(roomId);
  }

  // Get messages for a room
  @Get('messages/:roomId')
  getMessages(
    @Param('roomId') roomId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.chatService.getMessages(roomId, limitNum);
  }

  // Create a new room
  @Post('rooms')
  async createRoom(@Body() body: CreateRoomDto) {
    if (!body?.from) {
      return { error: 'missing from (socketId)' };
    }

    // Create room in service
    const room = this.chatService.createRoom(body.from, body.to, body.meta);

    // Join sockets to room via gateway
    await this.gateway.joinSocketsToRoom(room.roomId, body.from, body.to);

    // Notify participants via WebSocket
    this.gateway.notifyRoomCreated(room);

    return room;
  }

  // Send a message via REST (also emits via WebSocket)
  @Post('messages')
  sendMessage(@Body() body: SendMessageDto) {
    if (!body?.roomId || !body?.message) {
      return { error: 'missing roomId or message' };
    }

    const room = this.chatService.getRoom(body.roomId);
    if (!room) {
      return { error: 'Room not found' };
    }

    // For REST API, we need to know who is sending
    // In a real app, this would come from authentication
    // For now, we'll use the first participant
    const fromSocketId = room.participants[0]?.socketId;

    if (!fromSocketId) {
      return { error: 'No participants in room' };
    }

    const message = this.chatService.addMessage(
      body.roomId,
      fromSocketId,
      body.message,
    );

    if (!message) {
      return { error: 'Failed to send message' };
    }

    // Broadcast via WebSocket
    this.gateway.broadcastMessage(message);

    return message;
  }

  // Delete a room
  @Delete('rooms/:roomId')
  deleteRoom(@Param('roomId') roomId: string) {
    const deleted = this.chatService.deleteRoom(roomId);

    if (deleted) {
      // Notify via WebSocket
      this.gateway.notifyRoomDeleted(roomId);
      return { success: true, roomId };
    }

    return { error: 'Room not found' };
  }
}