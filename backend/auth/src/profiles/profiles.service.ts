// import { Injectable , NotFoundException } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { UpdateProfileDto } from './dto/update-profile.dto';

// @Injectable()
// export class ProfilesService{
//     constructor(private prisma : PrismaService){}

//     async getMyProfile(userId :number){
//         const profile = await this.prisma.profile.findUnique({
//             where : {userId},
//             include :{ 
//                 user : {
//                     select : {
//                         id : true,
//                         email: true,
//                         role: true,
//                         createdAt: true,
//                     },
//                 },
//             },
//         });
//         if (!profile) {
//             throw new NotFoundException('Profile not found');
//         }
//         return profile;
//     }

//     async updateMyProfile(userId: number, data: UpdateProfileDto)
//     {
//         return await this.prisma.profile.update({
//             where: { userId },
//             data: {
//               username: data.username,
//               fullName: data.fullName,
//               avatarUrl: data.avatarUrl,
//               bio: data.bio,
//             },
//           });
//     }
// }

/*{
  "userId": 5,
  "username": "fatima",
  "fullName": "Fatima Z",
  "avatarUrl": null,
  "bio": "Developer",
  "user": {
    "id": 5,
    "email": "test@mail.com",
    "role": "USER",
    "createdAt": "2026-02-19T10:22:33.000Z"
  }
}*/



import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async getMyProfile(userId: number) {
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
    console.log("heeeere...");
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