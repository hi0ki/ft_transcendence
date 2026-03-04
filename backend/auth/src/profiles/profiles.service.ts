import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
                                friendshipsAsUser1: { where: { status: 'ACCEPTED' } },
                                friendshipsAsUser2: { where: { status: 'ACCEPTED' } },
                            },
                        }
                    },
                },
            },
        });
        if (!profile) {
            throw new NotFoundException('Profile not found');
        }
        const myFriendsCount =
        (profile.user._count.friendshipsAsUser1 ?? 0) +
        (profile.user._count.friendshipsAsUser2 ?? 0);
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
                                friendshipsAsUser1: { where: { status: 'ACCEPTED' } },
                                friendshipsAsUser2: { where: { status: 'ACCEPTED' } },
                            },
                        }
                    },
                },
            },
        });
        if (!profile) {
            throw new NotFoundException('Profile not found');
        }
        const friendsCount =
    (profile.user._count.friendshipsAsUser1 ?? 0) +
    (profile.user._count.friendshipsAsUser2 ?? 0);
        return { ...profile, user: { ...profile.user, friendsCount } };
    }

    async searchUsers(query?: string, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const where = query
            ? {
                  username: {
                      contains: query,
                      mode: 'insensitive' as const,
                  },
              }
            : {};

        const [profiles, total] = await Promise.all([
            this.prisma.profile.findMany({
                where,
                select: {
                    userId: true,
                    username: true,
                    avatarUrl: true,
                    bio: true,
                    skills: true,
                },
                orderBy: { username: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.profile.count({ where }),
        ]);

        return {
            data: profiles,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async updateProfile(userId: number, dto: UpdateProfileDto) {
        // Check if username is being updated
        if (dto.username) {
            // Check if username is already taken by another user
            const existingProfile = await this.prisma.profile.findUnique({ 
                where: { username: dto.username } 
            });
            
            if (existingProfile && existingProfile.userId !== userId) {
                throw new BadRequestException('Username already exists');
            }
        }
        
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