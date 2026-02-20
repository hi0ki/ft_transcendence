import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
	constructor(private prisma: PrismaService) {}

	createPost(data: 
		{
			user_id: number;
			type: 'help' | 'resource' | 'meme';
			title: string;
			content: string;
		}) {
		return this.prisma.posts.create({data, });
	}

	getAllPosts() {
		return this.prisma.posts.findMany();
	}
}
