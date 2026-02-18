// import { Injectable , NotFoundException } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { UpdateProfileDto } from './dto/update-profile.dto';


// @Injectable()
// export class ProfilesService{
//     constructor(private prisma : PrismaService){}

//     async getProfile(id :Number){
//         const profile = await this.prisma.profile.findUnique({
//             where : {id},
//             include :{ 
//                 select : {
//                     id : true,
//                     email: true,
//                     role: true,
//                     createdAt: true,
//                 }
//             }
//             if (!profile) {
//                 throw new NotFoundException('Profile not found');
//               }
//             return profile;
//         })
//     }

//     async updateProfile(id : number, data: UpdateProfileDto)
//     {
//         return await this.prisma.profile.update({
//             where: { id },
//             data: {
//               username: data.username,
//               fullName: data.fullName,
//               avatarUrl: data.avatarUrl,
//               bio: data.bio,
//             },
//           });
//     }
// }