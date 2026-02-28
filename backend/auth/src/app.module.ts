import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { CommentsModule } from './comments/comments.module';
import { ReactionsService } from './reactions/reactions.service';
import { ReactionsController } from './reactions/reactions.controller';
import { ReactionsModule } from './reactions/reactions.module';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ProfilesModule } from './profiles/profiles.module';
import { PostsModule } from './posts/posts.module';
// import { FriendsModule } from './friends/friends.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    CommentsModule,
    ReactionsModule,
    ChatModule,
    AuthModule,
    ProfilesModule,
    PostsModule,
    // FriendsModule,

  ],
  providers: [ReactionsService],
  controllers: [ReactionsController],
})
export class AppModule {}
