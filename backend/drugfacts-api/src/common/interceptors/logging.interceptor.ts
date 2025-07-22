import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url, body, query, params } = request;
    const userAgent = request.get('user-agent') || '';
    const ip = request.ip;

    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - now;
          const { statusCode } = response;

          this.logger.log({
            method,
            url,
            statusCode,
            responseTime: `${responseTime}ms`,
            userAgent,
            ip,
            ...(method !== 'GET' && { body }),
            ...(Object.keys(query).length && { query }),
            ...(Object.keys(params).length && { params }),
          });
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          
          this.logger.error({
            method,
            url,
            error: error.message,
            responseTime: `${responseTime}ms`,
            userAgent,
            ip,
            ...(method !== 'GET' && { body }),
            ...(Object.keys(query).length && { query }),
            ...(Object.keys(params).length && { params }),
          });
        },
      }),
    );
  }
}