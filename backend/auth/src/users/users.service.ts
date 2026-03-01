import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../decorators/roles.decorator';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async findAll() {
        return this.prisma.user.findMany({
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
            },
            orderBy: { createdAt: 'desc' },
        });
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

    async update(targetId: number, dto: UpdateUserDto, requestingUser: { id: number; role: Role }) {
        if (+requestingUser.id !== targetId && requestingUser.role !== Role.ADMIN)
            throw new ForbiddenException('You can only update your own account');

        if (dto.role && requestingUser.role !== Role.ADMIN)
            throw new ForbiddenException('Only admins can change roles');

        const exists = await this.prisma.user.findUnique({ where: { id: targetId } });
        if (!exists)
            throw new NotFoundException(`User with id "${targetId}" not found`);

        if (dto.email) {
            const emailTaken = await this.prisma.user.findFirst({
                where: { email: dto.email, NOT: { id: targetId } },
            });
            if (emailTaken) {
                throw new ConflictException('Email already in use');
            }
        }

        return this.prisma.user.update({
            where: { id: targetId },
            data: dto,
            select: {
                id: true,
                email: true,
                role: true,
            },
        });
    }

    async remove(targetId: number, requestingUser: { id: number; role: Role }) {
        // Only admin or the user themselves can delete
        if (+requestingUser.id !== targetId && requestingUser.role !== Role.ADMIN) {
            throw new ForbiddenException('You can only delete your own account');
        }

        // Check user exists
        const exists = await this.prisma.user.findUnique({ where: { id: targetId } });
        if (!exists) {
            throw new NotFoundException(`User with id "${targetId}" not found`);
        }

        // Step 1: Delete notifications
        await this.prisma.notification.deleteMany({ where: { userId: targetId } });
        await this.prisma.notification.deleteMany({ where: { senderId: targetId } });

        // Step 2: Delete likes and comments made by this user
        await this.prisma.like.deleteMany({ where: { userId: targetId } });
        await this.prisma.comment.deleteMany({ where: { userId: targetId } });

        // Step 3: Delete friendships (schema uses user1Id and user2Id)
        await this.prisma.friendship.deleteMany({
            where: {
                OR: [
                    { user1Id: targetId },
                    { user2Id: targetId },
                ]
            }
        });

        // Step 4: Delete messages sent by this user
        await this.prisma.message.deleteMany({ where: { senderId: targetId } });

        // Step 5: Delete conversations and their messages
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

        // Step 6: Delete user's posts (clean up likes, comments, notifications first)
        const userPosts = await this.prisma.post.findMany({ where: { userId: targetId } });
        for (const post of userPosts) {
            await this.prisma.notification.deleteMany({ where: { postId: post.id } });
            await this.prisma.like.deleteMany({ where: { postId: post.id } });
            await this.prisma.comment.deleteMany({ where: { postId: post.id } });
        }
        await this.prisma.post.deleteMany({ where: { userId: targetId } });

        // Step 7: Delete profile
        await this.prisma.profile.deleteMany({ where: { userId: targetId } });

        // Step 8: Finally delete the user
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