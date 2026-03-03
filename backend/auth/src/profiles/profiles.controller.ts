import { Controller, Get, Patch, UseGuards, Req, Body, Param, Query } from '@nestjs/common';
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

  @Get('search')
  searchUsers(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.profilesService.searchUsers(
      q,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
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
