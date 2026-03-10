import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ReactionsService {
    private readonly authUrl: string;

    constructor(private readonly http: HttpService) {
        this.authUrl = process.env.AUTH_SERVICE_URL || 'http://auth_service:3000';
    }


    async toggle(userId: number, postId: number, type: string) {
        try {
            const { data: existing } = await firstValueFrom(
                this.http.get(`${this.authUrl}/reactions/user/${userId}/post/${postId}`),
            );

            if (existing && existing.type) {
                if (existing.type === type) {
                    await firstValueFrom(
                        this.http.delete(`${this.authUrl}/reactions`, {
                            data: { userId, postId },
                        }),
                    );
                    return { action: 'removed', reaction: null };
                } else {
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
            if (err.response?.status !== 404) {
                const data = err.response?.data;
                if (data !== null && data !== '' && err.response?.status >= 400) {
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
