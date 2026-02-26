import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';

@Injectable()
export class ReactionsService {
    constructor(private prisma: PrismaService) {}

    async create(createReactionDto: CreateReactionDto) {
        return this.prisma.like.create({
            data: {
                userId: createReactionDto.userId,
                postId: createReactionDto.postId,
                type: createReactionDto.type,
            },
        });
    }

    async update(updateReactionDto: UpdateReactionDto) {
        return this.prisma.like.update({
            where : { userId_postId: {
                userId: updateReactionDto.userId,
                postId: updateReactionDto.postId,
            }},
            data: {
                type  : updateReactionDto.type,
            },
        });
    }
    async delete(userId: number, postId: number) {
        return this.prisma.like.delete({
            where : { userId_postId: {
                userId: userId,
                postId: postId,
            } },
        });
    }

    async countReactionsByPost(postId: number) {
        return this.prisma.like.count({
            where: { postId },
        });
    }

    async findAllByPost(postId: number) {
        return this.prisma.like.findMany({
            where: { postId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                username: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findUserReaction(userId: number, postId: number) {
        return this.prisma.like.findUnique({
            where: { userId_postId: { userId, postId } },
        });
    }
}

