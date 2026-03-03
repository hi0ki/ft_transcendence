import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { AuthGuard } from '../guards/auth.guard';

@Controller('achievements')
export class AchievementsController {
    constructor(private readonly service: AchievementsService) {}

    @Get('progress/:userId')
    @UseGuards(AuthGuard)
    getProgress(@Param('userId', ParseIntPipe) userId: number) {
        return this.service.getProgress(userId);
    }
}
