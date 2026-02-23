import { IsNotEmpty, IsInt, IsString } from "class-validator";
import { MessageType } from "@prisma/client";

export class SendMessageDto {
    @IsInt()
    @IsNotEmpty()
    conversationId: number;

    @IsInt()
    @IsNotEmpty()
    senderId: number;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsNotEmpty()
    type: MessageType;
}
