import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { ReactionsService } from './reactions.service';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('reactions')
export class ReactionsController {
    constructor(private readonly reactionsService: ReactionsService) {}

    @Post('toggle')
    @UseGuards(AuthGuard)
    toggle(
        @Req() req: Request & { user: { id: number } },
        @Body() body: { postId: number; type: string },
    ) {
        return this.reactionsService.toggle(req.user.id, body.postId, body.type);
    }

    @Put('update')
    @UseGuards(AuthGuard)
    update(
        @Req() req: Request & { user: { id: number } },
        @Body() body: { postId: number; type: string },
    ) {
        return this.reactionsService.update(req.user.id, body.postId, body.type);
    }

    @Get('post/:postId/count')
    countByPost(@Param('postId', ParseIntPipe) postId: number) {
        return this.reactionsService.countByPost(postId);
    }

    @Get('mine/:postId')
    @UseGuards(AuthGuard)
    getMyReaction(
        @Req() req: Request & { user: { id: number } },
        @Param('postId', ParseIntPipe) postId: number,
    ) {
        return this.reactionsService.getMyReaction(req.user.id, postId);
    }

    @Get('post/:postId')
    getReactionsByPost(@Param('postId', ParseIntPipe) postId: number) {
        return this.reactionsService.getReactionsByPost(postId);
    }
}
