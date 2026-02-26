
import { Controller, Post, Get, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { Request } from 'express';


@UseGuards(AuthGuard)
@Controller('posts')
export class PostsController {
    constructor(private postsService: PostsService) {}

    @Post()
    create(@Req() req: Request, @Body() body: Omit<CreatePostDto, 'userId'>) {
        const userId = (req as any).user?.id;
        return this.postsService.createPost({ ...body, userId });
    }

    @Get(':id')
    getOne(@Param('id', ParseIntPipe) id: number) {
        return this.postsService.getOne(id);
    }

    @Get()
    getAll() {
        return this.postsService.getAllPosts();
    }

    @Patch(':id')
    update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdatePostDto) {
        const userId = (req as any).user?.id;
        return this.postsService.update(+id, dto, userId);
    }

    @Delete(':id')
    remove(@Req() req: Request, @Param('id') id: string) {
        const userId = (req as any).user?.id;
        return this.postsService.remove(+id, userId);
    }
}
