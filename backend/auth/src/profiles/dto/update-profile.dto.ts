import { IsOptional, IsString, IsArray, MinLength, MaxLength } from "class-validator";

export class UpdateProfileDto{
   
    @IsOptional()
    @IsString()
    @MinLength(3, { message: 'Username must be at least 3 characters long' })
    @MaxLength(10, { message: 'Username must not exceed 10 characters' })
    username ?:string;

    @IsOptional()
    @IsString()
    avatarUrl ?:string;

    @MaxLength(160, { message: 'Bio must not exceed 160 characters' })
    @IsOptional()
    @IsString()
    bio ?:string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    skills?: string[];
}
