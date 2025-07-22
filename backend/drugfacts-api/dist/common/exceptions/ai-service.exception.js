"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIServiceRateLimitException = exports.AIServiceTimeoutException = exports.AIServiceException = void 0;
const common_1 = require("@nestjs/common");
class AIServiceException extends common_1.HttpException {
    constructor(message, details) {
        super({
            statusCode: common_1.HttpStatus.SERVICE_UNAVAILABLE,
            error: 'AI_SERVICE_ERROR',
            message,
            details,
        }, common_1.HttpStatus.SERVICE_UNAVAILABLE);
    }
}
exports.AIServiceException = AIServiceException;
class AIServiceTimeoutException extends AIServiceException {
    constructor(service, timeout) {
        super(`AI service ${service} timed out after ${timeout}ms`, {
            service,
            timeout,
        });
    }
}
exports.AIServiceTimeoutException = AIServiceTimeoutException;
class AIServiceRateLimitException extends AIServiceException {
    constructor(service, retryAfter) {
        super(`AI service ${service} rate limit exceeded`, {
            service,
            retryAfter,
        });
    }
}
exports.AIServiceRateLimitException = AIServiceRateLimitException;
//# sourceMappingURL=ai-service.exception.js.map