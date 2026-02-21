import { Injectable } from '@nestjs/common';
import { PrismaService } from  '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async getAllUsers() {
        return this.prisma.user.findMany({
            select: {
            id: true,
            email: true,
            passwordHash: true,
            },
        });
    }
}
