import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
    constructor(private prisma: PrismaService) {}

    async getMyProfile(userId: number) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
                select: {
                    skills: true,
                    bio: true,
                    avatarUrl: true,
                    username: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        createdAt: true,
                        posts: {
                            orderBy: { createdAt: 'desc' },
                        },
                        _count: {
                            select: {
                                friendshipsAsUser1 : { where: { status: 'ACCEPTED' } },
                                friendshipsAsUser2 : { where: { status: 'ACCEPTED' } },
                            },
                        },
                    },
                },
            },
        });
        if (!profile) {
            throw new NotFoundException('Profile not found');
        }
        const myFriendsCount =
            (profile.user._count.friendships ?? 0) +
            (profile.user._count.friendOf ?? 0);
        return { ...profile, user: { ...profile.user, friendsCount: myFriendsCount } };
    }

    async getProfile(username: string) {
        const profile = await this.prisma.profile.findUnique({
            where: { username },
            select: {
                skills: true,
                bio: true,
                avatarUrl: true,
                username: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        createdAt: true,
                        posts: {
                            where: { status: 'APPROVED' },
                            orderBy: { createdAt: 'desc' },
                        },
                        _count: {
                            select: {
                                friendshipsAsUser1 : { where: { status: 'ACCEPTED' } },
                                friendshipsAsUser2 :    { where: { status: 'ACCEPTED' } },
                            },
                        },
                    },
                },
            },
        });
        if (!profile) {
            throw new NotFoundException('Profile not found');
        }
        const friendsCount =
            (profile.user._count.friendships ?? 0) +
            (profile.user._count.friendOf ?? 0);
        return { ...profile, user: { ...profile.user, friendsCount } };
    }

    async updateProfile(userId: number, dto: UpdateProfileDto) {
        return this.prisma.profile.update({
            where: { userId },
            data: {
                username: dto.username,
                avatarUrl: dto.avatarUrl,
                bio: dto.bio,
                skills: dto.skills,
            },
        });
    }
}