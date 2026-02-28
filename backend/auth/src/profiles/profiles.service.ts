import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async getMyProfile(userId: number) 
  {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id : true,
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


  async updateProfile(userId: number, data: any) {
    return this.prisma.profile.update({
      where: { userId },
      data,
    });
  }
}