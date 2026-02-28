import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FriendshipStatus } from '@prisma/client';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async sendRequest(userId: number, friendId: number) {
    if (userId === friendId) {
      throw new BadRequestException('You cannot add yourself');
    }

    const existing = await this.prisma.friendship.findUnique({
      where: { userId_friendId: { userId, friendId } },
    });

    if (existing) {
      throw new BadRequestException('Friend request already exists');
    }

    return this.prisma.friendship.create({
      data: {
        userId,
        friendId,
        status: FriendshipStatus.PENDING,
      },
    });
  }

  async acceptRequest(userId: number, friendId: number) {
    const request = await this.prisma.friendship.findUnique({
      where: { userId_friendId: { userId: friendId, friendId: userId } },
    });

    if (!request || request.status !== FriendshipStatus.PENDING) {
      throw new BadRequestException('No pending request found');
    }

    await this.prisma.friendship.update({
      where: { userId_friendId: { userId: friendId, friendId: userId } },
      data: { status: FriendshipStatus.ACCEPTED },
    });

    return this.prisma.friendship.create({
      data: {
        userId,
        friendId,
        status: FriendshipStatus.ACCEPTED,
      },
    });
  }

  async rejectRequest(userId: number, friendId: number) {
    return this.prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });
  }

  async removeFriend(userId: number, friendId: number) {
    return this.prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId, friendId, status: FriendshipStatus.ACCEPTED },
          { userId: friendId, friendId: userId, status: FriendshipStatus.ACCEPTED },
        ],
      },
    });
  }

  async listFriends(userId: number) {
    const friends = await this.prisma.friendship.findMany({
      where: { userId, status: FriendshipStatus.ACCEPTED },
      include: { friend: true },
    });

    return friends.map(f => f.friend);
  }

  async listPending(userId: number) {
    const pending = await this.prisma.friendship.findMany({
      where: { friendId: userId, status: FriendshipStatus.PENDING },
      include: { user: true },
    });

    return pending.map(p => p.user);
  }
}
