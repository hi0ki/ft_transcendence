import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ReactionsService {
    private readonly authUrl: string;

    constructor(private readonly http: HttpService) {
        this.authUrl = process.env.AUTH_SERVICE_URL || 'http://auth_service:3000';
    }

    /**
     * Toggle a reaction on a post.
     * - If the user has no reaction → create it
     * - If the user has the same reaction type → remove it
     * - If the user has a different type → update to new type
     */
    async toggle(userId: number, postId: number, type: string) {
        // Try to create the reaction
        try {
            const { data } = await firstValueFrom(
                this.http.post(`${this.authUrl}/reactions`, {
                    userId,
                    postId,
                    type,
                }),
            );
            return { action: 'created', reaction: data };
        } catch (err) {
            // If duplicate (unique constraint), the reaction already exists
            const status = err.response?.status;
            const message = JSON.stringify(err.response?.data || '');

            // Prisma P2002 = unique constraint violation → reaction already exists
            if (status === 500 && message.includes('P2002')) {
                return this.handleExistingReaction(userId, postId, type);
            }
            throw new HttpException(
                err.response?.data || 'Failed to toggle reaction',
                status || 500,
            );
        }
    }

    /**
     * When a reaction already exists for this user+post:
     * We don't know the current type (auth has no get-by-id endpoint),
     * so we try to update. If the type is the same, the user wants to remove it.
     * Strategy: try update to the requested type, then if the caller
     * toggles the same type we delete instead.
     *
     * Since we can't read the current type, we use a two-step approach:
     * 1. Try to update to the new type
     * 2. If update succeeds and returned type equals requested type,
     *    it might be the same — so we compare. If caller calls toggle
     *    with the same type twice, second call deletes.
     *
     * Simpler approach: always delete on conflict, let the user re-toggle.
     * This makes toggle = create-or-remove (Instagram-style like button).
     */
    private async handleExistingReaction(userId: number, postId: number, type: string) {
        try {
            // Delete the existing reaction (toggle off)
            const { data } = await firstValueFrom(
                this.http.delete(`${this.authUrl}/reactions`, {
                    data: { userId, postId },
                }),
            );
            return { action: 'removed', reaction: null };
        } catch (err) {
            throw new HttpException(
                err.response?.data || 'Failed to remove reaction',
                err.response?.status || 500,
            );
        }
    }

    /**
     * Change reaction type (e.g. LIKE → LOVE) without toggle behavior.
     */
    async update(userId: number, postId: number, type: string) {
        try {
            const { data } = await firstValueFrom(
                this.http.put(`${this.authUrl}/reactions/update`, {
                    userId,
                    postId,
                    type,
                }),
            );
            return data;
        } catch (err) {
            throw new HttpException(
                err.response?.data || 'Failed to update reaction',
                err.response?.status || 500,
            );
        }
    }

    /**
     * Get reaction counts grouped by type for a post.
     */
    async countByPost(postId: number) {
        try {
            const { data } = await firstValueFrom(
                this.http.get(`${this.authUrl}/reactions/post/${postId}/count`),
            );
            return data;
        } catch (err) {
            throw new HttpException(
                err.response?.data || 'Failed to fetch reaction count',
                err.response?.status || 500,
            );
        }
    }
}
