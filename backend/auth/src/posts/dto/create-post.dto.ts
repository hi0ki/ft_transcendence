import { IsInt, IsString, IsNotEmpty, IsIn, IsOptional, MaxLength } from 'class-validator';

export class CreatePostDto {
    @IsOptional()
    @IsInt()
    userId?: number;

    @IsIn(['HELP', 'RESOURCE', 'MEME'])
    type: 'HELP' | 'RESOURCE' | 'MEME';

    @IsString()
    @IsNotEmpty()
    @MaxLength(50, { message: 'Title must not exceed 50 characters' })
    title: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(5000, { message: 'Content must not exceed 5000 characters' })
    content: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsString()
    contentUrl?: string;
}
