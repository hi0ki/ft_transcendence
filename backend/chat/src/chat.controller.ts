import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    // Get all currently online users
    @Get('online')
    getOnlineUsers() {
        return this.chatService.getAllConnectedUsers();
    }

    // Get conversations for a user (proxied from auth_service)
    @Get('user/:userId/conversations')
    async getUserConversations(@Param('userId', ParseIntPipe) userId: number) {
        return this.chatService.getUserConversations(userId);
    }

    // Get messages for a conversation (proxied from auth_service)
    @Get('conversation/:conversationId/messages')
    async getConversationMessages(@Param('conversationId', ParseIntPipe) conversationId: number) {
        return this.chatService.getConversationMessages(conversationId);
    }
}
