import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const THRESHOLDS = {
    FIRST_POSTER:     5,
    REACTION_MASTER:  5,
    COMMENT_KING:    15,
};

@Injectable()
export class AchievementsService {
    constructor(private prisma: PrismaService) {}

    async getProgress(userId: number) {
        const [posts, reactions, comments] = await Promise.all([
            this.prisma.post.count({ where: { userId } }),
            this.prisma.like.count({ where: { userId } }),
            this.prisma.comment.count({ where: { userId } }),
        ]);

        const earned: string[] = [];
        if (posts     >= THRESHOLDS.FIRST_POSTER)
            earned.push('FIRST_POSTER');
        if (reactions >= THRESHOLDS.REACTION_MASTER)
            earned.push('REACTION_MASTER');
        if (comments  >= THRESHOLDS.COMMENT_KING)
            earned.push('COMMENT_KING');

        return { posts, reactions, comments, earned, thresholds: THRESHOLDS };
    }
}
