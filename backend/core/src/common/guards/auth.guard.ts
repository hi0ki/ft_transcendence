import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
//CanActive is an interface so ifyou implement it you MUST write this method. CanActive
export class AuthGuard implements CanActivate{
    constructor(private jwtService: JwtService,
        private configService: ConfigService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        if (!authHeader) {
            throw new UnauthorizedException('Token missing');
        }
        const [type, token] = authHeader.split(' ');
        if (type !== 'Bearer' || !token) {
            throw new UnauthorizedException('Invalid token format');
        }
        try {
            const secret = this.configService.get<string>('JWT_SECRET');
            if (!secret) {
                throw new UnauthorizedException('JWT secret not configured');
            }        
            const payload = await this.jwtService.verifyAsync(token, { secret });
            request.user = payload; // save user data
            return true;
        } catch (err) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
