import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat.module';

@Module({
  imports: [ChatModule],
  controllers: [],
  providers: [AppService],
})
export class AppModule { }