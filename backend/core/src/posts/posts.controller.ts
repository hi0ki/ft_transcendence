import { Controller, Get, Post, Body, Patch, Param, Delete, Headers, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ParseIntPipe } from '@nestjs/common';

@Controller('posts')
export class PostsController {
	constructor(private readonly postsService: PostsService) { }

	@Post()
	create(@Headers('authorization') auth: string, @Body() createPostDto: CreatePostDto) {
		return this.postsService.createPost(createPostDto, auth);
	}

	@Get('detail/:id')
	getOneDetail(@Headers('authorization') auth: string, @Param('id', ParseIntPipe) id: number) {
		return this.postsService.getOneDetail(id, auth);
	}

	@Get('admin/all')
	adminGetAll(@Headers('authorization') auth: string, @Query('status') status?: string) {
		return this.postsService.adminGetAllPosts(status, auth);
	}

	@Patch('admin/:id/status')
	updateStatus(
		@Headers('authorization') auth: string,
		@Param('id', ParseIntPipe) id: number,
		@Body('status') status: string,
	) {
		return this.postsService.updatePostStatus(id, status, auth);
	}

	@Delete('admin/:id')
	adminDelete(@Headers('authorization') auth: string, @Param('id', ParseIntPipe) id: number) {
		return this.postsService.adminDeletePost(id, auth);
	}

	@Get(':id')
	getOne(@Headers('authorization') auth: string, @Param('id', ParseIntPipe) id: number) {
		return this.postsService.getOne(id, auth);
	}

	@Get()
	getAllPosts(@Headers('authorization') auth: string) {
		return this.postsService.getAllPosts(auth);
	}

	@Patch(':id')
	update(
		@Headers('authorization') auth: string,
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: UpdatePostDto
	) {
		return this.postsService.update(id, dto, auth);
	}

	@Delete(':id')
	remove(@Headers('authorization') auth: string, @Param('id', ParseIntPipe) id: number) {
		return this.postsService.remove(id, auth);
	}
}
