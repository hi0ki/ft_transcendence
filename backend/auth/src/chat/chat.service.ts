import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MarkAsReadDto } from './dto/mark-as-read.dto';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) {}

    async createConversation(createConversationDto: CreateConversationDto) {
        const conversation = await this.prisma.conversation.create({
            data: {
                user1Id: createConversationDto.userId1,
                user2Id: createConversationDto.userId2,
            },
        });
        return conversation;
    }

    async findOrCreateConversation(userId1: number, userId2: number) {
        let conversation = await this.prisma.conversation.findFirst({
            where: {
                OR: [
                    { user1Id: userId1, user2Id: userId2 },
                    { user1Id: userId2, user2Id: userId1 },
                ],
            },
        });
        if (!conversation) {
            conversation = await this.createConversation({ userId1, userId2 });
        }
        return conversation;
    }

    
    async getConversationMessages(conversationId: number) {
        return this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
        });
    }

// get conversations of a user for sidebar (like Instagram),
// with the last message in each conversation
    async getUserConversations(userId: number) {
        const conversations = await this.prisma.conversation.findMany({
            where: {
                OR: [
                    { user1Id: userId },
                    { user2Id: userId },
                ],
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1, // only last message
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return conversations.map((conversation) => ({
            conversationId: conversation.id,
            lastMessage: conversation.messages[0] || null,
        }));
    }


    async sendMessage(sendMessageDto: SendMessageDto) {
        return this.prisma.message.create({
            data: {
                conversationId: sendMessageDto.conversationId,
                senderId: sendMessageDto.senderId,
                content: sendMessageDto.content,
                type: sendMessageDto.type,
            },
        });
    }


    async updateMessage(updateMessageDto: UpdateMessageDto) {
        return this.prisma.message.update({
            where: { id: updateMessageDto.messageId },
            data: {
                content: updateMessageDto.content,
                type: updateMessageDto.type,
            },
        });
    }

    async deletemessage(messageId: number) {
        return this.prisma.message.delete({
            where: { id: messageId },
        });
    }

    async markAsRead(markAsReadDto: MarkAsReadDto) {
        return this.prisma.message.updateMany({
            where: {
                conversationId: markAsReadDto.conversationId,
                senderId: markAsReadDto.userId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });
    }
}
