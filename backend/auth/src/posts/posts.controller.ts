
import { Controller, Post, Get, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import * as multer from 'multer';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { Request } from 'express';

const ensureUploadsDir = () => 
{
    const dirPath = path.join(process.cwd(), 'uploads', 'posts');
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    return dirPath;
};

@UseGuards(AuthGuard)
@Controller('posts')
export class PostsController {
    constructor(private postsService: PostsService) {}

    @Post()
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                cb(null, ensureUploadsDir());
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
                cb(null, uniqueSuffix + path.extname(file.originalname));
            }
        })
    }))
    create(@Req() req: Request, @Body() body: CreatePostDto, @UploadedFile() file?: multer.File) {
        const userId = (req as any).user?.id;
        if (file)
        {
            body.imageUrl = `/uploads/posts/${file.filename}`;
        }
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
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                cb(null, ensureUploadsDir());
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
                cb(null, uniqueSuffix + path.extname(file.originalname));
            }
        })
    }))
    update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdatePostDto, @UploadedFile() file?: multer.File) {
        const userId = (req as any).user?.id;
        if (file) {
            dto.imageUrl = `/uploads/posts/${file.filename}`;
        }
        return this.postsService.update(+id, dto, userId);
    }

    @Delete(':id')
    remove(@Req() req: Request, @Param('id') id: string) {
        const userId = (req as any).user?.id;
        return this.postsService.remove(+id, userId);
    }
}
