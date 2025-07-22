/**
 * MongoDB Connection Manager
 * Implements singleton pattern with connection pooling, retry logic, and health checks
 */

import { MongoClient, Db, Collection, Document } from 'mongodb'
import { getMongoConfig, validateConfig, COLLECTIONS } from '../config/mongodb'
import { 
  DatabaseConnection, 
  DatabaseError, 
  DatabaseErrorType, 
  RetryConfig,
  HealthCheckResult,
  DatabaseEvent,
  DatabaseEventListener
} from '../../types/mongodb'

/**
 * Singleton MongoDB connection manager
 */
class MongoConnectionManager implements DatabaseConnection {
  private static instance: MongoConnectionManager
  private _client: MongoClient | null = null
  private _db: Db | null = null
  private _isConnected: boolean = false
  private _isConnecting: boolean = false
  private _connectionPromise: Promise<void> | null = null
  private _eventListeners: DatabaseEventListener[] = []
  
  private readonly retryConfig: RetryConfig = {
    maxAttempts: 5,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    retryableErrors: [
      'MongoNetworkError',
      'MongoServerSelectionError',
      'MongoTimeoutError'
    ]
  }

  private constructor() {
    // Private constructor for singleton pattern
    this.setupProcessHandlers()
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): MongoConnectionManager {
    if (!MongoConnectionManager.instance) {
      MongoConnectionManager.instance = new MongoConnectionManager()
    }
    return MongoConnectionManager.instance
  }

  /**
   * Get MongoDB client
   */
  public get client(): MongoClient {
    if (!this._client) {
      throw new DatabaseError(
        DatabaseErrorType.CONNECTION_ERROR,
        'MongoDB client not initialized. Call connect() first.'
      )
    }
    return this._client
  }

  /**
   * Get database instance
   */
  public get db(): Db {
    if (!this._db) {
      throw new DatabaseError(
        DatabaseErrorType.CONNECTION_ERROR,
        'Database not initialized. Call connect() first.'
      )
    }
    return this._db
  }

  /**
   * Check if connected to MongoDB
   */
  public get isConnected(): boolean {
    return this._isConnected
  }

  /**
   * Connect to MongoDB with retry logic
   */
  public async connect(): Promise<void> {
    if (this._isConnected) {
      return
    }

    if (this._isConnecting && this._connectionPromise) {
      return this._connectionPromise
    }

    this._isConnecting = true
    this._connectionPromise = this._connectWithRetry()

    try {
      await this._connectionPromise
    } finally {
      this._isConnecting = false
      this._connectionPromise = null
    }
  }

