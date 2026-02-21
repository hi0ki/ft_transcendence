import { Controller, Post, Get, Body, Patch, Param, Delete} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ParseIntPipe } from '@nestjs/common';

@Controller('posts')
export class PostsController {
	constructor(private postsService: PostsService) {}

	@Post()
	create(@Body() body: CreatePostDto) 
	{
		return this.postsService.createPost(body);
	}

	@Get(':id')
	getOne(@Param('id', ParseIntPipe) id: number)
	{
		return this.postsService.getOne(id);
	}

	@Get()
	getAll() 
	{
		return this.postsService.getAllPosts();
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() dto: UpdatePostDto,) 
	{
		return this.postsService.update(+id, dto);
	}

	@Delete(':id') remove(@Param('id') id: string) 
	{
		return this.postsService.remove(+id);
	}


}
