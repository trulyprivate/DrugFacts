import { Logger } from '@nestjs/common';

export interface RetryOptions {
  maxAttempts?: number;
  backoff?: number;
  maxBackoff?: number;
  exponential?: boolean;
  retryCondition?: (error: any) => boolean;
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  backoff: 1000,
  maxBackoff: 30000,
  exponential: true,
  retryCondition: () => true,
};

export function Retry(options: RetryOptions = {}) {
  const config = { ...defaultOptions, ...options };
  const logger = new Logger('RetryDecorator');

  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let lastError: any;

      for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error;

          // Check if we should retry this error
          if (!config.retryCondition(error)) {
            throw error;
          }

          if (attempt === config.maxAttempts) {
            logger.error(
              `Max retry attempts (${config.maxAttempts}) reached for ${target.constructor.name}.${propertyName}`,
            );
            throw error;
          }

          // Calculate delay with exponential backoff
          let delay = config.backoff;
          if (config.exponential) {
            delay = Math.min(
              config.backoff * Math.pow(2, attempt - 1),
              config.maxBackoff,
            );
          }

          logger.warn(
            `Retry attempt ${attempt}/${config.maxAttempts} for ${target.constructor.name}.${propertyName} after ${delay}ms`,
          );

          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      throw lastError;
    };

    return descriptor;
  };
}

// Specific retry decorators for common scenarios
export function RetryOnTimeout(options: Partial<RetryOptions> = {}) {
  return Retry({
    ...options,
    retryCondition: (error) => {
      return (
        error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNRESET' ||
        error.message?.includes('timeout')
      );
    },
  });
}

export function RetryOnDatabaseError(options: Partial<RetryOptions> = {}) {
  return Retry({
    ...options,
    retryCondition: (error) => {
      return (
        error.name === 'MongoNetworkError' ||
        error.name === 'MongoTimeoutError' ||
        error.code === 'ECONNREFUSED'
      );
    },
  });
}