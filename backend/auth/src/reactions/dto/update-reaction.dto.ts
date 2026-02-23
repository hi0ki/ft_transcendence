import { IsNotEmpty, IsNumber, IsEnum } from 'class-validator';
import { ReactionType } from '@prisma/client';

export class UpdateReactionDto {
    @IsNumber()
    @IsNotEmpty()
    userId: number;
    
    @IsNumber()
    @IsNotEmpty()
    postId: number;

    @IsEnum(ReactionType)
    @IsNotEmpty()
    type: ReactionType;
}