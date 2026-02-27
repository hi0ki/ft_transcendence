
import { Controller, Post, Get, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, Query, ParseIntPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import * as multer from 'multer';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles, Role } from '../decorators/roles.decorator';
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
    constructor(private postsService: PostsService) { }

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

    @Get('detail/:id')
    getOne(@Param('id', ParseIntPipe) id: number) {
        return this.postsService.getOne(id);
    }

    @Get()
    getAll(@Req() req: Request) {
        const userId = (req as any).user?.id;
        return this.postsService.getAllPosts(userId);
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

    // ── Admin: list all posts (optional ?status=PENDING|APPROVED) ──────────
    @Get('admin/all')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    adminGetAll(@Query('status') status?: 'PENDING' | 'APPROVED') {
        return this.postsService.adminGetAllPosts(status);
    }

    // ── Admin: approve/reject a post ───────────────────────────────────────
    @Patch('admin/:id/status')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body('status') status: 'PENDING' | 'APPROVED',
    ) {
        return this.postsService.updatePostStatus(id, status);
    }

    // ── Admin: force-delete any post ──────────────────────────────────────
    @Delete('admin/:id')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    adminDelete(@Param('id', ParseIntPipe) id: number) {
        return this.postsService.adminDeletePost(id);
    }
}
