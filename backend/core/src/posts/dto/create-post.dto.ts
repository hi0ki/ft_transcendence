import { IsString, IsNotEmpty, IsIn } from 'class-validator';

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
}
