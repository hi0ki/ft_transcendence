import { IsNotEmpty, IsString, IsNumber, IsOptional, MaxLength } from 'class-validator';

export class CreateCommentDto {
    @IsNumber()
    @IsNotEmpty()
    postId: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(500, { message: 'Content must not exceed 500 characters' })
    content: string;
}
