import { IsNotEmpty, IsInt } from "class-validator";

export class MarkAsReadDto {
    @IsInt()
    @IsNotEmpty()
    conversationId: number;

    @IsInt()
    @IsNotEmpty()
    userId: number;
}