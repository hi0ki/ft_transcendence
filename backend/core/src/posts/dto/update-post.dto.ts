import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdatePostDto 
{
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	title?: string;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	content?: string;

	@IsOptional()
	@IsString()
	imageUrl?: string;

	@IsOptional()
	@IsString()
	contentUrl?: string;
}
