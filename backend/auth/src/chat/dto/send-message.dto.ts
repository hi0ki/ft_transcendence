import { IsNotEmpty, IsInt, IsString, IsOptional } from "class-validator";
import { MessageType } from "@prisma/client";

export class SendMessageDto {
    @IsInt()
    @IsNotEmpty()
    conversationId: number;

    @IsInt()
    @IsNotEmpty()
    senderId: number;

    @IsString()
    @IsOptional()
    content?: string;

    @IsNotEmpty()
    type: MessageType;

    @IsString()
    @IsOptional()
    fileUrl?: string;
}
