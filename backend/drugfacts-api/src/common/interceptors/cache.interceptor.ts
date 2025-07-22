import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Response } from 'express';

@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Static data endpoints - cache for 24 hours
    if (
      request.url.includes('/therapeutic-classes') ||
      request.url.includes('/manufacturers')
    ) {
      response.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
      response.setHeader('Surrogate-Control', 'max-age=86400');
    }
    // Drug details - cache for 1 hour
    else if (request.url.match(/\/drugs\/[^\/]+$/)) {
      response.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      response.setHeader('Surrogate-Control', 'max-age=3600');
    }
    // Drug index - cache for 1 hour
    else if (request.url.includes('/drugs/index')) {
      response.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    }
    // Search results - cache for 5 minutes
    else if (request.url.includes('/drugs?')) {
      response.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    }
    // Default - no cache
    else {
      response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    return next.handle();
  }
}