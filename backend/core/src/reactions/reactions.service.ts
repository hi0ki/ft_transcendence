import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ToggleReactionDto, ReactionType, TargetType } from './dto/toggle-reaction.dto';

export interface ReactionSummary {
  like: number;
  helpful: number;
  funny: number;
  insightful: number;
  celebrate: number;
  total: number;
  userReaction?: ReactionType | null;
}

@Injectable()
export class ReactionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Toggle a reaction (add if not exists, remove if exists)
   */
  async toggle(toggleReactionDto: ToggleReactionDto) {
    const { userId, targetType, postId, commentId, type } = toggleReactionDto;

    // Validate target
    if (targetType === TargetType.POST) {
      if (!postId) {
        throw new BadRequestException('postId is required for post reactions');
      }

      const post = await this.prisma.posts.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }
    } else if (targetType === TargetType.COMMENT) {
      if (!commentId) {
        throw new BadRequestException('commentId is required for comment reactions');
      }

      const comment = await this.prisma.comments.findUnique({
        where: { id: commentId },
      });

      if (!comment) {
        throw new NotFoundException(`Comment with ID ${commentId} not found`);
      }

      if (comment.is_deleted) {
        throw new BadRequestException('Cannot react to a deleted comment');
      }
    }

    // Verify user exists
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if reaction already exists
    const existingReaction = await this.prisma.reactions.findFirst({
      where: {
        user_id: userId,
        type: type,
        ...(targetType === TargetType.POST
          ? { post_id: postId, comment_id: null }
          : { comment_id: commentId, post_id: null }),
      },
    });

    if (existingReaction) {
      // Remove reaction if it exists
      await this.prisma.reactions.delete({
        where: { id: existingReaction.id },
      });

      return {
        action: 'removed',
        reaction: existingReaction,
      };
    } else {
      // Add new reaction
      const newReaction = await this.prisma.reactions.create({
        data: {
          user_id: userId,
          type: type,
          post_id: targetType === TargetType.POST ? postId : null,
          comment_id: targetType === TargetType.COMMENT ? commentId : null,
        },
      });

      return {
        action: 'added',
        reaction: newReaction,
      };
    }
  }

  /**
   * Get reactions summary for a post
   */
  async getPostReactionsSummary(postId: number, userId?: number): Promise<ReactionSummary> {
    const post = await this.prisma.posts.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    return this.getReactionsSummary('post', postId, userId);
  }

  /**
   * Get reactions summary for a comment
   */
  async getCommentReactionsSummary(commentId: number, userId?: number): Promise<ReactionSummary> {
    const comment = await this.prisma.comments.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    return this.getReactionsSummary('comment', commentId, userId);
  }

  /**
   * Helper: Get aggregated reactions summary
   */
  private async getReactionsSummary(
    targetType: 'post' | 'comment',
    targetId: number,
    userId?: number,
  ): Promise<ReactionSummary> {
    const whereClause =
      targetType === 'post'
        ? { post_id: targetId, comment_id: null }
        : { comment_id: targetId, post_id: null };

    // Get all reactions grouped by type
    const reactions = await this.prisma.reactions.groupBy({
      by: ['type'],
      where: whereClause,
      _count: {
        type: true,
      },
    });

    // Initialize summary
    const summary: ReactionSummary = {
      like: 0,
      helpful: 0,
      funny: 0,
      insightful: 0,
      celebrate: 0,
      total: 0,
      userReaction: null,
    };

    // Populate counts
    for (const reaction of reactions) {
      const type = reaction.type as keyof Omit<ReactionSummary, 'total' | 'userReaction'>;
      summary[type] = reaction._count.type;
      summary.total += reaction._count.type;
    }

    // Get user's reaction if userId provided
    if (userId) {
      const userReaction = await this.prisma.reactions.findFirst({
        where: {
          ...whereClause,
          user_id: userId,
        },
      });

      if (userReaction) {
        summary.userReaction = userReaction.type as ReactionType;
      }
    }

    return summary;
  }

  /**
   * Get all users who reacted to a post/comment with a specific reaction type
   */
  async getReactionUsers(
    targetType: 'post' | 'comment',
    targetId: number,
    reactionType: ReactionType,
  ) {
    const whereClause =
      targetType === 'post'
        ? { post_id: targetId, comment_id: null }
        : { comment_id: targetId, post_id: null };

    const reactions = await this.prisma.reactions.findMany({
      where: {
        ...whereClause,
        type: reactionType,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return reactions.map((r) => ({
      userId: r.user.id,
      email: r.user.email,
      reactedAt: r.created_at,
    }));
  }

  /**
   * Get all reactions by a user
   */
  async getUserReactions(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.prisma.reactions.findMany({
      where: { user_id: userId },
      include: {
        post: {
          select: {
            id: true,
            title: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
