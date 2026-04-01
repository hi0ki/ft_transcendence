import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { CommentsModule } from './comments/comments.module';
import { ReactionsModule } from './reactions/reactions.module';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ProfilesModule } from './profiles/profiles.module';
import { PostsModule } from './posts/posts.module';
import { FriendsModule } from './friends/friends.module';
import { AchievementsModule } from './achievements/achievements.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { HealthController } from './health/health.controller';
import { MetricsController } from './metrics/metrics.controller';
import { MetricsService } from './metrics/metrics.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { ttl: 60000, limit: 100, blockDuration: 60000 },  // 100 req/min, block 1min
    ]),
    PrismaModule,
    UsersModule,
    CommentsModule,
    ReactionsModule,
    ChatModule,
    AuthModule,
    ProfilesModule,
    PostsModule,
    FriendsModule,
    AchievementsModule,
  ],
  controllers: [HealthController, MetricsController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    MetricsService,
  ],
})
export class AppModule {}