  /**
   * Connect with exponential backoff retry logic
   */
  private async _connectWithRetry(): Promise<void> {
    const config = getMongoConfig()
    validateConfig(config)

    let lastError: Error | null = null
    let delay = this.retryConfig.initialDelay

    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        console.log(`Attempting MongoDB connection (attempt ${attempt}/${this.retryConfig.maxAttempts})...`)
        
        this._client = new MongoClient(config.url, config.options)
        await this._client.connect()
        
        this._db = this._client.db(config.dbName)
        
        // Test the connection
        await this._db.admin().ping()
        
        this._isConnected = true
        
        console.log(`Successfully connected to MongoDB: ${config.dbName}`)
        this._emitEvent({ type: 'connected', timestamp: new Date() })
        
        // Setup connection event listeners
        this._setupConnectionEventListeners()
        
        return
        
      } catch (error) {
        lastError = error as Error
        console.error(`MongoDB connection attempt ${attempt} failed:`, error)
        
        // Clean up failed connection
        if (this._client) {
          try {
            await this._client.close()
          } catch (closeError) {
            console.error('Error closing failed connection:', closeError)
          }
          this._client = null
          this._db = null
        }
        
        // Check if error is retryable
        if (!this._isRetryableError(lastError) || attempt === this.retryConfig.maxAttempts) {
          break
        }
        
        // Wait before retry with exponential backoff
        console.log(`Retrying in ${delay}ms...`)
        await this._sleep(delay)
        delay = Math.min(delay * this.retryConfig.backoffMultiplier, this.retryConfig.maxDelay)
      }
    }

    // All retry attempts failed
    const errorMessage = `Failed to connect to MongoDB after ${this.retryConfig.maxAttempts} attempts`
    const dbError = new DatabaseError(
      DatabaseErrorType.CONNECTION_ERROR,
      errorMessage,
      lastError || undefined
    )
    
    this._emitEvent({ 
      type: 'error', 
      timestamp: new Date(), 
      error: dbError 
    })
    
    throw dbError
  }

  /**
   * Disconnect from MongoDB
   */
  public async disconnect(): Promise<void> {
    if (!this._client) {
      return
    }

    try {
      await this._client.close()
      console.log('Disconnected from MongoDB')
      this._emitEvent({ type: 'disconnected', timestamp: new Date() })
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error)
      this._emitEvent({ 
        type: 'error', 
        timestamp: new Date(), 
        error: error as Error 
      })
    } finally {
      this._client = null
      this._db = null
      this._isConnected = false
    }
  }

  /**
   * Get a collection with proper typing
   */
  public getCollection<T extends Document = Document>(name: string): Collection<T> {
    if (!this._db) {
      throw new DatabaseError(
        DatabaseErrorType.CONNECTION_ERROR,
        'Database not connected. Call connect() first.'
      )
    }
    return this._db.collection<T>(name)
  }

  /**
   * Ping MongoDB to check connection health
   */
  public async ping(): Promise<boolean> {
    try {
      if (!this._db) {
        return false
      }
      await this._db.admin().ping()
      return true
    } catch (error) {
      console.error('MongoDB ping failed:', error)
      return false
    }
  }

  /**
   * Perform comprehensive health check
   */
  public async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now()
    
    try {
      const isHealthy = await this.ping()
      const responseTime = Date.now() - startTime
      
      if (!isHealthy) {
        return {
          status: 'unhealthy',
          timestamp: new Date(),
          responseTime,
          details: {
            connected: false,
            database: this._db?.databaseName || 'unknown',
            error: 'Ping failed'
          }
        }
      }

      // Get additional health information
      const collections = await this._db!.listCollections().toArray()
      
      return {
        status: 'healthy',
        timestamp: new Date(),
        responseTime,
        details: {
          connected: true,
          database: this._db!.databaseName,
          collections: collections.map(col => col.name)
        }
      }
      
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
        details: {
          connected: false,
          database: this._db?.databaseName || 'unknown',
          error: (error as Error).message
        }
      }
    }
  }

  /**
   * Add event listener
   */
  public addEventListener(listener: DatabaseEventListener): void {
    this._eventListeners.push(listener)
  }

  /**
   * Remove event listener
   */
  public removeEventListener(listener: DatabaseEventListener): void {
    const index = this._eventListeners.indexOf(listener)
    if (index > -1) {
      this._eventListeners.splice(index, 1)
    }
  }

  /**
   * Emit database event to all listeners
   */
  private _emitEvent(event: DatabaseEvent): void {
    this._eventListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in database event listener:', error)
      }
    })
  }

  /**
   * Setup MongoDB client event listeners
   */
  private _setupConnectionEventListeners(): void {
    if (!this._client) return

    this._client.on('close', () => {
      this._isConnected = false
      this._emitEvent({ type: 'disconnected', timestamp: new Date() })
    })

    this._client.on('error', (error) => {
      this._emitEvent({ type: 'error', timestamp: new Date(), error })
    })

    this._client.on('timeout', (error: Error) => {
      this._emitEvent({ type: 'error', timestamp: new Date(), error })
    })
  }

  /**
   * Setup process handlers for graceful shutdown
   */
  private setupProcessHandlers(): void {
    const gracefulShutdown = async (signal: string) => {
      console.log(`Received ${signal}. Gracefully shutting down MongoDB connection...`)
      try {
        await this.disconnect()
        process.exit(0)
      } catch (error) {
        console.error('Error during graceful shutdown:', error)
        process.exit(1)
      }
    }

    process.on('SIGINT', () => gracefulShutdown('SIGINT'))
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')) // nodemon restart
  }

  /**
   * Check if error is retryable
   */
  private _isRetryableError(error: Error): boolean {
    return this.retryConfig.retryableErrors.some(retryableError => 
      error.name === retryableError || error.message.includes(retryableError)
    )
  }

  /**
   * Sleep utility for retry delays
   */
  private _sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * Get the singleton MongoDB connection manager instance
 */
export const getDatabase = (): MongoConnectionManager => {
  return MongoConnectionManager.getInstance()
}

/**
 * Initialize database connection
 */
export const initializeDatabase = async (): Promise<void> => {
  const db = getDatabase()
  await db.connect()
}

/**
 * Close database connection
 */
export const closeDatabase = async (): Promise<void> => {
  const db = getDatabase()
  await db.disconnect()
}

/**
 * Get drugs collection with proper typing
 */
export const getDrugsCollection = () => {
  const db = getDatabase()
  return db.getCollection(COLLECTIONS.DRUGS)
}

export default MongoConnectionManager