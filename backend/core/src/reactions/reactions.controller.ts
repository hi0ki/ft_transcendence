import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { ToggleReactionDto, ReactionType } from './dto/toggle-reaction.dto';

@Controller('reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  /**
   * Toggle a reaction (add/remove)
   * POST /reactions/toggle
   */
  @Post('toggle')
  @HttpCode(HttpStatus.OK)
  async toggle(@Body() toggleReactionDto: ToggleReactionDto) {
    return this.reactionsService.toggle(toggleReactionDto);
  }

  /**
   * Get reactions summary for a post
   * GET /reactions/post/:postId/summary
   */
  @Get('post/:postId/summary')
  async getPostReactionsSummary(
    @Param('postId', ParseIntPipe) postId: number,
    @Query('userId') userId?: string,
  ) {
    const parsedUserId = userId ? parseInt(userId, 10) : undefined;
    return this.reactionsService.getPostReactionsSummary(postId, parsedUserId);
  }

  /**
   * Get reactions summary for a comment
   * GET /reactions/comment/:commentId/summary
   */
  @Get('comment/:commentId/summary')
  async getCommentReactionsSummary(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Query('userId') userId?: string,
  ) {
    const parsedUserId = userId ? parseInt(userId, 10) : undefined;
    return this.reactionsService.getCommentReactionsSummary(commentId, parsedUserId);
  }

  /**
   * Get users who reacted to a post with a specific type
   * GET /reactions/post/:postId/users
   */
  @Get('post/:postId/users')
  async getPostReactionUsers(
    @Param('postId', ParseIntPipe) postId: number,
    @Query('type') type: ReactionType,
  ) {
    return this.reactionsService.getReactionUsers('post', postId, type);
  }

  /**
   * Get users who reacted to a comment with a specific type
   * GET /reactions/comment/:commentId/users
   */
  @Get('comment/:commentId/users')
  async getCommentReactionUsers(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Query('type') type: ReactionType,
  ) {
    return this.reactionsService.getReactionUsers('comment', commentId, type);
  }

  /**
   * Get all reactions by a user
   * GET /reactions/user/:userId
   */
  @Get('user/:userId')
  async getUserReactions(@Param('userId', ParseIntPipe) userId: number) {
    return this.reactionsService.getUserReactions(userId);
  }
}
