import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /**
   * Create a new comment
   * POST /comments
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(createCommentDto);
  }

  /**
   * Get all comments for a post with nested structure
   * GET /comments/post/:postId
   */
  @Get('post/:postId')
  async findByPost(
    @Param('postId', ParseIntPipe) postId: number,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    const showDeleted = includeDeleted === 'true';
    return this.commentsService.findByPost(postId, showDeleted);
  }

  /**
   * Get a single comment by ID
   * GET /comments/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.findOne(id);
  }

  /**
   * Update a comment (only by owner)
   * PUT /comments/:id
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @Body('userId', ParseIntPipe) userId: number,
  ) {
    return this.commentsService.update(id, userId, updateCommentDto);
  }

  /**
   * Soft delete a comment (only by owner)
   * DELETE /comments/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async softDelete(
    @Param('id', ParseIntPipe) id: number,
    @Body('userId', ParseIntPipe) userId: number,
  ) {
    return this.commentsService.softDelete(id, userId);
  }

  /**
   * Get comment count for a post
   * GET /comments/post/:postId/count
   */
  @Get('post/:postId/count')
  async getCommentCount(@Param('postId', ParseIntPipe) postId: number) {
    const count = await this.commentsService.getCommentCount(postId);
    return { postId, count };
  }
}
