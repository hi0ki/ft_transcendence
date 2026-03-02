import { IsOptional, IsString, IsIn, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchPostsDto {
    @IsOptional()
    @IsString()
    q?: string;

    @IsOptional()
    @IsIn(['HELP', 'RESOURCE', 'MEME'])
    type?: 'HELP' | 'RESOURCE' | 'MEME';

    @IsOptional()
    @IsIn(['createdAt', 'reactions'])
    sortBy?: 'createdAt' | 'reactions' = 'createdAt';

    @IsOptional()
    @IsIn(['asc', 'desc'])
    order?: 'asc' | 'desc' = 'desc';

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 10;
}
