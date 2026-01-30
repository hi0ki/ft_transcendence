import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
})
export class AppModule {}

// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { ChatModule } from './chat.module'; // ← AJOUTER

// @Module({
//   imports: [ChatModule], // ← AJOUTER
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}