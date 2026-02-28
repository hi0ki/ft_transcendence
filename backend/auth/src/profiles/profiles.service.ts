import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
    constructor(private prisma: PrismaService) {}

    async getMyProfile(userId: number) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        createdAt: true,
                    },
                },
            },
        });
        if (!profile) {
            throw new NotFoundException('Profile not found');
        }
        return profile;
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