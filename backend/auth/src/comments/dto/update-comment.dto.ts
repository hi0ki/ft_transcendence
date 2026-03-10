import { IsNotEmpty, IsString, IsNumber, MaxLength } from 'class-validator';

export class UpdateCommentDto {
    @IsNumber()
    @IsNotEmpty()
    commentId: number;

    @IsNumber()
    @IsNotEmpty()
    postId?: number

    @IsString()
    @IsNotEmpty()
    @MaxLength(500, { message: 'Content must not exceed 500 characters' })
    content?: string
}