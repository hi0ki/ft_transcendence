import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // ← try cookie first (browser requests)
        let token = request.cookies?.['auth_token'];

        // ← fall back to Bearer token (internal service-to-service calls)
        if (!token) {
            const authHeader = request.headers?.authorization;
            if (authHeader?.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            throw new UnauthorizedException('Token missing');
        }

        try {
            const secret = this.configService.get<string>('JWT_SECRET');
            if (!secret) {
                throw new UnauthorizedException('JWT secret not configured');
            }
            const payload = await this.jwtService.verifyAsync(token, { secret });
            request.user = payload;
            return true;
        } catch (err) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}