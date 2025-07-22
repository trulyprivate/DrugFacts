import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'UNKNOWN_ERROR';
    let details = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = exceptionResponse['message'] || exception.message;
        error = exceptionResponse['error'] || 'HTTP_ERROR';
        details = exceptionResponse['details'] || null;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
      
      // Handle MongoDB errors
      if (exception.name === 'MongoError') {
        const mongoError = exception as any;
        if (mongoError.code === 11000) {
          status = HttpStatus.CONFLICT;
          message = 'Duplicate entry';
          error = 'DUPLICATE_ENTRY';
        } else {
          status = HttpStatus.BAD_REQUEST;
          message = 'Database error';
          error = 'DATABASE_ERROR';
        }
      }
      // Handle validation errors
      else if (exception.name === 'ValidationError') {
        status = HttpStatus.BAD_REQUEST;
        error = 'VALIDATION_ERROR';
      }
    }

    // Log the error
    this.logger.error({
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      status,
      error,
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
      body: request.body,
      query: request.query,
      params: request.params,
    });

    response.status(status).json({
      statusCode: status,
      error,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    });
  }
}