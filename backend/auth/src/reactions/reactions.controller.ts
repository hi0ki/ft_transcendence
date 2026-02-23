import { Controller , Get, Post, Body, Param, Put, ParseIntPipe, Delete } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';

@Controller('reactions')
export class ReactionsController {
    constructor(private readonly reactionsService: ReactionsService) {}

    @Post()
    create(@Body() createReactionDto: CreateReactionDto) {
        return this.reactionsService.create(createReactionDto);
    }

    @Put('update')
    update(@Body() updateReactionDto: UpdateReactionDto) {
        return this.reactionsService.update(updateReactionDto);
    }

    @Delete()
    delete(@Body() { userId, postId }: { userId: number; postId: number }) {
        return this.reactionsService.delete(userId, postId);
    }

    @Get('post/:postId/count')
    countReactionsByPost(@Param('postId', ParseIntPipe) postId: number) {
        return this.reactionsService.countReactionsByPost(postId);
    }
}
