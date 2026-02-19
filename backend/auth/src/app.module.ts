import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { CommentsModule } from './comments/comments.module';
import { ReactionsService } from './reactions/reactions.service';
import { ReactionsController } from './reactions/reactions.controller';
import { ReactionsModule } from './reactions/reactions.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    CommentsModule,
    ReactionsModule,
  ],
  providers: [ReactionsService],
  controllers: [ReactionsController],
})
export class AppModule {}
