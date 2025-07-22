/**
 * MongoDB-specific types and interfaces
 */

import { MongoClient, Db, Collection, Document, ObjectId } from 'mongodb'
import { DrugLabel } from './drug'

/**
 * MongoDB Document with metadata fields
 */
export interface MongoDocument extends Document {
  _id?: ObjectId
  _hash?: string
  _created_at?: Date
  _updated_at?: Date
}

/**
 * Drug document as stored in MongoDB
 */
export interface DrugDocument extends DrugLabel, MongoDocument {
  // Inherits all DrugLabel fields plus MongoDB metadata
}

/**
 * Database connection interface
 */
export interface DatabaseConnection {
  client: MongoClient
  db: Db
  isConnected: boolean
  connect(): Promise<void>
  disconnect(): Promise<void>
  getCollection<T extends Document = Document>(name: string): Collection<T>
  ping(): Promise<boolean>
}

/**
 * Database operation result types
 */
export interface InsertResult {
  success: boolean
  insertedId?: ObjectId
  error?: string
}

export interface UpdateResult {
  success: boolean
  modifiedCount: number
  matchedCount: number
  error?: string
}

export interface DeleteResult {
  success: boolean
  deletedCount: number
  error?: string
}

export interface FindResult<T> {
  success: boolean
  data?: T[]
  count?: number
  error?: string
}

export interface FindOneResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Query options for database operations
 */
export interface QueryOptions {
  limit?: number
  skip?: number
  sort?: Record<string, 1 | -1>
  projection?: Record<string, 0 | 1>
}

/**
 * Search options for drug queries
 */
export interface SearchOptions extends QueryOptions {
  caseSensitive?: boolean
  fuzzy?: boolean
  fields?: string[]
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number
  limit: number
  sort?: Record<string, 1 | -1>
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * Database health check result
 */
export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy'
  timestamp: Date
  responseTime: number
  details: {
    connected: boolean
    database: string
    collections?: string[]
    error?: string
  }
}

/**
 * Migration statistics
 */
export interface MigrationStats {
  processed: number
  inserted: number
  updated: number
  skipped: number
  failed: number
  errors: string[]
  startTime: Date
  endTime?: Date
  duration?: number
}

/**
 * Index definition for MongoDB collections
 */
export interface IndexDefinition {
  name: string
  keys: Record<string, 1 | -1 | 'text'>
  options?: {
    unique?: boolean
    sparse?: boolean
    background?: boolean
    expireAfterSeconds?: number
    partialFilterExpression?: Document
    weights?: Record<string, number>
    [key: string]: any // Allow additional MongoDB index options
  }
}

/**
 * Database operation context
 */
export interface OperationContext {
  operation: string
  collection: string
  startTime: Date
  endTime?: Date
  duration?: number
  success: boolean
  error?: string
  metadata?: Record<string, any>
}

/**
 * Connection pool statistics
 */
export interface PoolStats {
  totalConnections: number
  availableConnections: number
  checkedOutConnections: number
  minPoolSize: number
  maxPoolSize: number
}

/**
 * Database metrics
 */
export interface DatabaseMetrics {
  connectionPool: PoolStats
  operations: {
    total: number
    successful: number
    failed: number
    averageResponseTime: number
  }
  collections: Record<string, {
    documentCount: number
    indexCount: number
    storageSize: number
  }>
}

/**
 * Error types for database operations
 */
export enum DatabaseErrorType {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DUPLICATE_KEY_ERROR = 'DUPLICATE_KEY_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Custom database error class
 */
export class DatabaseError extends Error {
  constructor(
    public type: DatabaseErrorType,
    message: string,
    public originalError?: Error,
    public context?: OperationContext
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

/**
 * Connection retry configuration
 */
export interface RetryConfig {
  maxAttempts: number
  initialDelay: number
  maxDelay: number
  backoffMultiplier: number
  retryableErrors: string[]
}

/**
 * Database event types
 */
export type DatabaseEvent = 
  | { type: 'connected'; timestamp: Date }
  | { type: 'disconnected'; timestamp: Date }
  | { type: 'error'; timestamp: Date; error: Error }
  | { type: 'operation'; timestamp: Date; context: OperationContext }

/**
 * Database event listener
 */
export type DatabaseEventListener = (event: DatabaseEvent) => void