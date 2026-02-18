import { Body, Controller, Get, Param, ParseIntPipe, Post , Delete} from '@nestjs/common';
import { CommentsService } from './comments.service';


@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    @Get('post/:postId')
    findAllByPost(@Param('postId', ParseIntPipe) postId: number) {
        return this.commentsService.findAllByPost(postId);
    }

    @Get("posts/count/:postId")
    countCmntsByPost(@Param('postId', ParseIntPipe) postId: number) {
        return this.commentsService.countCmntsByPost(postId);
    }

    @Post()
    create(@Body() createCommentDto: any) {
        return this.commentsService.create(createCommentDto);
    }

    @Post('update')
    update(@Body() updateCommentDto: any) {
        return this.commentsService.update(updateCommentDto);
    }

    @Delete(':id')
    delete(@Param('id', ParseIntPipe) commentId: number) {
        return this.commentsService.delete(commentId);
    }
}
