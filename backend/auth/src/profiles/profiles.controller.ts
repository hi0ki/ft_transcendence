// import { Controller , Get, Patch, Body, Req, UseGuards} from '@nestjs/common';
// import { ProfilesService } from './profiles.service';
// import { UpdateProfileDto } from './dto/update-profile.dto';
// import { AuthGuard } from '../auth/auth.guard';

// @Controller('profiles')
// @UseGuards(AuthGuard)
// export class ProfilesController{
//     constructor(private profilesService: ProfilesService) {}

//     @Get('me')
//     async getProfile() //@Req() req
//     {
//         return "haaaaay";
//         // return this.profilesService.getMyProfile(req.user.id);
//     }

//     // @Patch('me')
//     // async updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto)
//     // {
//     //     return this.profilesService.updateMyProfile(req.user.id, updateProfileDto);
//     // }
// }

import { Controller, Get, Patch, UseGuards, Req, Body } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { AuthGuard } from '../guards/auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profiles')
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  getMyProfile(@Req() req: any){//@Req() req: any
    // return "huiiiiii";
    return this.profilesService.getMyProfile(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Patch()
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.profilesService.updateProfile(req.user.id, dto);
  }
}
