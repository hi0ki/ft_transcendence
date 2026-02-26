import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
	constructor(private prisma: PrismaService) {}

	createPost(data: {
		userId: number;
		type: 'HELP' | 'RESOURCE' | 'MEME';
		title: string;
		content: string;
	}) {
		return this.prisma.post.create({
			data,
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

	getAllPosts() {
		return this.prisma.post.findMany({
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
		return this.prisma.post.delete({ where: { id } });
	}

	async getOne(id: number) {
		return this.prisma.post.findUnique({
			where: { id },
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
}
