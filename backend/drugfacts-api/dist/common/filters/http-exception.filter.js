"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    logger = new common_1.Logger(HttpExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = 'UNKNOWN_ERROR';
        let details = null;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            }
            else if (typeof exceptionResponse === 'object') {
                message = exceptionResponse['message'] || exception.message;
                error = exceptionResponse['error'] || 'HTTP_ERROR';
                details = exceptionResponse['details'] || null;
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
            error = exception.name;
            if (exception.name === 'MongoError') {
                const mongoError = exception;
                if (mongoError.code === 11000) {
                    status = common_1.HttpStatus.CONFLICT;
                    message = 'Duplicate entry';
                    error = 'DUPLICATE_ENTRY';
                }
                else {
                    status = common_1.HttpStatus.BAD_REQUEST;
                    message = 'Database error';
                    error = 'DATABASE_ERROR';
                }
            }
            else if (exception.name === 'ValidationError') {
                status = common_1.HttpStatus.BAD_REQUEST;
                error = 'VALIDATION_ERROR';
            }
        }
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
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map