import { IsString, IsNotEmpty, IsIn, IsOptional, MaxLength } from 'class-validator';

export class CreatePostDto 
{
	@IsIn(['HELP', 'RESOURCE', 'MEME'])
	type: 'HELP' | 'RESOURCE' | 'MEME';

	@IsString()
	@IsNotEmpty()
	@MaxLength(50, { message: 'Title must not exceed 50 characters' })
	title: string;

	@IsString()
	@IsNotEmpty()
	content: string;

	@IsOptional()
	@IsString()
	imageUrl?: string;

	@IsOptional()
	@IsString()
	contentUrl?: string;
}
