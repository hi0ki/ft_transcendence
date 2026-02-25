import {
    Body, Controller, Get, Param, ParseIntPipe,
    Post, Delete, Put, Query, UseGuards, Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CommentsService } from './comments.service';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    @Get('post/:postId')
    findAllByPost(@Param('postId', ParseIntPipe) postId: number) {
        return this.commentsService.findAllByPost(postId);
    }

    @Get('post/:postId/count')
    countByPost(@Param('postId', ParseIntPipe) postId: number) {
        return this.commentsService.countByPost(postId);
    }

    @Post()
    @UseGuards(AuthGuard)
    create(
        @Req() req: Request & { user: { id: number } },
        @Body() body: { postId: number; content: string },
    ) {
        return this.commentsService.create(req.user.id, body);
    }

    @Put('update')
    @UseGuards(AuthGuard)
    update(
        @Req() req: Request & { user: { id: number } },
        @Body() body: { commentId: number; postId: number; content: string },
    ) {
        return this.commentsService.update(req.user.id, body);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    delete(
        @Req() req: Request & { user: { id: number } },
        @Param('id', ParseIntPipe) commentId: number,
        @Query('postId', ParseIntPipe) postId: number,
    ) {
        return this.commentsService.delete(req.user.id, commentId, postId);
    }
}
