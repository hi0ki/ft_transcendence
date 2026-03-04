import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ChatGateway } from './chat.gateway';
import { ChatController, HealthController } from './chat.controller';
import { ChatService } from './chat.service';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import * as https from 'https';

@Module({
    imports: [
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 10,
            blockDuration: 300000, // Block for 5 minutes after exceeding limit
        }]),
        HttpModule.register({
            httpsAgent: new https.Agent({
                rejectUnauthorized: false, // Accept self-signed certificates
            }),
        }),
    ],
    providers: [
        ChatGateway,
        ChatService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
    controllers: [ChatController, HealthController],
})
export class ChatModule { }
