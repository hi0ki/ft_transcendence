import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class CreatePostDto 
{
	@IsIn(['HELP', 'RESOURCE', 'MEME'])
	type: 'HELP' | 'RESOURCE' | 'MEME';

	@IsString()
	@IsNotEmpty()
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
