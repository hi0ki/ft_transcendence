import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ChatGateway } from './chat.gateway';
import { ChatController, HealthController } from './chat.controller';
import { ChatService } from './chat.service';
import * as https from 'https';

@Module({
    imports: [
        HttpModule.register({
            httpsAgent: new https.Agent({
                rejectUnauthorized: false, // Accept self-signed certificates
            }),
        }),
    ],
    providers: [ChatGateway, ChatService],
    controllers: [ChatController, HealthController],
})
export class ChatModule { }
