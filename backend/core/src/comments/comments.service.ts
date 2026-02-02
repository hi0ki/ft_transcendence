import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto, UpdateCommentDto } from './dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new comment (top-level or reply)
   */
  async create(createCommentDto: CreateCommentDto) {
    const { postId, userId, parentId, content } = createCommentDto;

    // Verify post exists
    const post = await this.prisma.posts.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Verify user exists
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // If parentId is provided, verify parent comment exists and belongs to the same post
    if (parentId) {
      const parentComment = await this.prisma.comments.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        throw new NotFoundException(`Parent comment with ID ${parentId} not found`);
      }

      if (parentComment.post_id !== postId) {
        throw new BadRequestException('Parent comment does not belong to the specified post');
      }

      if (parentComment.is_deleted) {
        throw new BadRequestException('Cannot reply to a deleted comment');
      }
    }

    return this.prisma.comments.create({
      data: {
        post_id: postId,
        user_id: userId,
        parent_id: parentId || null,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        reactions: true,
      },
    });
  }

  /**
   * Get all comments for a post with nested structure
   */
  async findByPost(postId: number, includeDeleted = false) {
    const post = await this.prisma.posts.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Get all top-level comments (no parent)
    const comments = await this.prisma.comments.findMany({
      where: {
        post_id: postId,
        parent_id: null,
        ...(includeDeleted ? {} : { is_deleted: false }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        reactions: true,
        replies: {
          where: includeDeleted ? {} : { is_deleted: false },
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
            reactions: true,
            replies: {
              where: includeDeleted ? {} : { is_deleted: false },
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
                reactions: true,
              },
              orderBy: { created_at: 'asc' },
            },
          },
          orderBy: { created_at: 'asc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return comments;
  }

  /**
   * Get a single comment by ID
   */
  async findOne(id: number) {
    const comment = await this.prisma.comments.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        reactions: true,
        replies: {
          where: { is_deleted: false },
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
            reactions: true,
          },
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  /**
   * Update a comment (only by owner)
   */
  async update(id: number, userId: number, updateCommentDto: UpdateCommentDto) {
    const comment = await this.prisma.comments.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    if (comment.is_deleted) {
      throw new BadRequestException('Cannot edit a deleted comment');
    }

    return this.prisma.comments.update({
      where: { id },
      data: {
        content: updateCommentDto.content,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        reactions: true,
      },
    });
  }

  /**
   * Soft delete a comment (only by owner)
   */
  async softDelete(id: number, userId: number) {
    const comment = await this.prisma.comments.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    if (comment.is_deleted) {
      throw new BadRequestException('Comment is already deleted');
    }

    return this.prisma.comments.update({
      where: { id },
      data: {
        is_deleted: true,
        content: '[deleted]',
      },
    });
  }

  /**
   * Get comment count for a post
   */
  async getCommentCount(postId: number) {
    return this.prisma.comments.count({
      where: {
        post_id: postId,
        is_deleted: false,
      },
    });
  }
}
