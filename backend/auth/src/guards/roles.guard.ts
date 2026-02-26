

// import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { UserRole } from '@prisma/client';
// import { ROLES_KEY } from '../auth/roles.decorator';

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}

//   canActivate(context: ExecutionContext): boolean {
//     const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
//       ROLES_KEY,
//       [context.getHandler(), context.getClass()],
//       );
      
//       if (!requiredRoles) return true;
      
//       const request = context.switchToHttp().getRequest();
//       const user = request.user;
//       if (!user || !user.role) {
//         return false;
//       }

//     return requiredRoles.includes(user.role);
//   }
// }

// // backend/auth/src/guards/roles.guard.ts
// import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { ROLES_KEY } from '../decorators/roles.decorator';

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}

//   canActivate(context: ExecutionContext): boolean {
//     const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
//       context.getHandler(),
//       context.getClass(),
//     ]);
//     if (!requiredRoles) {
//       return true; // no roles required, allow access
//     }

//     const request = context.switchToHttp().getRequest();
//     const user = request.user; // assuming AuthGuard already sets req.user

//     if (!user || !requiredRoles.includes(user.role)) {
//       throw new ForbiddenException('You do not have permission (role) to access this resource');
//     }

//     return true;
//   }
// }



import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from @Roles() decorator (method first, then class)
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no @Roles() decorator is set, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // AuthGuard already ran and set request.user
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: no role found on token');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied: requires one of [${requiredRoles.join(', ')}]`,
      );
    }

    return true;
  }
}