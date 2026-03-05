import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePostDto } from './dto/update-post.dto';
import { SearchPostsDto } from './dto/search-posts.dto';

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
	_count: {
		select: {
			likes: true,
			comments: true,
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
		imageUrl?: string;
		contentUrl?: string;
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
		return this.prisma.post.delete({ where: { id } });
	}

	async getOne(id: number) {
		return this.prisma.post.findUnique({
			where: { id },
			include: POST_INCLUDE,
		});
	}

	// ── Advanced search with filters, sorting, pagination ──────────────
	async searchPosts(dto: SearchPostsDto, userId?: number) {
		const { q, type, sortBy = 'createdAt', order = 'desc', page = 1, limit = 10 } = dto;

		// Visibility: APPROVED posts + own PENDING posts (same as feed)
		const statusFilter: any = {
			OR: [
				{ status: 'APPROVED' },
				userId ? { userId, status: 'PENDING' } : undefined,
			].filter(Boolean),
		};

		const where: any = { AND: [statusFilter] };

		if (type) {
			where.AND.push({ type });
		}

		if (q && q.trim()) {
			where.AND.push({
				OR: [
					{ title: { contains: q, mode: 'insensitive' } },
					{ content: { contains: q, mode: 'insensitive' } },
				],
			});
		}

		const orderBy: any =
			sortBy === 'reactions'
				? { likes: { _count: 'desc' as const } }
				: { createdAt: order };

		const skip = (page - 1) * limit;

		const [data, total] = await this.prisma.$transaction([
			this.prisma.post.findMany({
				where,
				include: POST_INCLUDE,
				orderBy,
				skip,
				take: limit,
			}),
			this.prisma.post.count({ where }),
		]);

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}
}
