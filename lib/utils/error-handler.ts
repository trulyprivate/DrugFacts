/**
 * Enhanced Error Handling Utilities
 * Provides structured error handling with meaningful messages and recovery strategies
 */

import { logger, LogContext, createErrorContext } from './logger'
import { DatabaseError, DatabaseErrorType } from '../../types/mongodb'

/**
 * Application error types
 */
export enum AppErrorType {
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Application error class with context
 */
export class AppError extends Error {
  public readonly type: AppErrorType
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly context?: LogContext
  public readonly originalError?: Error

  constructor(
    type: AppErrorType,
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: LogContext,
    originalError?: Error
  ) {
    super(message)
    
    this.type = type
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.context = context
    this.originalError = originalError
    this.name = 'AppError'

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Error factory functions
 */
export class ErrorFactory {
  static databaseError(
    message: string,
    originalError?: Error,
    context?: LogContext
  ): AppError {
    return new AppError(
      AppErrorType.DATABASE_ERROR,
      message,
      500,
      true,
      context,
      originalError
    )
  }

  static validationError(
    message: string,
    context?: LogContext
  ): AppError {
    return new AppError(
      AppErrorType.VALIDATION_ERROR,
      message,
      400,
      true,
      context
    )
  }

  static notFoundError(
    resource: string,
    identifier?: string,
    context?: LogContext
  ): AppError {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`
    
    return new AppError(
      AppErrorType.NOT_FOUND_ERROR,
      message,
      404,
      true,
      context
    )
  }

  static networkError(
    message: string,
    originalError?: Error,
    context?: LogContext
  ): AppError {
    return new AppError(
      AppErrorType.NETWORK_ERROR,
      message,
      503,
      true,
      context,
      originalError
    )
  }

  static timeoutError(
    operation: string,
    timeout: number,
    context?: LogContext
  ): AppError {
    return new AppError(
      AppErrorType.TIMEOUT_ERROR,
      `Operation '${operation}' timed out after ${timeout}ms`,
      408,
      true,
      context
    )
  }

  static configurationError(
    message: string,
    context?: LogContext
  ): AppError {
    return new AppError(
      AppErrorType.CONFIGURATION_ERROR,
      message,
      500,
      false,
      context
    )
  }
}

/**
 * Error handler with recovery strategies
 */
export class ErrorHandler {
  /**
   * Handle database errors with appropriate recovery
   */
  static async handleDatabaseError(
    error: Error,
    operation: string,
    collection?: string,
    fallbackFn?: () => Promise<any>
  ): Promise<any> {
    const context = createErrorContext()
      .operation(operation)
      .collection(collection || 'unknown')
      .error(error)
      .build()

    logger.error(`Database error in ${operation}`, context)

    // Try fallback if available
    if (fallbackFn) {
      try {
        logger.info(`Attempting fallback for ${operation}`, context)
        const result = await fallbackFn()
        logger.info(`Fallback successful for ${operation}`, context)
        return result
      } catch (fallbackError) {
        logger.error(`Fallback failed for ${operation}`, {
          ...context,
          error: fallbackError as Error
        })
      }
    }

    // Convert to appropriate app error
    if (error.name === 'MongoNetworkError') {
      throw ErrorFactory.networkError(
        'Database connection failed',
        error,
        context
      )
    } else if (error.name === 'MongoTimeoutError') {
      throw ErrorFactory.timeoutError(
        operation,
        30000, // Default timeout
        context
      )
    } else if (error instanceof DatabaseError) {
      throw ErrorFactory.databaseError(
        error.message,
        error,
        context
      )
    } else {
      throw ErrorFactory.databaseError(
        `Database operation failed: ${error.message}`,
        error,
        context
      )
    }
  }

  /**
   * Handle API errors with proper status codes
   */
  static handleApiError(error: Error, operation: string): AppError {
    const context = createErrorContext()
      .operation(operation)
      .error(error)
      .build()

    logger.error(`API error in ${operation}`, context)

    if (error instanceof AppError) {
      return error
    }

    // Convert common errors
    if (error.message.includes('not found')) {
      return ErrorFactory.notFoundError('Resource', undefined, context)
    } else if (error.message.includes('timeout')) {
      return ErrorFactory.timeoutError(operation, 30000, context)
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      return ErrorFactory.networkError(error.message, error, context)
    } else {
      return new AppError(
        AppErrorType.UNKNOWN_ERROR,
        `API operation failed: ${error.message}`,
        500,
        true,
        context,
        error
      )
    }
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(
    errors: Array<{ field: string; message: string }>,
    operation: string
  ): AppError {
    const context = createErrorContext()
      .operation(operation)
      .metadata({ validationErrors: errors })
      .build()

    const message = `Validation failed: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`
    
    logger.error(`Validation error in ${operation}`, context)
    
    return ErrorFactory.validationError(message, context)
  }

  /**
   * Log and handle unexpected errors
   */
  static handleUnexpectedError(
    error: Error,
    operation: string,
    context?: LogContext
  ): AppError {
    const errorContext = {
      ...context,
      operation,
      error
    }

    logger.error(`Unexpected error in ${operation}`, errorContext)

    return new AppError(
      AppErrorType.UNKNOWN_ERROR,
      'An unexpected error occurred',
      500,
      false,
      errorContext,
      error
    )
  }
}

/**
 * Retry mechanism with exponential backoff
 */
export class RetryHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxAttempts?: number
      initialDelay?: number
      maxDelay?: number
      backoffMultiplier?: number
      retryableErrors?: string[]
      operationName?: string
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      initialDelay = 1000,
      maxDelay = 10000,
      backoffMultiplier = 2,
      retryableErrors = ['MongoNetworkError', 'MongoTimeoutError'],
      operationName = 'unknown'
    } = options

    let lastError: Error
    let delay = initialDelay

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await operation()
        
        if (attempt > 1) {
          logger.info(`Operation succeeded after ${attempt} attempts`, {
            operation: operationName,
            metadata: { attempt, totalAttempts: maxAttempts }
          })
        }
        
        return result
      } catch (error) {
        lastError = error as Error
        
        const isRetryable = retryableErrors.some(retryableError =>
          lastError.name === retryableError || lastError.message.includes(retryableError)
        )

        if (!isRetryable || attempt === maxAttempts) {
          logger.error(`Operation failed after ${attempt} attempts`, {
            operation: operationName,
            error: lastError,
            metadata: { attempt, totalAttempts: maxAttempts, isRetryable }
          })
          throw lastError
        }

        logger.warn(`Operation failed, retrying in ${delay}ms`, {
          operation: operationName,
          error: lastError,
          metadata: { attempt, totalAttempts: maxAttempts, delay }
        })

        await new Promise(resolve => setTimeout(resolve, delay))
        delay = Math.min(delay * backoffMultiplier, maxDelay)
      }
    }

    throw lastError!
  }
}

/**
 * Circuit breaker pattern for external dependencies
 */
export class CircuitBreaker {
  private failures: number = 0
  private lastFailureTime: number = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'

  constructor(
    private readonly failureThreshold: number = 5,
    private readonly recoveryTimeout: number = 60000, // 1 minute
    private readonly operationName: string = 'unknown'
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN'
        logger.info(`Circuit breaker transitioning to HALF_OPEN`, {
          operation: this.operationName,
          metadata: { failures: this.failures }
        })
      } else {
        throw ErrorFactory.networkError(
          `Circuit breaker is OPEN for ${this.operationName}`,
          undefined,
          { operation: this.operationName, metadata: { state: this.state } }
        )
      }
    }

    try {
      const result = await operation()
      
      if (this.state === 'HALF_OPEN') {
        this.reset()
        logger.info(`Circuit breaker reset to CLOSED`, {
          operation: this.operationName
        })
      }
      
      return result
    } catch (error) {
      this.recordFailure()
      throw error
    }
  }

  private recordFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN'
      logger.error(`Circuit breaker opened`, {
        operation: this.operationName,
        metadata: { failures: this.failures, threshold: this.failureThreshold }
      })
    }
  }

  private reset(): void {
    this.failures = 0
    this.state = 'CLOSED'
  }

  getState(): { state: string; failures: number } {
    return {
      state: this.state,
      failures: this.failures
    }
  }
}

/**
 * Graceful degradation helper
 */
export class GracefulDegradation {
  static async withFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    try {
      return await primaryOperation()
    } catch (primaryError) {
      logger.warn(`Primary operation failed, attempting fallback`, {
        operation: operationName,
        error: primaryError as Error
      })

      try {
        const result = await fallbackOperation()
        logger.info(`Fallback operation succeeded`, {
          operation: operationName
        })
        return result
      } catch (fallbackError) {
        logger.error(`Both primary and fallback operations failed`, {
          operation: operationName,
          error: fallbackError as Error,
          metadata: { primaryError: (primaryError as Error).message }
        })
        throw primaryError // Throw original error
      }
    }
  }
}