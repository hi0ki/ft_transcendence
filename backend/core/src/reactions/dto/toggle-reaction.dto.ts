import { IsInt, IsEnum, IsOptional, ValidateIf } from 'class-validator';

export enum ReactionType {
  LIKE = 'like',
  HELPFUL = 'helpful',
  FUNNY = 'funny',
  INSIGHTFUL = 'insightful',
  CELEBRATE = 'celebrate',
}

export enum TargetType {
  POST = 'post',
  COMMENT = 'comment',
}

export class ToggleReactionDto {
  @IsInt()
  userId: number;

  @IsEnum(TargetType)
  targetType: TargetType;

  @ValidateIf((o) => o.targetType === TargetType.POST)
  @IsInt()
  postId?: number;

  @ValidateIf((o) => o.targetType === TargetType.COMMENT)
  @IsInt()
  commentId?: number;

  @IsEnum(ReactionType)
  type: ReactionType;
}
