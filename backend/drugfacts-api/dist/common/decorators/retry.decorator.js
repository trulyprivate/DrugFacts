"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Retry = Retry;
exports.RetryOnTimeout = RetryOnTimeout;
exports.RetryOnDatabaseError = RetryOnDatabaseError;
const common_1 = require("@nestjs/common");
const defaultOptions = {
    maxAttempts: 3,
    backoff: 1000,
    maxBackoff: 30000,
    exponential: true,
    retryCondition: () => true,
};
function Retry(options = {}) {
    const config = { ...defaultOptions, ...options };
    const logger = new common_1.Logger('RetryDecorator');
    return function (target, propertyName, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            let lastError;
            for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
                try {
                    return await originalMethod.apply(this, args);
                }
                catch (error) {
                    lastError = error;
                    if (!config.retryCondition(error)) {
                        throw error;
                    }
                    if (attempt === config.maxAttempts) {
                        logger.error(`Max retry attempts (${config.maxAttempts}) reached for ${target.constructor.name}.${propertyName}`);
                        throw error;
                    }
                    let delay = config.backoff;
                    if (config.exponential) {
                        delay = Math.min(config.backoff * Math.pow(2, attempt - 1), config.maxBackoff);
                    }
                    logger.warn(`Retry attempt ${attempt}/${config.maxAttempts} for ${target.constructor.name}.${propertyName} after ${delay}ms`);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
            throw lastError;
        };
        return descriptor;
    };
}
function RetryOnTimeout(options = {}) {
    return Retry({
        ...options,
        retryCondition: (error) => {
            return (error.code === 'ETIMEDOUT' ||
                error.code === 'ECONNRESET' ||
                error.message?.includes('timeout'));
        },
    });
}
function RetryOnDatabaseError(options = {}) {
    return Retry({
        ...options,
        retryCondition: (error) => {
            return (error.name === 'MongoNetworkError' ||
                error.name === 'MongoTimeoutError' ||
                error.code === 'ECONNREFUSED');
        },
    });
}
//# sourceMappingURL=retry.decorator.js.map