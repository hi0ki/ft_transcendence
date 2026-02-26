import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePostDto } from './dto/update-post.dto';

const POST_INCLUDE = {
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
};

@Injectable()
export class PostsService {
	constructor(private prisma: PrismaService) { }

	createPost(data: {
		userId: number;
		type: 'HELP' | 'RESOURCE' | 'MEME';
		title: string;
		content: string;
	}) {
		return this.prisma.post.create({
			data: {
				...data,
				status: 'PENDING', // explicit — new posts always start as pending
			},
			include: POST_INCLUDE,
		});
	}

	// Feed: APPROVED posts + own PENDING posts
	getAllPosts(userId?: number) {
		return this.prisma.post.findMany({
			where: {
				OR: [
					{ status: 'APPROVED' },
					userId ? { userId, status: 'PENDING' } : undefined,
				].filter(Boolean) as any,
			},
			include: POST_INCLUDE,
			orderBy: { createdAt: 'desc' },
		});
	}

	// Admin: all posts, optionally filtered by status
	adminGetAllPosts(status?: 'PENDING' | 'APPROVED') {
		return this.prisma.post.findMany({
			where: status ? { status } : undefined,
			include: POST_INCLUDE,
			orderBy: { createdAt: 'desc' },
		});
	}

	// Admin: update post status (approve)
	async updatePostStatus(id: number, status: 'PENDING' | 'APPROVED') {
		const post = await this.prisma.post.findUnique({ where: { id } });
		if (!post) throw new NotFoundException('Post not found');
		return this.prisma.post.update({ where: { id }, data: { status } });
	}

	// Admin: delete any post (no ownership check)
	async adminDeletePost(id: number) {
		const post = await this.prisma.post.findUnique({ where: { id } });
		if (!post) throw new NotFoundException('Post not found');
		await this.prisma.comment.deleteMany({ where: { postId: id } });
		await this.prisma.like.deleteMany({ where: { postId: id } });
		await this.prisma.notification.deleteMany({ where: { postId: id } });
		return this.prisma.post.delete({ where: { id } });
	}

	async update(id: number, dto: UpdatePostDto, userId: number) {
		const post = await this.prisma.post.findUnique({ where: { id } });
		if (!post) throw new NotFoundException('Post not found');
		if (post.userId !== userId) throw new ForbiddenException('You can only update your own posts');
		return this.prisma.post.update({ where: { id }, data: dto });
	}

	async remove(id: number, userId: number) {
		const post = await this.prisma.post.findUnique({ where: { id } });
		if (!post) throw new NotFoundException('Post not found');
		if (post.userId !== userId) throw new ForbiddenException('You can only delete your own posts');
		await this.prisma.comment.deleteMany({ where: { postId: id } });
		await this.prisma.like.deleteMany({ where: { postId: id } });
		await this.prisma.notification.deleteMany({ where: { postId: id } });
		return this.prisma.post.delete({ where: { id } });
	}

	async getOne(id: number) {
		return this.prisma.post.findUnique({
			where: { id },
			include: POST_INCLUDE,
		});
	}
}
