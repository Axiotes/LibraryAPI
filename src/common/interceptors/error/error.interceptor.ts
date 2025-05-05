import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';
import { LoggerService } from '../..//utils/logger/logger.service';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const initializeTime = new Date().getTime();

    return next.handle().pipe(
      catchError((err) => {
        const executionTime = new Date().getTime() - initializeTime;
        const statusCode =
          err?.status ||
          err?.response?.statusCode ||
          context.switchToHttp().getResponse().statusCode;

        this.loggerService.logError({
          method: req.method,
          url: req.url,
          params: req.params,
          body: req.body,
          executionTime: `${executionTime}ms`,
          statusCode,
          error: {
            errorMessage: err.message,
            errorName: err.name,
          },
        });

        return throwError(() => err);
      }),
    );
  }
}
