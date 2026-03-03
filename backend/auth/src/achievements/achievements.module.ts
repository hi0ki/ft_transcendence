import { Module } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './achievements.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [PrismaModule, JwtModule.register({}), ConfigModule],
    providers: [AchievementsService],
    controllers: [AchievementsController],
})
export class AchievementsModule {}
