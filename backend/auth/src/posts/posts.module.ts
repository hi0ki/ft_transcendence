import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({}), // Uses global config if already set up
    ConfigModule,
  ],
  providers: [PostsService],
  controllers: [PostsController],
})
export class PostsModule {}
