import { Body, Controller, Get, Param, ParseIntPipe, Post, Delete, Req, Put, UseGuards, Query } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '../guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    @Get('post/:postId')
    findAllByPost(@Param('postId', ParseIntPipe) postId: number) {
        return this.commentsService.findAllByPost(postId);
    }

    @Get('post/:postId/count')
    countCmntsByPost(@Param('postId', ParseIntPipe) postId: number) {
        return this.commentsService.countCmntsByPost(postId);
    }

    @Post()
    create(@Req() req: any, @Body() createCommentDto: Omit<CreateCommentDto, 'userId'>) {
        const userId = req.user.id;
        return this.commentsService.create(createCommentDto, userId);
    }

    @Put('update')
    update(@Body() updateCommentDto: UpdateCommentDto) {
        return this.commentsService.update(updateCommentDto);
    }

    @Delete(':id')
    delete(@Req() req: Request, @Param('id', ParseIntPipe) commentId: number, @Query('postId', ParseIntPipe) postId: number) {
        const userId = (req as any).user?.id;
        return this.commentsService.delete(commentId, userId);
    }
}
