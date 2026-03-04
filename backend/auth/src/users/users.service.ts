import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../decorators/roles.decorator';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                profile: {
                    select: {
                        username: true,
                        avatarUrl: true,
                    },
                },
                _count: {
                    select: {
                        posts: true,
                        friendshipsAsUser1: true,
                        friendshipsAsUser2: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return users.map((user) => ({
            id: user.id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            profile: user.profile,
            postCount: user._count.posts,
            followerCount: user._count.friendshipsAsUser1 + user._count.friendshipsAsUser2,
        }));
    }

    async findOne(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user)
            throw new NotFoundException(`User with id "${id}" not found`);
        return user;
    }


    async remove(targetId: number, requestingUser: { id: number; role: Role }) {
        if (+requestingUser.id !== targetId && requestingUser.role !== Role.ADMIN) {
            throw new ForbiddenException('You can only delete your own account');
        }

        const exists = await this.prisma.user.findUnique({ where: { id: targetId } });
        if (!exists) {
            throw new NotFoundException(`User with id "${targetId}" not found`);
        }
        await this.prisma.like.deleteMany({ where: { userId: targetId } });
        await this.prisma.comment.deleteMany({ where: { userId: targetId } });

        await this.prisma.friendship.deleteMany({
            where: {
                OR: [
                    { user1Id: targetId },
                    { user2Id: targetId },
                ]
            }
        });

        await this.prisma.message.deleteMany({ where: { senderId: targetId } });

        const userConversations = await this.prisma.conversation.findMany({
            where: {
                OR: [
                    { user1Id: targetId },
                    { user2Id: targetId },
                ]
            },
        });
        for (const conversation of userConversations) {
            await this.prisma.message.deleteMany({ where: { conversationId: conversation.id } });
        }
        await this.prisma.conversation.deleteMany({
            where: {
                OR: [
                    { user1Id: targetId },
                    { user2Id: targetId },
                ]
            },
        });

        const userPosts = await this.prisma.post.findMany({ where: { userId: targetId } });
        for (const post of userPosts) {
            await this.prisma.like.deleteMany({ where: { postId: post.id } });
            await this.prisma.comment.deleteMany({ where: { postId: post.id } });
        }
        await this.prisma.post.deleteMany({ where: { userId: targetId } });
        await this.prisma.profile.deleteMany({ where: { userId: targetId } });

        await this.prisma.user.delete({ where: { id: targetId } });

        return { message: `User deleted successfully` };
    }

    async changeRole(targetId: number, role: Role) {
        const exists = await this.prisma.user.findUnique({ where: { id: targetId } });
        if (!exists) {
            throw new NotFoundException(`User with id "${targetId}" not found`);
        }

        return this.prisma.user.update({
            where: { id: targetId },
            data: { role },
            select: { id: true, email: true, role: true },
        });
    }
}