import { Body, Controller, Get, Param, ParseIntPipe, Post, Delete, Put, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
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
    create(@CurrentUser() user: { id: number }, @Body() createCommentDto: CreateCommentDto) {
        return this.commentsService.create(user.id, createCommentDto);
    }

    @Put('update')
    @UseGuards(AuthGuard)
    update(@CurrentUser() user: { id: number }, @Body() updateCommentDto: UpdateCommentDto) {
        return this.commentsService.update(user.id, updateCommentDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    delete(@CurrentUser() user: { id: number }, @Param('id', ParseIntPipe) commentId: number) {
        return this.commentsService.delete(user.id, commentId);
    }
}
