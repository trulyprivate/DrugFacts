import { HttpException, HttpStatus } from '@nestjs/common';

export class AIServiceException extends HttpException {
  constructor(message: string, details?: any) {
    super(
      {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        error: 'AI_SERVICE_ERROR',
        message,
        details,
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

export class AIServiceTimeoutException extends AIServiceException {
  constructor(service: string, timeout: number) {
    super(`AI service ${service} timed out after ${timeout}ms`, {
      service,
      timeout,
    });
  }
}

export class AIServiceRateLimitException extends AIServiceException {
  constructor(service: string, retryAfter?: number) {
    super(`AI service ${service} rate limit exceeded`, {
      service,
      retryAfter,
    });
  }
}