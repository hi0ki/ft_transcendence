import {
    Body, Controller, Get, Param, ParseIntPipe,
    Post, Delete, Put, Query, UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

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
        @CurrentUser() user: { id: number },
        @Body() body: { postId: number; content: string },
    ) {
        return this.commentsService.create(user.id, body);
    }

    @Put('update')
    @UseGuards(AuthGuard)
    update(
        @CurrentUser() user: { id: number },
        @Body() body: { commentId: number; postId: number; content: string },
    ) {
        return this.commentsService.update(user.id, body);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    delete(
        @CurrentUser() user: { id: number },
        @Param('id', ParseIntPipe) commentId: number,
        @Query('postId', ParseIntPipe) postId: number,
    ) {
        return this.commentsService.delete(user.id, commentId, postId);
    }
}
