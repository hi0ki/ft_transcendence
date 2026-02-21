import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    PostsModule
  ],
})
export class AppModule {}
