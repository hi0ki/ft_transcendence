import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UpdateCommentDto {
    @IsNumber()
    @IsNotEmpty()
    commentId: number;

    @IsNumber()
    @IsNotEmpty()
    postId?: number

    @IsNumber()
    @IsNotEmpty()
    userId?: number

    @IsString()
    @IsNotEmpty()
    content?: string
}