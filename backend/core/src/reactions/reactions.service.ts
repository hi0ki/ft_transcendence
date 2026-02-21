import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReactionType } from '@prisma/client';

@Injectable()
export class ReactionsService {
    constructor(private prisma: PrismaService) {}

    // Toggle a reaction: same type again removes it, different type updates it
    async toggle(userId: number, postId: number, type: ReactionType) {
        const existing = await this.prisma.like.findUnique({
            where: { userId_postId: { userId, postId } },
        });

        if (existing) {
            if (existing.type === type) {
                // Same reaction type → remove it (toggle off)
                await this.prisma.like.delete({
                    where: { userId_postId: { userId, postId } },
                });
                return { action: 'removed', reaction: null };
            } else {
                // Different type → update
                const updated = await this.prisma.like.update({
                    where: { userId_postId: { userId, postId } },
                    data: { type },
                });
                return { action: 'updated', reaction: updated };
            }
        }

        // No existing reaction → create
        const created = await this.prisma.like.create({
            data: { userId, postId, type },
        });
        return { action: 'created', reaction: created };
    }

    // Count reactions grouped by type for a post
    async countByPost(postId: number) {
        const reactions = await this.prisma.like.groupBy({
            by: ['type'],
            where: { postId },
            _count: { type: true },
        });

        const counts: Record<string, number> = {};
        let total = 0;
        for (const r of reactions) {
            counts[r.type] = r._count.type;
            total += r._count.type;
        }

        return { postId, total, counts };
    }
}
