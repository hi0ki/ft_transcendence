import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CommentsService {
    private readonly authUrl: string;

    constructor(private readonly http: HttpService) {
        this.authUrl = process.env.AUTH_SERVICE_URL || 'http://auth_service:3000';
    }

    async findAllByPost(postId: number) {
        const { data } = await firstValueFrom(
            this.http.get(`${this.authUrl}/comments/post/${postId}`),
        );
        return data;
    }

    async countByPost(postId: number) {
        const { data } = await firstValueFrom(
            this.http.get(`${this.authUrl}/comments/posts/${postId}/count`),
        );
        return data;
    }

    async create(userId: number, body: { postId: number; content: string }) {
        try {
            const { data } = await firstValueFrom(
                this.http.post(`${this.authUrl}/comments`, {
                    postId: body.postId,
                    userId,
                    content: body.content,
                }),
            );
            return data;
        } catch (err) {
            throw new HttpException(
                err.response?.data || 'Failed to create comment',
                err.response?.status || 500,
            );
        }
    }

    async update(
        userId: number,
        body: { commentId: number; postId: number; content: string },
    ) {
        // Ownership check: fetch all comments for the post, find ours
        await this.verifyOwnership(body.commentId, body.postId, userId);

        try {
            const { data } = await firstValueFrom(
                this.http.put(`${this.authUrl}/comments/update`, {
                    commentId: body.commentId,
                    userId,
                    content: body.content,
                }),
            );
            return data;
        } catch (err) {
            throw new HttpException(
                err.response?.data || 'Failed to update comment',
                err.response?.status || 500,
            );
        }
    }

    async delete(userId: number, commentId: number, postId: number) {
        // Ownership check
        await this.verifyOwnership(commentId, postId, userId);

        try {
            const { data } = await firstValueFrom(
                this.http.delete(`${this.authUrl}/comments/${commentId}`),
            );
            return data;
        } catch (err) {
            throw new HttpException(
                err.response?.data || 'Failed to delete comment',
                err.response?.status || 500,
            );
        }
    }

    /**
     * Fetches all comments for a post from auth service,
     * finds the target comment, and verifies the requesting user owns it.
     */
    private async verifyOwnership(commentId: number, postId: number, userId: number) {
        const comments = await this.findAllByPost(postId);
        const comment = comments?.find?.((c: any) => c.id === commentId);
        if (!comment) {
            throw new HttpException('Comment not found', 404);
        }
        if (comment.userId !== userId) {
            throw new HttpException('You can only modify your own comments', 403);
        }
    }
}
