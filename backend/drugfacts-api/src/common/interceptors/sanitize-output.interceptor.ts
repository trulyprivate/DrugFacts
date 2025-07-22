import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SanitizeOutputInterceptor implements NestInterceptor {
  private readonly sensitiveFields = ['_id', '__v', '_hash', 'password', 'token'];
  private readonly htmlFields = ['description', 'content', 'body'];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => this.sanitizeData(data))
    );
  }

  private sanitizeData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    if (data instanceof Date) {
      return data.toISOString();
    }

    if (typeof data === 'object') {
      const sanitized = {};
      
      for (const [key, value] of Object.entries(data)) {
        // Skip sensitive fields
        if (this.sensitiveFields.includes(key)) {
          continue;
        }

        // Apply HTML entity encoding for specific fields
        if (this.htmlFields.includes(key) && typeof value === 'string') {
          sanitized[key] = this.encodeHtmlEntities(value);
        } else {
          sanitized[key] = this.sanitizeData(value);
        }
      }

      return sanitized;
    }

    return data;
  }

  private sanitizeString(str: string): string {
    // Remove any null bytes
    return str.replace(/\0/g, '');
  }

  private encodeHtmlEntities(str: string): string {
    // Only encode the most dangerous characters for XSS
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}