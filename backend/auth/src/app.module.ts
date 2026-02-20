import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
// import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ProfilesModule } from './profiles/profiles.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    // UsersModule,
    AuthModule,
    ProfilesModule,
  ],
})
export class AppModule {}
