import { IsInt, IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class CreatePostDto {
    @IsOptional()
    @IsInt()
    userId?: number; // Optional as it comes from JWT token in controller

    @IsIn(['HELP', 'RESOURCE', 'MEME'])
    type: 'HELP' | 'RESOURCE' | 'MEME';

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;
}
