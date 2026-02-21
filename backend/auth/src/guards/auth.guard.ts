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

//Checks if the token exists in Authorization header.

// Verifies the JWT using JwtService.

// Throws UnauthorizedException if missing/invalid.

// Attaches payload to request.user.



/*USER → normal user.

ADMIN → full access.

MODERATOR → limited admin access.*/





//CanActivate
// This is an interface in NestJS.
// Any guard must implement this interface.

//ExecutionContext

// Represents the context of the current request.