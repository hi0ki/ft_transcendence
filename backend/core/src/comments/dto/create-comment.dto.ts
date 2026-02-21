import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateCommentDto {
    @IsNumber()
    @IsNotEmpty()
    postId: number;

    @IsString()
    @IsNotEmpty()
    content: string;
}
