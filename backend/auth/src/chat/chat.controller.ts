import { Controller, Get, Post, Put, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MarkAsReadDto } from './dto/mark-as-read.dto';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    // Get all users with profiles (for the user list in chat)
    @Get('users')
    getAllUsers() {
        return this.chatService.getAllUsersWithProfiles();
    }

    // Get a single user with profile
    @Get('users/:userId')
    getUser(@Param('userId', ParseIntPipe) userId: number) {
        return this.chatService.getUserWithProfile(userId);
    }

    @Post('conversation')
    createConversation(@Body() createConversationDto: { userId1: number, userId2: number }) {
        return this.chatService.createConversation(createConversationDto);
    }

    @Post('conversation/find-or-create')
    findOrCreateConversation(@Body() body: { userId1: number, userId2: number }) {
        return this.chatService.findOrCreateConversation(body.userId1, body.userId2);
    }

    @Post('new-message')
    sendMessage(@Body() sendMessageDto: SendMessageDto) {
        return this.chatService.sendMessage(sendMessageDto);
    }

    @Get('conversation/:conversationId/messages')
    getConversationMessages(
        @Param('conversationId', ParseIntPipe) conversationId: number,
        @Query('userId') userId?: string
    ) {
        return this.chatService.getConversationMessages(conversationId, userId ? parseInt(userId) : undefined);
    }

    @Put('message')
    updateMessage(@Body() body: any) {
        const { userId, ...updateMessageDto } = body;
        return this.chatService.updateMessage(userId, updateMessageDto);
    }

    @Post('message/delete') // Using POST or DELETE depending on frontend preference, sticking to POST for easier body passing if needed
    deleteMessage(@Body() body: { messageId: number, userId: number, deleteType?: string }) {
        return this.chatService.deleteMessage(body.messageId, body.userId, body.deleteType || 'FOR_ALL');
    }

    @Get('user/:userId/conversations')
    getUserConversations(@Param('userId', ParseIntPipe) userId: number) {
        return this.chatService.getUserConversations(userId);
    }

    @Put('message/mark-as-read')
    markAsRead(@Body() markAsReadDto: MarkAsReadDto) {
        return this.chatService.markAsRead(markAsReadDto);
    }
}
