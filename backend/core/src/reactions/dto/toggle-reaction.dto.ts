import { IsNotEmpty, IsEnum, IsNumber } from 'class-validator';
import { ReactionType } from '@prisma/client';

export class ToggleReactionDto {
    @IsNumber()
    @IsNotEmpty()
    postId: number;

    @IsEnum(ReactionType)
    @IsNotEmpty()
    type: ReactionType;
}
