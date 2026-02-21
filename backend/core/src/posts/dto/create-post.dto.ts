import { IsInt, IsString, IsNotEmpty, IsIn } from 'class-validator';

export class CreatePostDto 
{
	@IsInt()
	user_id: number;

	@IsIn(['help', 'resource', 'meme'])
	type: 'help' | 'resource' | 'meme';

	@IsString()
	@IsNotEmpty()
	title: string;

	@IsString()
	@IsNotEmpty()
	content: string;
}
