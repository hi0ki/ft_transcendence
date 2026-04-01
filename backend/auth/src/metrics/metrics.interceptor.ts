import {
Injectable,
NestInterceptor,
ExecutionContext,
CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { httpRequestCounter, httpRequestDuration } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const route = req.route?.path || req.url;

    const end = httpRequestDuration.startTimer();

    return next.handle().pipe(
        tap({
        next: () => {
            const status = context.switchToHttp().getResponse().statusCode;

            httpRequestCounter.inc({ method, route, status });
            end({ method, route, status });
        },
        error: () => {
            httpRequestCounter.inc({ method, route, status: 500 });
            end({ method, route, status: 500 });
        },
        }),
    );
    }
}