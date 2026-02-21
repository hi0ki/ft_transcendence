import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { ToggleReactionDto } from './dto/toggle-reaction.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('reactions')
export class ReactionsController {
    constructor(private readonly reactionsService: ReactionsService) {}

    @Post('toggle')
    @UseGuards(AuthGuard)
    toggle(@CurrentUser() user: { id: number }, @Body() toggleReactionDto: ToggleReactionDto) {
        return this.reactionsService.toggle(user.id, toggleReactionDto.postId, toggleReactionDto.type);
    }

    @Get('post/:postId/count')
    countByPost(@Param('postId', ParseIntPipe) postId: number) {
        return this.reactionsService.countByPost(postId);
    }
}
