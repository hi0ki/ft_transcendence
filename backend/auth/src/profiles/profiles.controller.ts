import { Controller, Get, Patch, UseGuards, Req, Body, Param } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { AuthGuard } from '../guards/auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profiles')
@UseGuards(AuthGuard)
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Get('me')
  getMyProfile(@Req() req: any){
    return this.profilesService.getMyProfile(req.user.id);
  }

  @Get(':username')
  getProfile(@Param('username') username: string) {
    return this.profilesService.getProfile(username);
  }

  @Patch()
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.profilesService.updateProfile(req.user.id, dto);
  }
}
