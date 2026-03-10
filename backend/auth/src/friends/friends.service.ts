import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FriendsService {
    constructor(private prisma: PrismaService) { }

    /** Send a friend request from currentUserId to targetUserId */
    async sendRequest(currentUserId: number, targetUserId: number) {
        if (currentUserId === targetUserId) {
            throw new BadRequestException('Cannot send friend request to yourself');
        }

        // Check target user exists
        const target = await this.prisma.user.findUnique({ where: { id: targetUserId } });
        if (!target) throw new NotFoundException('User not found');

        const [lo, hi] = currentUserId < targetUserId
            ? [currentUserId, targetUserId]
            : [targetUserId, currentUserId];

        // Check if friendship already exists
        const existing = await this.prisma.friendship.findUnique({
            where: { user1Id_user2Id: { user1Id: lo, user2Id: hi } },
        });

        if (existing) {
            if (existing.status === 'ACCEPTED') {
                throw new ConflictException('Already friends');
            }
            if (existing.status === 'PENDING') {
                throw new ConflictException('Friend request already pending');
            }
        }

        const friendship = await this.prisma.friendship.create({
            data: {
                user1Id: lo,
                user2Id: hi,
                requestedBy: currentUserId,
                status: 'PENDING',
            },
        });

        return { message: 'Friend request sent', friendship };
    }

    /** Accept a pending friend request sent by senderId to currentUserId */
    async acceptRequest(currentUserId: number, senderId: number) {
        const [lo, hi] = senderId < currentUserId
            ? [senderId, currentUserId]
            : [currentUserId, senderId];

        const friendship = await this.prisma.friendship.findUnique({
            where: { user1Id_user2Id: { user1Id: lo, user2Id: hi } },
        });

        if (!friendship || friendship.status !== 'PENDING') {
            throw new NotFoundException('Pending friend request not found');
        }

        if (friendship.requestedBy === currentUserId) {
            throw new BadRequestException('You cannot accept your own request');
        }

        const updated = await this.prisma.friendship.update({
            where: { user1Id_user2Id: { user1Id: lo, user2Id: hi } },
            data: { status: 'ACCEPTED' },
        });

        return { message: 'Friend request accepted', friendship: updated };
    }

    /** Reject/cancel a friend request */
    async rejectRequest(currentUserId: number, senderId: number) {
        const [lo, hi] = senderId < currentUserId
            ? [senderId, currentUserId]
            : [currentUserId, senderId];

        const friendship = await this.prisma.friendship.findUnique({
            where: { user1Id_user2Id: { user1Id: lo, user2Id: hi } },
        });

        if (!friendship || friendship.status !== 'PENDING') {
            throw new NotFoundException('Pending friend request not found');
        }

        await this.prisma.friendship.delete({
            where: { user1Id_user2Id: { user1Id: lo, user2Id: hi } },
        });

        return { message: 'Friend request rejected' };
    }

    /** Get incoming pending friend requests for the current user */
    async getPendingRequests(currentUserId: number) {
        const friendships = await this.prisma.friendship.findMany({
            where: {
                status: 'PENDING',
                OR: [
                    { user1Id: currentUserId },
                    { user2Id: currentUserId },
                ],
                // Only where someone else sent to us
                NOT: { requestedBy: currentUserId },
            },
            include: {
                user1: {
                    select: {
                        id: true,
                        profile: { select: { username: true, avatarUrl: true } },
                    },
                },
                user2: {
                    select: {
                        id: true,
                        profile: { select: { username: true, avatarUrl: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return friendships.map((f) => {
            const sender = f.requestedBy === f.user1Id ? f.user1 : f.user2;
            return {
                senderId: sender.id,
                username: sender.profile?.username ?? 'Unknown',
                avatarUrl: sender.profile?.avatarUrl ?? null,
                createdAt: f.createdAt,
            };
        });
    }

    /** Get accepted friends list */
    async getFriends(currentUserId: number) {
        const friendships = await this.prisma.friendship.findMany({
            where: {
                status: 'ACCEPTED',
                OR: [
                    { user1Id: currentUserId },
                    { user2Id: currentUserId },
                ],
            },
            include: {
                user1: {
                    select: {
                        id: true,
                        profile: { select: { username: true, avatarUrl: true } },
                    },
                },
                user2: {
                    select: {
                        id: true,
                        profile: { select: { username: true, avatarUrl: true } },
                    },
                },
            },
        });

        return friendships.map((f) => {
            const friend = f.user1Id === currentUserId ? f.user2 : f.user1;
            return {
                id: friend.id,
                username: friend.profile?.username ?? 'Unknown',
                avatarUrl: friend.profile?.avatarUrl ?? null,
            };
        });
    }

    /** Get accepted friends list for any user (public) */
    async getUserFriends(userId: number) {
        return this.getFriends(userId);
    }

    /** Unfriend (delete an accepted friendship) */
    async removeFriend(currentUserId: number, friendId: number) {
        if (currentUserId === friendId) {
            throw new BadRequestException('Cannot unfriend yourself');
        }

        const [lo, hi] = currentUserId < friendId
            ? [currentUserId, friendId]
            : [friendId, currentUserId];

        const friendship = await this.prisma.friendship.findUnique({
            where: { user1Id_user2Id: { user1Id: lo, user2Id: hi } },
        });

        if (!friendship || friendship.status !== 'ACCEPTED') {
            throw new NotFoundException('Friendship not found');
        }

        await this.prisma.friendship.delete({
            where: { user1Id_user2Id: { user1Id: lo, user2Id: hi } },
        });

        return { message: 'Friend removed' };
    }

    /** Get friendship status between current user and target */
    async getStatus(currentUserId: number, targetUserId: number) {
        if (currentUserId === targetUserId) return { status: 'SELF' };

        const [lo, hi] = currentUserId < targetUserId
            ? [currentUserId, targetUserId]
            : [targetUserId, currentUserId];

        const friendship = await this.prisma.friendship.findUnique({
            where: { user1Id_user2Id: { user1Id: lo, user2Id: hi } },
        });

        if (!friendship) return { status: 'NONE' };
        return {
            status: friendship.status,
            requestedBy: friendship.requestedBy,
        };
    }
}
