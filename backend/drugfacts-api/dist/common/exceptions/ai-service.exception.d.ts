import { HttpException } from '@nestjs/common';
export declare class AIServiceException extends HttpException {
    constructor(message: string, details?: any);
}
export declare class AIServiceTimeoutException extends AIServiceException {
    constructor(service: string, timeout: number);
}
export declare class AIServiceRateLimitException extends AIServiceException {
    constructor(service: string, retryAfter?: number);
}
