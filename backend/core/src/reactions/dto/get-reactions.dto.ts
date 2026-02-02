import { IsInt, IsEnum, IsOptional } from 'class-validator';

export enum TargetType {
  POST = 'post',
  COMMENT = 'comment',
}

export class GetReactionsDto {
  @IsEnum(TargetType)
  targetType: TargetType;

  @IsOptional()
  @IsInt()
  postId?: number;

  @IsOptional()
  @IsInt()
  commentId?: number;
}
