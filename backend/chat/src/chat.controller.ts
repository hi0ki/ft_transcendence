import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateRoomDto, SendMessageDto } from './chat.interface';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    // User endpoints
    @Get('users')
    getUsers() {
        return this.chatService.getAllUsers();
    }

    // Room endpoints
    @Get('rooms')
    getAllRooms() {
        return this.chatService.getAllRooms();
    }

    @Get('rooms/user/:socketId')
    getUserRooms(@Param('socketId') socketId: string) {
        return this.chatService.getUserRooms(socketId);
    }

    @Get('rooms/:roomId')
    getRoom(@Param('roomId') roomId: string) {
        const room = this.chatService.getRoom(roomId);
        if (!room) {
            return { error: 'Room not found' };
        }
        return room;
    }

    @Get('rooms/:roomId/participants')
    getRoomParticipants(@Param('roomId') roomId: string) {
        const room = this.chatService.getRoom(roomId);
        if (!room) {
            return { error: 'Room not found' };
        }
        return room.participants;
    }

    @Post('rooms')
    createRoom(@Body() createRoomDto: { from: string; to: string; meta?: any }) {
        try {
            return this.chatService.createRoom(
                createRoomDto.from,
                createRoomDto.to,
                createRoomDto.meta,
            );
        } catch (error) {
            return { error: error.message };
        }
    }

    @Delete('rooms/:roomId')
    deleteRoom(@Param('roomId') roomId: string) {
        const success = this.chatService.deleteRoom(roomId);
        return { success, roomId };
    }

    // Message endpoints
    @Get('messages/:roomId')
    getMessages(
        @Param('roomId') roomId: string,
        @Query('limit') limit?: string,
    ) {
        const limitNum = limit ? parseInt(limit, 10) : undefined;
        return this.chatService.getMessages(roomId, limitNum);
    }

    @Post('messages')
    sendMessage(@Body() sendMessageDto: { roomId: string; from: string; message: string }) {
        try {
            return this.chatService.addMessage(
                sendMessageDto.roomId,
                sendMessageDto.from,
                sendMessageDto.message,
            );
        } catch (error) {
            return { error: error.message };
        }
    }
}
