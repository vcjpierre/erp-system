import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const requestId = uuidv4();
    const now = Date.now();

    request.requestId = requestId;

    this.logger.log(`[${requestId}] → ${method} ${url}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const duration = Date.now() - now;
          this.logger.log(`[${requestId}] ← ${method} ${url} ${response.statusCode} ${duration}ms`);
        },
        error: (error: Error) => {
          const duration = Date.now() - now;
          this.logger.error(
            `[${requestId}] ✗ ${method} ${url} ${duration}ms - ${error.message}`,
          );
        },
      }),
    );
  }
}
