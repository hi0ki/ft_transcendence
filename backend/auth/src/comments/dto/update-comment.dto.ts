import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UpdateCommentDto {
    @IsNumber()
    @IsNotEmpty()
    commentId: number;

    @IsNumber()
    @IsNotEmpty()
    postId?: number

    @IsString()
    @IsNotEmpty()
    content?: string
}