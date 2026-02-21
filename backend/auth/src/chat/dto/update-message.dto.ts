import { IsNotEmpty, IsInt, IsString } from "class-validator";
import { MessageType } from "@prisma/client";

export class UpdateMessageDto {
    @IsInt()
    @IsNotEmpty()
    messageId: number;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsNotEmpty()
    type: MessageType;
}
