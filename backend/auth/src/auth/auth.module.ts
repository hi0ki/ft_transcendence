import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from '../guards/auth.guard';
import { PassportModule } from '@nestjs/passport';
import { FortyTwoStrategy } from './strategies/42.strategy';

@Module({
    imports: [ConfigModule,
        PrismaModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                secret: config.get('JWT_SECRET'),
                signOptions: { expiresIn: '1h' },
            }),
        })],
    controllers: [AuthController],
    providers: [AuthService, AuthGuard, FortyTwoStrategy],
    exports: [JwtModule, AuthGuard]
})
export class AuthModule { }



