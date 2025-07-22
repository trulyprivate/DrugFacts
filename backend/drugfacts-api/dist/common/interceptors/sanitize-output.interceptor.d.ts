import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class SanitizeOutputInterceptor implements NestInterceptor {
    private readonly sensitiveFields;
    private readonly htmlFields;
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private sanitizeData;
    private sanitizeString;
    private encodeHtmlEntities;
}
