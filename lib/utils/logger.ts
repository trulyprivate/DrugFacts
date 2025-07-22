/**
 * Structured Logging Utility
 * Provides consistent logging across the application with different levels and contexts
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export interface LogContext {
  operation?: string
  collection?: string
  duration?: number
  error?: Error
  metadata?: Record<string, any>
  userId?: string
  requestId?: string
}

export interface LogEntry {
  timestamp: Date
  level: LogLevel
  message: string
  context?: LogContext
  stack?: string
}

class Logger {
  private logLevel: LogLevel
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.logLevel = this.getLogLevelFromEnv()
  }

  private getLogLevelFromEnv(): LogLevel {
    const level = process.env.LOG_LEVEL?.toUpperCase() || 'INFO'
    switch (level) {
      case 'ERROR': return LogLevel.ERROR
      case 'WARN': return LogLevel.WARN
      case 'INFO': return LogLevel.INFO
      case 'DEBUG': return LogLevel.DEBUG
      default: return LogLevel.INFO
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel
  }

  private formatLogEntry(level: LogLevel, message: string, context?: LogContext): LogEntry {
    return {
      timestamp: new Date(),
      level,
      message,
      context,
      stack: context?.error?.stack
    }
  }

  private outputLog(entry: LogEntry): void {
    const levelName = LogLevel[entry.level]
    const timestamp = entry.timestamp.toISOString()
    
    if (this.isDevelopment) {
      // Pretty format for development
      const contextStr = entry.context ? JSON.stringify(entry.context, null, 2) : ''
      console.log(`[${timestamp}] ${levelName}: ${entry.message}`)
      if (contextStr) {
        console.log('Context:', contextStr)
      }
      if (entry.stack) {
        console.log('Stack:', entry.stack)
      }
    } else {
      // JSON format for production
      console.log(JSON.stringify(entry))
    }
  }

  error(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry = this.formatLogEntry(LogLevel.ERROR, message, context)
      this.outputLog(entry)
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry = this.formatLogEntry(LogLevel.WARN, message, context)
      this.outputLog(entry)
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry = this.formatLogEntry(LogLevel.INFO, message, context)
      this.outputLog(entry)
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry = this.formatLogEntry(LogLevel.DEBUG, message, context)
      this.outputLog(entry)
    }
  }

  /**
   * Log database operations with timing
   */
  logDatabaseOperation(
    operation: string,
    collection: string,
    startTime: Date,
    success: boolean,
    error?: Error,
    metadata?: Record<string, any>
  ): void {
    const duration = Date.now() - startTime.getTime()
    const context: LogContext = {
      operation,
      collection,
      duration,
      error,
      metadata
    }

    if (success) {
      this.info(`Database operation completed: ${operation}`, context)
    } else {
      this.error(`Database operation failed: ${operation}`, context)
    }
  }

  /**
   * Log API requests with timing and status
   */
  logApiRequest(
    method: string,
    path: string,
    statusCode: number,
    startTime: Date,
    error?: Error,
    metadata?: Record<string, any>
  ): void {
    const duration = Date.now() - startTime.getTime()
    const context: LogContext = {
      operation: `${method} ${path}`,
      duration,
      error,
      metadata: {
        ...metadata,
        statusCode
      }
    }

    if (statusCode >= 400) {
      this.error(`API request failed: ${method} ${path}`, context)
    } else {
      this.info(`API request completed: ${method} ${path}`, context)
    }
  }

  /**
   * Log connection events
   */
  logConnectionEvent(
    event: 'connected' | 'disconnected' | 'error' | 'retry',
    details?: Record<string, any>
  ): void {
    const context: LogContext = {
      operation: 'database_connection',
      metadata: details
    }

    switch (event) {
      case 'connected':
        this.info('Database connection established', context)
        break
      case 'disconnected':
        this.info('Database connection closed', context)
        break
      case 'error':
        this.error('Database connection error', context)
        break
      case 'retry':
        this.warn('Database connection retry attempt', context)
        break
    }
  }
}

// Export singleton instance
export const logger = new Logger()

/**
 * Performance monitoring decorator
 */
export function logPerformance(operation: string, collection?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const startTime = new Date()
      let error: Error | undefined
      let result: any

      try {
        result = await method.apply(this, args)
        logger.logDatabaseOperation(operation, collection || 'unknown', startTime, true, undefined, {
          args: args.length
        })
        return result
      } catch (err) {
        error = err as Error
        logger.logDatabaseOperation(operation, collection || 'unknown', startTime, false, error, {
          args: args.length
        })
        throw err
      }
    }

    return descriptor
  }
}

/**
 * Error context builder
 */
export class ErrorContextBuilder {
  private context: LogContext = {}

  operation(op: string): ErrorContextBuilder {
    this.context.operation = op
    return this
  }

  collection(coll: string): ErrorContextBuilder {
    this.context.collection = coll
    return this
  }

  metadata(meta: Record<string, any>): ErrorContextBuilder {
    this.context.metadata = { ...this.context.metadata, ...meta }
    return this
  }

  error(err: Error): ErrorContextBuilder {
    this.context.error = err
    return this
  }

  build(): LogContext {
    return this.context
  }
}

/**
 * Create error context builder
 */
export function createErrorContext(): ErrorContextBuilder {
  return new ErrorContextBuilder()
}