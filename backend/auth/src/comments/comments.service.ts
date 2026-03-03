import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {

  constructor(private prisma: PrismaService) { }

  // Create a new comment
  async create(createCommentDto: CreateCommentDto, userId: number) {
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

  // update a comment by its ID
  async update(updateCommentDto: UpdateCommentDto)
  {
    return this.prisma.comment.update({
      where: { id : updateCommentDto.commentId },
      data: { content: updateCommentDto.content },
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

  // Get all comments for a specific post
  async findAllByPost(postId: number) {
    console.log("Finding comments for post ID:", postId);
    return this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
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

  // delete a comment by its ID (only if user owns it)
  async delete(commentId: number, userId: number)
  {
    // Verify the comment belongs to the user before deleting
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.userId !== userId)
    {
      throw new Error('Comment not found or you do not have permission to delete it');
    }

    return this.prisma.comment.delete({
      where: { id: commentId },
    });
  }

  // count the number of comments for a specific post
  async countCmntsByPost(postId: number)
  {
    return this.prisma.comment.count({
      where: { postId },
    });
  }

}
