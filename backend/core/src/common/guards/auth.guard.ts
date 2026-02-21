import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const userId = request.headers['x-user-id'];
        if (!userId) {
            throw new UnauthorizedException();
        }
        request.user = { id: parseInt(userId, 10) };
        return true;
    }
}
