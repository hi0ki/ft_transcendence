import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
<<<<<<< HEAD
import { PostsModule } from './posts/posts.module';
=======
import { CommentsModule } from './comments/comments.module';
import { ReactionsService } from './reactions/reactions.service';
import { ReactionsController } from './reactions/reactions.controller';
import { ReactionsModule } from './reactions/reactions.module';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ProfilesModule } from './profiles/profiles.module';
>>>>>>> origin/master

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
<<<<<<< HEAD
    PostsModule
=======
    CommentsModule,
    ReactionsModule,
    ChatModule,
    AuthModule,
    ProfilesModule,
>>>>>>> origin/master
  ],
  providers: [ReactionsService],
  controllers: [ReactionsController],
})
export class AppModule {}
