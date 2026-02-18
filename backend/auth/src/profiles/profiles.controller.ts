// import { Controller , Get, Patch, Body, Req, UseGuards} from '@nestjs/common';
// import { ProfilesService } from './profiles.service';
// import { UpdateProfileDto } from './dto/update-profile.dto';
// import { AuthGuard } from '../auth/auth.guard';

// @Controller('profile')
// @UseGuards(AuthGuard)
// export class ProfilesController{
//     constructor(private profilesService: ProfilesService) {}

//     @Get()
//     async getProfile(@Req() req)
//     {
//         return this.profilesService.getProfile(req.user.id);
//     }

//     @Patch()
//     async updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto)
//     {
//         return this.profilesService.updateProfile(req.user.id, updateProfileDto);
//     }
// }