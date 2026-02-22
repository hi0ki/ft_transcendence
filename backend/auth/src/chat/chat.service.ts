import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MarkAsReadDto } from './dto/mark-as-read.dto';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }

    // Get all users with their profiles (for the chat user list)
    async getAllUsersWithProfiles() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                profile: {
                    select: {
                        username: true,
                        fullName: true,
                        avatarUrl: true,
                    },
                },
            },
        });
    }

    // Get a single user with profile
    async getUserWithProfile(userId: number) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                profile: {
                    select: {
                        username: true,
                        fullName: true,
                        avatarUrl: true,
                    },
                },
            },
        });
    }

    async createConversation(createConversationDto: CreateConversationDto) {
        const conversation = await this.prisma.conversation.create({
            data: {
                user1Id: createConversationDto.userId1,
                user2Id: createConversationDto.userId2,
            },
            include: {
                user1: {
                    select: {
                        id: true,
                        email: true,
                        profile: { select: { username: true, avatarUrl: true } },
                    },
                },
                user2: {
                    select: {
                        id: true,
                        email: true,
                        profile: { select: { username: true, avatarUrl: true } },
                    },
                },
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
            include: {
                user1: {
                    select: {
                        id: true,
                        email: true,
                        profile: { select: { username: true, avatarUrl: true } },
                    },
                },
                user2: {
                    select: {
                        id: true,
                        email: true,
                        profile: { select: { username: true, avatarUrl: true } },
                    },
                },
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
            include: {
                sender: {
                    select: {
                        id: true,
                        email: true,
                        profile: { select: { username: true, avatarUrl: true } },
                    },
                },
            },
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
                user1: {
                    select: {
                        id: true,
                        email: true,
                        profile: { select: { username: true, fullName: true, avatarUrl: true } },
                    },
                },
                user2: {
                    select: {
                        id: true,
                        email: true,
                        profile: { select: { username: true, fullName: true, avatarUrl: true } },
                    },
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1, // only last message
                    include: {
                        sender: {
                            select: {
                                id: true,
                                profile: { select: { username: true } },
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return conversations.map((conversation) => {
            // Count unread messages (messages not sent by this user that are unread)
            return {
                id: conversation.id,
                user1: conversation.user1,
                user2: conversation.user2,
                createdAt: conversation.createdAt,
                lastMessage: conversation.messages[0] || null,
            };
        });
    }

    // Get unread count for a conversation
    async getUnreadCount(conversationId: number, userId: number) {
        return this.prisma.message.count({
            where: {
                conversationId,
                senderId: { not: userId },
                isRead: false,
            },
        });
    }


    async sendMessage(sendMessageDto: SendMessageDto) {
        return this.prisma.message.create({
            data: {
                conversationId: sendMessageDto.conversationId,
                senderId: sendMessageDto.senderId,
                content: sendMessageDto.content,
                type: sendMessageDto.type,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        email: true,
                        profile: { select: { username: true, avatarUrl: true } },
                    },
                },
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
