import { Controller, Get, Patch, UseGuards, Req, Body } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { AuthGuard } from '../guards/auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profiles')
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  getMyProfile(@Req() req: any){
    return this.profilesService.getMyProfile(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Patch()
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.profilesService.updateProfile(req.user.id, dto);
  }
}
