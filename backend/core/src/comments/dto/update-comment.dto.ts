import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UpdateCommentDto {
    @IsNumber()
    @IsNotEmpty()
    commentId: number;

    @IsString()
    @IsNotEmpty()
    content: string;
}
