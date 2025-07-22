/**
 * Database Setup Utilities
 * Handles index creation, schema validation setup, and database initialization
 */

import { Collection, CreateIndexesOptions, IndexSpecification } from 'mongodb'
import { getDatabase } from './connection'
import { DRUG_COLLECTION_INDEXES, COLLECTION_SCHEMAS } from './schema'
import { COLLECTIONS } from '../config/mongodb'
import { IndexDefinition } from '../../types/mongodb'

/**
 * Database setup manager
 */
export class DatabaseSetup {
  /**
   * Initialize database with indexes and schema validation
   */
  static async initialize(): Promise<void> {
    console.log('Initializing database setup...')
    
    try {
      const db = getDatabase()
      
      // Ensure connection
      if (!db.isConnected) {
        await db.connect()
      }

      // Setup drugs collection
      await this.setupDrugsCollection()
      
      console.log('Database setup completed successfully')
      
    } catch (error) {
      console.error('Database setup failed:', error)
      throw error
    }
  }

  /**
   * Setup drugs collection with indexes and validation
   */
  static async setupDrugsCollection(): Promise<void> {
    console.log('Setting up drugs collection...')
    
    const db = getDatabase()
    const collection = db.getCollection(COLLECTIONS.DRUGS)
    
    // Create indexes
    await this.createIndexes(collection, DRUG_COLLECTION_INDEXES)
    
    // Setup schema validation (optional - can be enabled in production)
    if (process.env.ENABLE_SCHEMA_VALIDATION === 'true') {
      await this.setupSchemaValidation(COLLECTIONS.DRUGS)
    }
    
    console.log('Drugs collection setup completed')
  }

  /**
   * Create indexes for a collection
   */
  static async createIndexes(
    collection: Collection, 
    indexDefinitions: IndexDefinition[]
  ): Promise<void> {
    console.log(`Creating ${indexDefinitions.length} indexes...`)
    
    for (const indexDef of indexDefinitions) {
      try {
        const indexSpec: IndexSpecification = indexDef.keys
        const options: CreateIndexesOptions = {
          name: indexDef.name,
          ...indexDef.options
        }
        
        await collection.createIndex(indexSpec, options)
        console.log(`✓ Created index: ${indexDef.name}`)
        
      } catch (error: any) {
        // Index might already exist
        if (error.code === 85 || error.message.includes('already exists')) {
          console.log(`⚠ Index already exists: ${indexDef.name}`)
        } else {
          console.error(`✗ Failed to create index ${indexDef.name}:`, error.message)
          throw error
        }
      }
    }
  }

  /**
   * Setup schema validation for a collection
   */
  static async setupSchemaValidation(collectionName: string): Promise<void> {
    console.log(`Setting up schema validation for ${collectionName}...`)
    
    const db = getDatabase()
    const schema = COLLECTION_SCHEMAS[collectionName as keyof typeof COLLECTION_SCHEMAS]
    
    if (!schema) {
      console.warn(`No schema defined for collection: ${collectionName}`)
      return
    }

    try {
      await db.db.command({
        collMod: collectionName,
        validator: schema.validator,
        validationLevel: schema.validationLevel,
        validationAction: schema.validationAction
      })
      
      console.log(`✓ Schema validation enabled for ${collectionName}`)
      
    } catch (error: any) {
      console.error(`✗ Failed to setup schema validation for ${collectionName}:`, error.message)
      throw error
    }
  }

  /**
   * Drop all indexes for a collection (useful for development)
   */
  static async dropAllIndexes(collectionName: string): Promise<void> {
    console.log(`Dropping all indexes for ${collectionName}...`)
    
    const db = getDatabase()
    const collection = db.getCollection(collectionName)
    
    try {
      await collection.dropIndexes()
      console.log(`✓ Dropped all indexes for ${collectionName}`)
    } catch (error: any) {
      console.error(`✗ Failed to drop indexes for ${collectionName}:`, error.message)
      throw error
    }
  }

  /**
   * List all indexes for a collection
   */
  static async listIndexes(collectionName: string): Promise<any[]> {
    const db = getDatabase()
    const collection = db.getCollection(collectionName)
    
    try {
      const indexes = await collection.listIndexes().toArray()
      return indexes
    } catch (error) {
      console.error(`Failed to list indexes for ${collectionName}:`, error)
      return []
    }
  }

  /**
   * Get collection statistics
   */
  static async getCollectionStats(collectionName: string): Promise<any> {
    const db = getDatabase()
    
    try {
      const stats = await db.db.command({ collStats: collectionName })
      return stats
    } catch (error) {
      console.error(`Failed to get stats for ${collectionName}:`, error)
      return null
    }
  }

  /**
   * Verify database setup
   */
  static async verifySetup(): Promise<{
    isValid: boolean
    issues: string[]
    stats: Record<string, any>
  }> {
    console.log('Verifying database setup...')
    
    const issues: string[] = []
    const stats: Record<string, any> = {}
    
    try {
      const db = getDatabase()
      
      // Check connection
      if (!db.isConnected) {
        issues.push('Database not connected')
        return { isValid: false, issues, stats }
      }

      // Check drugs collection
      const drugsCollection = db.getCollection(COLLECTIONS.DRUGS)
      
      // Verify indexes
      const indexes = await this.listIndexes(COLLECTIONS.DRUGS)
      const expectedIndexNames = DRUG_COLLECTION_INDEXES.map(idx => idx.name)
      const actualIndexNames = indexes.map(idx => idx.name)
      
      for (const expectedIndex of expectedIndexNames) {
        if (!actualIndexNames.includes(expectedIndex)) {
          issues.push(`Missing index: ${expectedIndex}`)
        }
      }

      // Get collection stats
      stats.drugs = await this.getCollectionStats(COLLECTIONS.DRUGS)
      stats.indexes = indexes
      
      // Check document count
      const documentCount = await drugsCollection.countDocuments()
      stats.documentCount = documentCount
      
      if (documentCount === 0) {
        issues.push('Drugs collection is empty - may need to run migration')
      }

      console.log(`Database verification completed. Found ${issues.length} issues.`)
      
      return {
        isValid: issues.length === 0,
        issues,
        stats
      }
      
    } catch (error) {
      console.error('Database verification failed:', error)
      issues.push(`Verification error: ${(error as Error).message}`)
      
      return { isValid: false, issues, stats }
    }
  }

  /**
   * Reset database (development only)
   */
  static async resetDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Database reset is not allowed in production')
    }

    console.log('Resetting database...')
    
    const db = getDatabase()
    
    try {
      // Drop drugs collection
      await db.db.collection(COLLECTIONS.DRUGS).drop()
      console.log('✓ Dropped drugs collection')
      
      // Recreate with setup
      await this.setupDrugsCollection()
      console.log('✓ Recreated drugs collection')
      
    } catch (error: any) {
      if (error.message.includes('ns not found')) {
        console.log('Collection already empty')
      } else {
        throw error
      }
    }
  }
}

/**
 * Convenience functions
 */

/**
 * Initialize database setup
 */
export const initializeDatabaseSetup = async (): Promise<void> => {
  await DatabaseSetup.initialize()
}

/**
 * Verify database is properly set up
 */
export const verifyDatabaseSetup = async () => {
  return await DatabaseSetup.verifySetup()
}

/**
 * Reset database for development
 */
export const resetDatabaseForDevelopment = async (): Promise<void> => {
  await DatabaseSetup.resetDatabase()
}