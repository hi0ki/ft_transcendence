import { IsInt, IsString, IsNotEmpty, IsIn } from 'class-validator';

export class CreatePostDto 
{
	@IsInt()
	userId: number;

	@IsIn(['HELP', 'RESOURCE', 'MEME'])
	type: 'HELP' | 'RESOURCE' | 'MEME';

	@IsString()
	@IsNotEmpty()
	title: string;

	@IsString()
	@IsNotEmpty()
	content: string;
}
