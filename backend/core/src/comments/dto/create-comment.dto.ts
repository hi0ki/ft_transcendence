import { IsString, IsInt, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsInt()
  postId: number;

  @IsInt()
  userId: number;

  @IsOptional()
  @IsInt()
  parentId?: number;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content: string;
}
