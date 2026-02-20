import { Controller, Post, Get, Body } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
  create(@Body() body: CreatePostDto) {
    return this.postsService.createPost(body);
  }

  @Get()
  getAll() {
    return this.postsService.getAllPosts();
  }
}
