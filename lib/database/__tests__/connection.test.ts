/**
 * Unit tests for MongoDB connection manager
 */

import { MongoClient, Db } from 'mongodb'
import { getDatabase, initializeDatabase, closeDatabase } from '../connection'
import { DatabaseError, DatabaseErrorType } from '../../../types/mongodb'

// Mock MongoDB
jest.mock('mongodb')

const MockedMongoClient = MongoClient as jest.MockedClass<typeof MongoClient>

describe('MongoDB Connection Manager', () => {
  let mockClient: jest.Mocked<MongoClient>
  let mockDb: jest.Mocked<Db>
  let mockAdmin: jest.Mocked<any>

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup mocks
    mockAdmin = {
      ping: jest.fn().mockResolvedValue({}),
    }
    
    mockDb = {
      databaseName: 'drug_facts_test',
      admin: jest.fn().mockReturnValue(mockAdmin),
      collection: jest.fn().mockReturnValue({}),
      listCollections: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          { name: 'drugs' },
          { name: 'users' }
        ])
      })
    } as any

    mockClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      db: jest.fn().mockReturnValue(mockDb),
      on: jest.fn()
    } as any

    MockedMongoClient.mockImplementation(() => mockClient)
  })

  afterEach(async () => {
    // Clean up singleton instance
    const db = getDatabase()
    if (db.isConnected) {
      await db.disconnect()
    }
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const db1 = getDatabase()
      const db2 = getDatabase()
      expect(db1).toBe(db2)
    })
  })

  describe('Connection Management', () => {
    it('should connect successfully', async () => {
      const db = getDatabase()
      
      await db.connect()
      
      expect(MockedMongoClient).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          maxPoolSize: expect.any(Number),
          minPoolSize: expect.any(Number)
        })
      )
      expect(mockClient.connect).toHaveBeenCalled()
      expect(mockDb.admin).toHaveBeenCalled()
      expect(mockAdmin.ping).toHaveBeenCalled()
      expect(db.isConnected).toBe(true)
    })

    it('should not reconnect if already connected', async () => {
      const db = getDatabase()
      
      await db.connect()
      await db.connect() // Second call
      
      expect(mockClient.connect).toHaveBeenCalledTimes(1)
    })

    it('should disconnect successfully', async () => {
      const db = getDatabase()
      
      await db.connect()
      await db.disconnect()
      
      expect(mockClient.close).toHaveBeenCalled()
      expect(db.isConnected).toBe(false)
    })

    it('should handle connection errors', async () => {
      const db = getDatabase()
      const connectionError = new Error('Connection failed')
      mockClient.connect.mockRejectedValue(connectionError)
      
      await expect(db.connect()).rejects.toThrow(DatabaseError)
      expect(db.isConnected).toBe(false)
    })
  })

  describe('Retry Logic', () => {
    it('should retry on retryable errors', async () => {
      const db = getDatabase()
      const retryableError = new Error('MongoNetworkError')
      retryableError.name = 'MongoNetworkError'
      
      mockClient.connect
        .mockRejectedValueOnce(retryableError)
        .mockRejectedValueOnce(retryableError)
        .mockResolvedValueOnce(undefined)
      
      await db.connect()
      
      expect(mockClient.connect).toHaveBeenCalledTimes(3)
      expect(db.isConnected).toBe(true)
    })

    it('should not retry on non-retryable errors', async () => {
      const db = getDatabase()
      const nonRetryableError = new Error('Authentication failed')
      mockClient.connect.mockRejectedValue(nonRetryableError)
      
      await expect(db.connect()).rejects.toThrow(DatabaseError)
      expect(mockClient.connect).toHaveBeenCalledTimes(1)
    })

    it('should fail after max retry attempts', async () => {
      const db = getDatabase()
      const retryableError = new Error('MongoNetworkError')
      retryableError.name = 'MongoNetworkError'
      
      mockClient.connect.mockRejectedValue(retryableError)
      
      await expect(db.connect()).rejects.toThrow(DatabaseError)
      expect(mockClient.connect).toHaveBeenCalledTimes(5) // max attempts
    })
  })

  describe('Health Checks', () => {
    it('should return true for successful ping', async () => {
      const db = getDatabase()
      await db.connect()
      
      const result = await db.ping()
      
      expect(result).toBe(true)
      expect(mockAdmin.ping).toHaveBeenCalled()
    })

    it('should return false for failed ping', async () => {
      const db = getDatabase()
      await db.connect()
      mockAdmin.ping.mockRejectedValue(new Error('Ping failed'))
      
      const result = await db.ping()
      
      expect(result).toBe(false)
    })

    it('should perform comprehensive health check', async () => {
      const db = getDatabase()
      await db.connect()
      
      const healthResult = await db.healthCheck()
      
      expect(healthResult.status).toBe('healthy')
      expect(healthResult.details.connected).toBe(true)
      expect(healthResult.details.database).toBe('drug_facts_test')
      expect(healthResult.details.collections).toEqual(['drugs', 'users'])
      expect(healthResult.responseTime).toBeGreaterThan(0)
    })

    it('should return unhealthy status on ping failure', async () => {
      const db = getDatabase()
      await db.connect()
      mockAdmin.ping.mockRejectedValue(new Error('Database error'))
      
      const healthResult = await db.healthCheck()
      
      expect(healthResult.status).toBe('unhealthy')
      expect(healthResult.details.connected).toBe(false)
      expect(healthResult.details.error).toBe('Ping failed')
    })
  })

  describe('Collection Access', () => {
    it('should return collection when connected', async () => {
      const db = getDatabase()
      await db.connect()
      
      const collection = db.getCollection('drugs')
      
      expect(mockDb.collection).toHaveBeenCalledWith('drugs')
      expect(collection).toBeDefined()
    })

    it('should throw error when not connected', () => {
      const db = getDatabase()
      
      expect(() => db.getCollection('drugs')).toThrow(DatabaseError)
    })
  })

  describe('Event Handling', () => {
    it('should emit connection events', async () => {
      const db = getDatabase()
      const eventListener = jest.fn()
      
      db.addEventListener(eventListener)
      await db.connect()
      
      expect(eventListener).toHaveBeenCalledWith({
        type: 'connected',
        timestamp: expect.any(Date)
      })
    })

    it('should emit disconnection events', async () => {
      const db = getDatabase()
      const eventListener = jest.fn()
      
      db.addEventListener(eventListener)
      await db.connect()
      await db.disconnect()
      
      expect(eventListener).toHaveBeenCalledWith({
        type: 'disconnected',
        timestamp: expect.any(Date)
      })
    })

    it('should remove event listeners', async () => {
      const db = getDatabase()
      const eventListener = jest.fn()
      
      db.addEventListener(eventListener)
      db.removeEventListener(eventListener)
      await db.connect()
      
      expect(eventListener).not.toHaveBeenCalled()
    })
  })

  describe('Utility Functions', () => {
    it('should initialize database connection', async () => {
      await initializeDatabase()
      
      const db = getDatabase()
      expect(db.isConnected).toBe(true)
    })

    it('should close database connection', async () => {
      await initializeDatabase()
      await closeDatabase()
      
      const db = getDatabase()
      expect(db.isConnected).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should throw DatabaseError for client access when not connected', () => {
      const db = getDatabase()
      
      expect(() => db.client).toThrow(DatabaseError)
      expect(() => db.client).toThrow('MongoDB client not initialized')
    })

    it('should throw DatabaseError for db access when not connected', () => {
      const db = getDatabase()
      
      expect(() => db.db).toThrow(DatabaseError)
      expect(() => db.db).toThrow('Database not initialized')
    })
  })
})