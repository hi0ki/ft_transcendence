import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {

  constructor(private prisma: PrismaService) {}

  // Create a new comment
  async create(userId: number, createCommentDto: CreateCommentDto)
  {
    return this.prisma.comment.create({
      data: {
        postId: createCommentDto.postId,
        userId: userId,
        content: createCommentDto.content,
      },
      include: {
        author: {
          select: {
            profile: {
              select: {
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  // update a comment by its ID (only the owner can update)
  async update(userId: number, updateCommentDto: UpdateCommentDto)
  {
    const comment = await this.prisma.comment.findUnique({
      where: { id: updateCommentDto.commentId },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }
    return this.prisma.comment.update({
      where: { id: updateCommentDto.commentId },
      data: { content: updateCommentDto.content },
    });
  }

  // Get all comments for a specific post
  async findAllByPost(postId: number)
  {
    return this.prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select:{
            profile: {
              select: {
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // delete a comment by its ID (only the owner can delete)
  async delete(userId: number, commentId: number)
  {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }
    return this.prisma.comment.delete({
      where: { id: commentId },
    });
  }

  // count the number of comments for a specific post
  async countByPost(postId: number)
  {
    return this.prisma.comment.count({
        where: { postId },
      });
  }
}
