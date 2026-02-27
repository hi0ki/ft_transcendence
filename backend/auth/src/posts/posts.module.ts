import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../guards/roles.guard';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [
    PrismaModule,
    AuthModule, // provides JwtModule, JwtService, AuthGuard
  ],
  providers: [
    PostsService,
    RolesGuard,
    Reflector, // needed by RolesGuard to read @Roles() metadata
  ],
  controllers: [PostsController],
})
export class PostsModule { }
