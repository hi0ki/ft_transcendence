import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService 
{
	constructor(private prisma: PrismaService) {}

	createPost(data: 
	{
		userId: number;
		type: 'HELP' | 'RESOURCE' | 'MEME';
		title: string;
		content: string;
	})
	{
		return this.prisma.post.create({data, });
	}

	getAllPosts() 
	{
		return this.prisma.post.findMany();
	}
	async update(id: number, dto: UpdatePostDto) 
	{
		return this.prisma.post.update({ where: { id }, data: dto,});
	}
	async remove(id: number) 
	{
		return this.prisma.post.delete({ where: { id }, });
	}
	async getOne(id: number) 
	{
		return this.prisma.post.findUnique({where: { id },});
	}
}
