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
        // First check if user already has a reaction on this post
        try {
            const { data: existing } = await firstValueFrom(
                this.http.get(`${this.authUrl}/reactions/user/${userId}/post/${postId}`),
            );

            if (existing && existing.type) {
                if (existing.type === type) {
                    // Same type → remove (toggle off)
                    await firstValueFrom(
                        this.http.delete(`${this.authUrl}/reactions`, {
                            data: { userId, postId },
                        }),
                    );
                    return { action: 'removed', reaction: null };
                } else {
                    // Different type → update
                    const { data: updated } = await firstValueFrom(
                        this.http.put(`${this.authUrl}/reactions/update`, {
                            userId,
                            postId,
                            type,
                        }),
                    );
                    return { action: 'updated', reaction: updated };
                }
            }
        } catch (err) {
            // 404 or null means no existing reaction → fall through to create
            if (err.response?.status !== 404) {
                // If it's not a "not found" error, check if the response is null/empty
                // which also means no reaction exists
                const data = err.response?.data;
                if (data !== null && data !== '' && err.response?.status >= 400) {
                    // Only throw for real errors, not for "no reaction found"
                }
            }
        }

        // No existing reaction → create
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
            const status = err.response?.status;
            const message = JSON.stringify(err.response?.data || '');

            // Prisma P2002 = unique constraint → already exists, delete it
            if (status === 500 && message.includes('P2002')) {
                try {
                    await firstValueFrom(
                        this.http.delete(`${this.authUrl}/reactions`, {
                            data: { userId, postId },
                        }),
                    );
                    return { action: 'removed', reaction: null };
                } catch (delErr) {
                    throw new HttpException(
                        delErr.response?.data || 'Failed to remove reaction',
                        delErr.response?.status || 500,
                    );
                }
            }
            throw new HttpException(
                err.response?.data || 'Failed to toggle reaction',
                status || 500,
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
     * Get reaction count for a post (plain number).
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

    /**
     * Get the current user's reaction on a post.
     */
    async getMyReaction(userId: number, postId: number) {
        try {
            const { data } = await firstValueFrom(
                this.http.get(`${this.authUrl}/reactions/user/${userId}/post/${postId}`),
            );
            return data;
        } catch (err) {
            return null;
        }
    }

    /**
     * Get all reactions for a post with user profiles.
     */
    async getReactionsByPost(postId: number) {
        try {
            const { data } = await firstValueFrom(
                this.http.get(`${this.authUrl}/reactions/post/${postId}`),
            );
            return data;
        } catch (err) {
            throw new HttpException(
                err.response?.data || 'Failed to fetch reactions',
                err.response?.status || 500,
            );
        }
    }
}
