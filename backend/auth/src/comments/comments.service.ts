import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto} from './dto/update-comment.dto';

@Injectable()
export class CommentsService {

  constructor(private prisma: PrismaService) {}

  // Create a new comment
  async create(createCommentDto: CreateCommentDto)
  {
    return this.prisma.comment.create({
      data: {
        postId: createCommentDto.postId,
        userId: createCommentDto.userId,
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
    });
  }

  // Get all comments for a specific post
  async findAllByPost(postId: number)
  {
    console.log("Finding comments for post ID:", postId);
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
    });
  }

  // delete a comment by its ID
  async delete(commentId: number)
  {
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
