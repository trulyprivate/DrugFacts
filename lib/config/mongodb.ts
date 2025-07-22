/**
 * MongoDB Configuration
 * Handles environment-based configuration for MongoDB connections
 */

export interface MongoConfig {
  url: string
  dbName: string
  options: {
    maxPoolSize: number
    minPoolSize: number
    maxIdleTimeMS: number
    serverSelectionTimeoutMS: number
    socketTimeoutMS: number
    connectTimeoutMS: number
    retryWrites: boolean
    retryReads: boolean
  }
}

/**
 * Get MongoDB configuration from environment variables
 */
export const getMongoConfig = (): MongoConfig => {
  const config: MongoConfig = {
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017',
    dbName: process.env.MONGODB_DB_NAME || 'drug_facts',
    options: {
      maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10'),
      minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '2'),
      maxIdleTimeMS: parseInt(process.env.MONGODB_MAX_IDLE_TIME_MS || '30000'),
      serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || '5000'),
      socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT_MS || '45000'),
      connectTimeoutMS: parseInt(process.env.MONGODB_CONNECT_TIMEOUT_MS || '10000'),
      retryWrites: process.env.MONGODB_RETRY_WRITES !== 'false',
      retryReads: process.env.MONGODB_RETRY_READS !== 'false'
    }
  }

  // Validate required configuration
  if (!config.url) {
    throw new Error('MONGODB_URL environment variable is required')
  }

  if (!config.dbName) {
    throw new Error('MONGODB_DB_NAME environment variable is required')
  }

  return config
}

/**
 * Environment-specific configurations
 */
export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development'
  
  const configs = {
    development: {
      url: process.env.MONGODB_URL || 'mongodb://localhost:27017',
      dbName: process.env.MONGODB_DB_NAME || 'drug_facts',
      logLevel: 'debug'
    },
    test: {
      url: process.env.MONGODB_TEST_URL || 'mongodb://localhost:27017',
      dbName: process.env.MONGODB_TEST_DB_NAME || 'drug_facts_test',
      logLevel: 'error'
    },
    production: {
      url: process.env.MONGODB_URL || '',
      dbName: process.env.MONGODB_DB_NAME || 'drug_facts',
      logLevel: 'info'
    }
  }

  return configs[env as keyof typeof configs] || configs.development
}

/**
 * Collection names used in the application
 */
export const COLLECTIONS = {
  DRUGS: process.env.MONGODB_COLLECTION_NAME || 'drugs'
} as const

/**
 * MongoDB connection string builder for different environments
 */
export const buildConnectionString = (
  host: string = 'localhost',
  port: number = 27017,
  database?: string,
  username?: string,
  password?: string,
  options?: Record<string, string>
): string => {
  let connectionString = 'mongodb://'
  
  if (username && password) {
    connectionString += `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`
  }
  
  connectionString += `${host}:${port}`
  
  if (database) {
    connectionString += `/${database}`
  }
  
  if (options && Object.keys(options).length > 0) {
    const optionString = Object.entries(options)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
    connectionString += `?${optionString}`
  }
  
  return connectionString
}

/**
 * Validate MongoDB configuration
 */
export const validateConfig = (config: MongoConfig): void => {
  if (!config.url) {
    throw new Error('MongoDB URL is required')
  }
  
  if (!config.dbName) {
    throw new Error('MongoDB database name is required')
  }
  
  if (config.options.maxPoolSize < 1) {
    throw new Error('maxPoolSize must be at least 1')
  }
  
  if (config.options.minPoolSize < 0) {
    throw new Error('minPoolSize cannot be negative')
  }
  
  if (config.options.minPoolSize > config.options.maxPoolSize) {
    throw new Error('minPoolSize cannot be greater than maxPoolSize')
  }
}