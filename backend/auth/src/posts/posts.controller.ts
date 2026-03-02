
import { Controller, Post, Get, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, Query, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import * as multer from 'multer';
import { randomUUID } from 'crypto';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { SearchPostsDto } from './dto/search-posts.dto';
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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif'] as const;

const IMAGE_EXTENSION_BY_MIME: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
};

const hasValidImageSignature = (buffer: Buffer, mimetype: string): boolean => {
    if (mimetype === 'image/jpeg') {
        return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }

    if (mimetype === 'image/png') {
        return buffer.length > 8
            && buffer[0] === 0x89
            && buffer[1] === 0x50
            && buffer[2] === 0x4e
            && buffer[3] === 0x47
            && buffer[4] === 0x0d
            && buffer[5] === 0x0a
            && buffer[6] === 0x1a
            && buffer[7] === 0x0a;
    }

    if (mimetype === 'image/gif') {
        const header = buffer.subarray(0, 6).toString('ascii');
        return header === 'GIF87a' || header === 'GIF89a';
    }

    return false;
};

const validateUploadedImageSignature = async (file: multer.File): Promise<void> => {
    const filePath = path.join(ensureUploadsDir(), file.filename);
    const buffer = await fs.promises.readFile(filePath);
    const isValid = hasValidImageSignature(buffer, file.mimetype);

    if (!isValid) {
        await fs.promises.unlink(filePath).catch(() => undefined);
        throw new BadRequestException('Invalid image content');
    }
};

const postImageUploadInterceptor = FileInterceptor('image', {
    storage: diskStorage({
        destination: (_req, _file, cb) => {
            cb(null, ensureUploadsDir());
        },
        filename: (_req, file, cb) => {
            const safeExtension = IMAGE_EXTENSION_BY_MIME[file.mimetype];
            if (!safeExtension) {
                cb(new BadRequestException('Only JPG, PNG, and GIF images are allowed'), '');
                return;
            }
            cb(null, `${randomUUID()}${safeExtension}`);
        }
    }),
    limits: {
        fileSize: MAX_IMAGE_SIZE,
        files: 1,
    },
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
            cb(new BadRequestException('Only JPG, PNG, and GIF images are allowed'), false);
            return;
        }
        cb(null, true);
    }
});

@UseGuards(AuthGuard)
@Controller('posts')
export class PostsController {
    constructor(private postsService: PostsService) { }

    @Post()
    @UseInterceptors(postImageUploadInterceptor)
    async create(@Req() req: Request, @Body() body: CreatePostDto, @UploadedFile() file?: multer.File) {
        const userId = (req as any).user?.id;
        if (!file && body.imageUrl) {
            throw new BadRequestException('Direct imageUrl is not allowed. Upload an image file.');
        }
        if (file)
        {
            await validateUploadedImageSignature(file);
            body.imageUrl = `/uploads/posts/${file.filename}`;
        }
        return this.postsService.createPost({ ...body, userId });
    }

    @Get('search')
    search(@Query() dto: SearchPostsDto, @Req() req: Request) {
        const userId = (req as any).user?.id;
        return this.postsService.searchPosts(dto, userId);
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
    @UseInterceptors(postImageUploadInterceptor)
    async update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdatePostDto, @UploadedFile() file?: multer.File) {
        const userId = (req as any).user?.id;
        if (!file && dto.imageUrl) {
            throw new BadRequestException('Direct imageUrl is not allowed. Upload an image file.');
        }
        if (file) {
            await validateUploadedImageSignature(file);
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
