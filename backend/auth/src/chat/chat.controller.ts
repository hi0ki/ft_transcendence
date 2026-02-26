import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MarkAsReadDto } from './dto/mark-as-read.dto';

// Allowed file types
const ALLOWED_MIME_TYPES = [
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Videos
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
    'video/x-matroska', 'video/avi', 'video/mkv', 'video/3gpp',
    // Audio — voice messages AND music files (mp3, aac, flac, etc.)
    'audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp3', 'audio/wav',
    'audio/x-wav', 'audio/mp4', 'audio/aac', 'audio/flac', 'audio/x-flac',
    'audio/x-m4a', 'audio/m4a',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB — videos need more room

const UPLOAD_BASE = '/app/uploads/chat';

/** Map a MIME type to its subdirectory name */
function getSubDir(mimetype: string): string {
    if (mimetype.startsWith('image/')) return 'images';
    if (mimetype.startsWith('video/')) return 'videos';
    if (mimetype.startsWith('audio/')) return 'audio';
    return 'documents';
}

/** Generate a unique filename: UUID + original extension */
function generateUniqueFilename(originalName: string): string {
    const ext = extname(originalName);
    return `${randomUUID()}${ext}`;
}

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    // ─── File Upload ───
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (_req, file, cb) => {
                // Route to subdirectory based on MIME type
                const subDir = getSubDir(file.mimetype);
                const destPath = `${UPLOAD_BASE}/${subDir}`;

                // Ensure the subdirectory exists
                if (!existsSync(destPath)) {
                    mkdirSync(destPath, { recursive: true });
                }

                cb(null, destPath);
            },
            filename: (_req, file, cb) => {
                cb(null, generateUniqueFilename(file.originalname));
            },
        }),
        limits: { fileSize: MAX_FILE_SIZE },
        fileFilter: (_req, file, cb) => {
            // Accept any image, video, or audio type by prefix
            if (
                file.mimetype.startsWith('video/') ||
                file.mimetype.startsWith('audio/') ||
                file.mimetype.startsWith('image/') ||
                ALLOWED_MIME_TYPES.includes(file.mimetype)
            ) {
                cb(null, true);
            } else {
                cb(new BadRequestException(`File type ${file.mimetype} is not allowed`), false);
            }
        },
    }))
    uploadFile(@UploadedFile() file: any) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        // Determine file category
        let fileType = 'FILE';
        if (file.mimetype.startsWith('image/')) fileType = 'IMAGE';
        else if (file.mimetype.startsWith('video/')) fileType = 'VIDEO';
        else if (file.mimetype.startsWith('audio/')) fileType = 'VOICE';

        // Build URL path: /uploads/chat/<subdir>/<uuid-filename>
        const subDir = getSubDir(file.mimetype);

        return {
            fileUrl: `/uploads/chat/${subDir}/${file.filename}`,
            fileName: file.originalname,
            fileSize: file.size,
            fileType,
            mimeType: file.mimetype,
        };
    }

    // ─── Users ───
    @Get('users')
    getAllUsers() {
        return this.chatService.getAllUsersWithProfiles();
    }

    @Get('users/:userId')
    getUser(@Param('userId', ParseIntPipe) userId: number) {
        return this.chatService.getUserWithProfile(userId);
    }

    @Post('conversation')
    createConversation(@Body() createConversationDto: { userId1: number, userId2: number }) {
        return this.chatService.createConversation(createConversationDto);
    }

    @Post('conversation/find-or-create')
    findOrCreateConversation(@Body() body: { userId1: number, userId2: number }) {
        return this.chatService.findOrCreateConversation(body.userId1, body.userId2);
    }

    @Post('new-message')
    sendMessage(@Body() sendMessageDto: SendMessageDto) {
        return this.chatService.sendMessage(sendMessageDto);
    }

    @Get('conversation/:conversationId/messages')
    getConversationMessages(
        @Param('conversationId', ParseIntPipe) conversationId: number,
        @Query('userId') userId?: string
    ) {
        return this.chatService.getConversationMessages(conversationId, userId ? parseInt(userId) : undefined);
    }

    @Put('message')
    updateMessage(@Body() body: any) {
        const { userId, ...updateMessageDto } = body;
        return this.chatService.updateMessage(userId, updateMessageDto);
    }

    @Post('message/delete')
    deleteMessage(@Body() body: { messageId: number, userId: number, deleteType?: string }) {
        return this.chatService.deleteMessage(body.messageId, body.userId, body.deleteType || 'FOR_ALL');
    }

    @Delete('conversation/:id')
    async deleteConversation(@Param('id', ParseIntPipe) id: number) {
        try {
            await this.chatService.deleteConversation(id);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    @Get('user/:userId/conversations')
    getUserConversations(@Param('userId', ParseIntPipe) userId: number) {
        return this.chatService.getUserConversations(userId);
    }

    @Put('message/mark-as-read')
    markAsRead(@Body() markAsReadDto: MarkAsReadDto) {
        return this.chatService.markAsRead(markAsReadDto);
    }
}
