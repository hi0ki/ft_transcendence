import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
    imports: [HttpModule],
    providers: [ChatGateway, ChatService],
    controllers: [ChatController],
})
export class ChatModule { }
