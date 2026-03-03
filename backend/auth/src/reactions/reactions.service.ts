import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';

@Injectable()
export class ReactionsService {
    constructor(private prisma: PrismaService) {}

    async create(createReactionDto: CreateReactionDto, userId: number) {
        return this.prisma.like.create({
            data: {
                userId: userId,
                postId: createReactionDto.postId,
                type: createReactionDto.type,
            },
        });
    }

    async update(updateReactionDto: UpdateReactionDto, userId: number) {
        return this.prisma.like.update({
            where : { userId_postId: {
                userId: userId,
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

    async findByUserAndPost(userId: number, postId: number) {
        return this.prisma.like.findUnique({
            where: { userId_postId: { userId, postId } },
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
        });
    }

    async countByType(postId: number) {
        const reactions = await this.prisma.like.groupBy({
            by: ['type'],
            where: { postId },
            _count: true,
        });
        const total = reactions.reduce((sum, r) => sum + r._count, 0);
        const byType: Record<string, number> = {};
        for (const r of reactions) {
            byType[r.type] = r._count;
        }
        return { total, byType };
    }
}

