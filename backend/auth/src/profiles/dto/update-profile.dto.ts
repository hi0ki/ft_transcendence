import { IsOptional, IsString } from "class-validator";

export class UpdateProfileDto{
   
    @IsOptional()
    @IsString()
    username ?:string;

    @IsOptional()
    @IsString()
    fullName ?:string;

    @IsOptional()
    @IsString()
    avatarUrl ?:string;

    @IsOptional()
    @IsString()
    bio ?:string;
}
