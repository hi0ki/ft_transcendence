// import { Injectable , NotFoundException} from '@nestjs/common';
// import { PrismaService } from  '../prisma/prisma.service';
// import { UserRole } from '@prisma/client';

// @Injectable()
// export class UsersService {
//     constructor(private prisma: PrismaService) {}

//     async getAllUsers() {
//         return this.prisma.user.findMany({
//             select: {
//                 id: true,
//                 email: true,
//                 role: true,
//                 createdAt: true,
//             },
//         });
//     }

//     async updateUserRole(userId: number, role: UserRole) {
//         const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
//         if (!userExists) 
//             throw new NotFoundException('User not found');
    
//         return this.prisma.user.update({
//           where: { id: userId },
//           data: { role },
//           select: { id: true, email: true, role: true },
//         });
//     }

//     async deleteUser(userId: number) {
//         const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
//         if (!userExists) 
//             throw new NotFoundException('User not found');

//         return this.prisma.user.delete({
//           where: { id: userId },
//         });
//     }
// }

