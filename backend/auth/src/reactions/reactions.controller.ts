import { Controller , Get, Post, Body, Param, Put, ParseIntPipe, Delete, UseGuards, Req } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { AuthGuard } from '../guards/auth.guard';
import { ReactionType } from '@prisma/client';

@UseGuards(AuthGuard)
@Controller('reactions')
export class ReactionsController {
    constructor(private readonly reactionsService: ReactionsService) {}

    @Post()
    create(@Req() req : any, @Body() createReactionDto: CreateReactionDto) {
        return this.reactionsService.create(createReactionDto, req.user?.id);
    }

    @Post('toggle')
    async toggle(@Req() req: any, @Body() body: { postId: number; type: ReactionType }) {
        const userId = req.user?.id;
        const existing = await this.reactionsService.findByUserAndPost(userId, body.postId);
        if (existing) {
            if (existing.type === body.type) {
                await this.reactionsService.delete(userId, body.postId);
                return { action: 'removed', reaction: null };
            } else {
                const updated = await this.reactionsService.update({ postId: body.postId, type: body.type }, userId);
                return { action: 'updated', reaction: updated };
            }
        } else {
            const created = await this.reactionsService.create({ postId: body.postId, type: body.type }, userId);
            return { action: 'created', reaction: created };
        }
    }

    @Put('update')
    update(@Req() req : any, @Body() updateReactionDto: UpdateReactionDto) {
        return this.reactionsService.update(updateReactionDto, req.user?.id);
    }

    @Delete()
    delete(@Req() req: any, @Body() postId: number ) {
        return this.reactionsService.delete(req.user?.id, postId);
    }

    @Get('mine/:postId')
    getMyReaction(@Req() req: any, @Param('postId', ParseIntPipe) postId: number) {
        return this.reactionsService.findByUserAndPost(req.user?.id, postId);
    }

    @Get('post/:postId/count')
    countReactionsByPost(@Param('postId', ParseIntPipe) postId: number) {
        return this.reactionsService.countReactionsByPost(postId);
    }

    @Get('user/:userId/post/:postId')
    findByUserAndPost(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('postId', ParseIntPipe) postId: number,
    ) {
        return this.reactionsService.findByUserAndPost(userId, postId);
    }

    @Get('post/:postId')
    findAllByPost(@Param('postId', ParseIntPipe) postId: number) {
        return this.reactionsService.findAllByPost(postId);
    }

    @Get('post/:postId/counts')
    countByType(@Param('postId', ParseIntPipe) postId: number) {
        return this.reactionsService.countByType(postId);
    }
}
