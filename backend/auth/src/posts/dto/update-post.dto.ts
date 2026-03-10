import { IsOptional, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdatePostDto {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	title?: string;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(5000, { message: 'Content must not exceed 5000 characters' })
	content?: string;

	@IsOptional()
	@IsString()
	imageUrl?: string;

	@IsOptional()
	@IsString()
	contentUrl?: string;
}