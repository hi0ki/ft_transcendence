<<<<<<< HEAD
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
=======
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule
  ],
})
export class AppModule {}
>>>>>>> hiki
