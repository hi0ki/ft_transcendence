import { IsNotEmpty, IsEnum, IsNumber } from 'class-validator';
import { ReactionType } from '@prisma/client';

export class CreateReactionDto {
    @IsNumber()
    @IsNotEmpty()
    postId: number;

    @IsEnum(ReactionType)
    @IsNotEmpty()
    type: ReactionType;
}