import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { ReactionsService } from './reactions.service';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('reactions')
export class ReactionsController {
    constructor(private readonly reactionsService: ReactionsService) {}

    /**
     * Toggle a reaction: creates if new, removes if same type exists.
     * POST /reactions/toggle  { postId, type }
     */
    @Post('toggle')
    @UseGuards(AuthGuard)
    toggle(
        @Req() req: Request & { user: { id: number } },
        @Body() body: { postId: number; type: string },
    ) {
        return this.reactionsService.toggle(req.user.id, body.postId, body.type);
    }

    /**
     * Update an existing reaction to a different type.
     * PUT /reactions/update  { postId, type }
     */
    @Put('update')
    @UseGuards(AuthGuard)
    update(
        @Req() req: Request & { user: { id: number } },
        @Body() body: { postId: number; type: string },
    ) {
        return this.reactionsService.update(req.user.id, body.postId, body.type);
    }

    /**
     * Get reaction counts grouped by type for a post.
     * GET /reactions/post/:postId/count
     */
    @Get('post/:postId/count')
    countByPost(@Param('postId', ParseIntPipe) postId: number) {
        return this.reactionsService.countByPost(postId);
    }
}
