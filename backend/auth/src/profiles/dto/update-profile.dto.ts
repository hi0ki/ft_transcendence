import { IsOptional, IsString, IsArray } from "class-validator";

export class UpdateProfileDto{
   
    @IsOptional()
    @IsString()
    username ?:string;

    @IsOptional()
    @IsString()
    avatarUrl ?:string;

    @IsOptional()
    @IsString()
    bio ?:string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    skills?: string[];
}
