import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService 
{
	constructor(private prisma: PrismaService) {}

	createPost(data: 
		{
			user_id: number;
			type: 'help' | 'resource' | 'meme';
			title: string;
			content: string;
		})
	{
		return this.prisma.posts.create({data, });
	}

	getAllPosts() 
	{
		return this.prisma.posts.findMany();
	}
	async update(id: number, dto: UpdatePostDto) 
	{
		return this.prisma.posts.update({ where: { id }, data: dto,});
	}
	async remove(id: number) 
	{
		return this.prisma.posts.delete({ where: { id }, });
	}
}
