import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ParseIntPipe } from '@nestjs/common';

@Controller('posts')
export class PostsController 
{
	constructor(private readonly postsService: PostsService){}

	@Post()
	create(@Body() createPostDto: CreatePostDto)
	{
		return this.postsService.createPost(createPostDto);
	}

	@Get(':id')
	getOne(@Param('id', ParseIntPipe) id: number)
	{
		return this.postsService.getOne(id);
	}

	@Get()
	getAllPosts()
	{
		return this.postsService.getAllPosts();
	}

	@Patch(':id')
	update(@Param('id', ParseIntPipe) id: number, @Body() dto: any,)
	{
	  return this.postsService.update(id, dto);
	}

	@Delete(':id')
	remove(@Param('id', ParseIntPipe) id: number)
	{
		return this.postsService.remove(id);
	}

	// @Delete(':id')
	// remove(@Param('id') id: string)
	// {
	// 	return this.postsService.remove(id);
	// }
}


