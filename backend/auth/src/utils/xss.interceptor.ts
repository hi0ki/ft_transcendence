import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { sanitizeInput } from './sanitize';

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') return sanitizeInput(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, sanitizeObject(v)])
    );
  }
  return obj;
}

@Injectable()
export class XssInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    if (request.body) {
      request.body = sanitizeObject(request.body);
    }
    return next.handle();
  }
}