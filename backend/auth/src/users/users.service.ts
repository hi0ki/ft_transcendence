import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './update-user.dto';
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
      },
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
    if (+requestingUser.id !== targetId && requestingUser.role !== Role.ADMIN) {
      throw new ForbiddenException('You can only delete your own account');
    }
  
    const exists = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!exists) {
      throw new NotFoundException(`User with id "${targetId}" not found`);
    }
  
    // Delete profile first if it exists, then delete the user
    await this.prisma.profile.deleteMany({ where: { userId: targetId } });
    await this.prisma.user.delete({ where: { id: targetId } });
  
    return { message: `User "${targetId}" deleted successfully` };
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