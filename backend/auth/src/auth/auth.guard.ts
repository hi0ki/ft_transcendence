// import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';

// @Injectable()
// //CanActive is an interface so ifyou implement it you MUST write this method. CanActive
// export class AuthGuard implements CanActivate{
//     constructor(private jwtService: JwtService) {}

//     canActivate(context: ExecutionContext): boolean {
//         const request = context.switchToHttp().getRequest();
//         const authHeader = request.headers['authorization'];
//         if (!authHeader) {
//             throw new UnauthorizedException('Token missing');
//         }
//         const [type, token] = authHeader.split(' ');
//         if (type !== 'Bearer' || !token) {
//             throw new UnauthorizedException('Invalid token format');
//         }
//         try {
//             const payload = this.jwtService.verify(token);
//             request.user = payload; // save user data
//             return true;
//           } catch (err) {
//             throw new UnauthorizedException('Invalid or expired token');
//           }
//     }
// }

//Checks if the token exists in Authorization header.

// Verifies the JWT using JwtService.

// Throws UnauthorizedException if missing/invalid.

// Attaches payload to request.user.