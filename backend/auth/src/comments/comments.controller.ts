import { Body, Controller, Get, Param, ParseIntPipe, Post , Delete, Req, Put} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';


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
    create(@Body() createCommentDto: CreateCommentDto) {
        return this.commentsService.create(createCommentDto);
    }

    @Put('update')
    update(@Body() updateCommentDto: UpdateCommentDto) {
        return this.commentsService.update(updateCommentDto);
    }

    @Delete(':id')
    delete(@Param('id', ParseIntPipe) commentId: number) {
        return this.commentsService.delete(commentId);
    }
}
