/**
 * MongoDB-based Drug Service
 * Replaces JSON file operations with MongoDB queries while maintaining the same interface
 */

import { DrugLabel } from '@/types/drug'
import { DrugDocument, PaginatedResult, QueryOptions, SearchOptions } from '@/types/mongodb'
import { getDatabase, getDrugsCollection } from './database/connection'
import { DrugDocumentValidator } from './database/schema'
import { COLLECTIONS } from './config/mongodb'

/**
 * Get all drugs from MongoDB with optional pagination
 */
export async function getAllDrugs(options?: QueryOptions): Promise<DrugLabel[]> {
  try {
    const db = getDatabase()
    
    // Ensure connection
    if (!db.isConnected) {
      await db.connect()
    }

    const collection = getDrugsCollection()
    
    // Build query options
    const queryOptions: any = {}
    
    if (options?.limit) {
      queryOptions.limit = options.limit
    }
    
    if (options?.skip) {
      queryOptions.skip = options.skip
    }
    
    if (options?.sort) {
      queryOptions.sort = options.sort
    } else {
      // Default sort by drug name
      queryOptions.sort = { drugName: 1 }
    }

    // Projection to exclude MongoDB-specific fields from the result
    const projection = {
      _id: 0,
      _hash: 0,
      _created_at: 0,
      _updated_at: 0,
      _search_text: 0,
      _search_keywords: 0,
      _has_boxed_warning: 0,
      _has_generic_name: 0,
      _therapeutic_class_normalized: 0,
      _manufacturer_normalized: 0
    }

    if (options?.projection) {
      Object.assign(projection, options.projection)
    }

    queryOptions.projection = projection

    const cursor = collection.find({}, queryOptions)
    const drugs = await cursor.toArray()
    
    console.log(`Successfully retrieved ${drugs.length} drugs from MongoDB`)
    return drugs as unknown as DrugLabel[]
    
  } catch (error) {
    console.error('Error retrieving drugs from MongoDB:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    
    // Return empty array on error to maintain compatibility
    return []
  }
}

/**
 * Get drug by slug from MongoDB
 */
export async function getDrugBySlug(slug: string): Promise<DrugLabel | null> {
  try {
    if (!slug || typeof slug !== 'string') {
      console.error('Invalid slug provided:', slug)
      return null
    }

    const db = getDatabase()
    
    if (!db.isConnected) {
      await db.connect()
    }

    const collection = getDrugsCollection()
    
    // Projection to exclude MongoDB-specific fields
    const projection = {
      _id: 0,
      _hash: 0,
      _created_at: 0,
      _updated_at: 0,
      _search_text: 0,
      _search_keywords: 0,
      _has_boxed_warning: 0,
      _has_generic_name: 0,
      _therapeutic_class_normalized: 0,
      _manufacturer_normalized: 0
    }

    const drug = await collection.findOne(
      { slug: slug.toLowerCase().trim() },
      { projection }
    )
    
    if (drug) {
      console.log(`Successfully retrieved drug with slug: ${slug}`)
      return drug as unknown as DrugLabel
    } else {
      console.log(`Drug not found with slug: ${slug}`)
      return null
    }
    
  } catch (error) {
    console.error(`Error retrieving drug with slug ${slug}:`, error)
    return null
  }
}

/**
 * Search drugs using MongoDB text search and filtering
 */
export async function searchDrugs(
  query: string, 
  options?: SearchOptions
): Promise<DrugLabel[]> {
  try {
    if (!query || typeof query !== 'string') {
      // Return all drugs if no query provided
      return await getAllDrugs(options)
    }

    const db = getDatabase()
    
    if (!db.isConnected) {
      await db.connect()
    }

    const collection = getDrugsCollection()
    const normalizedQuery = query.toLowerCase().trim()
    
    // Build search filter
    let searchFilter: any = {}
    
    if (options?.fuzzy) {
      // Use text search for fuzzy matching
      searchFilter = {
        $text: { 
          $search: normalizedQuery,
          $caseSensitive: options.caseSensitive || false
        }
      }
    } else {
      // Use regex search for exact matching across multiple fields
      const searchRegex = new RegExp(normalizedQuery, options?.caseSensitive ? 'g' : 'gi')
      
      const searchFields = options?.fields || [
        'drugName',
        'genericName', 
        'activeIngredient',
        'therapeuticClass',
        'manufacturer',
        'labeler'
      ]
      
      searchFilter = {
        $or: searchFields.map(field => ({
          [field]: { $regex: searchRegex }
        }))
      }
    }

    // Build query options
    const queryOptions: any = {
      projection: {
        _id: 0,
        _hash: 0,
        _created_at: 0,
        _updated_at: 0,
        _search_text: 0,
        _search_keywords: 0,
        _has_boxed_warning: 0,
        _has_generic_name: 0,
        _therapeutic_class_normalized: 0,
        _manufacturer_normalized: 0
      }
    }
    
    if (options?.limit) {
      queryOptions.limit = options.limit
    }
    
    if (options?.skip) {
      queryOptions.skip = options.skip
    }
    
    if (options?.sort) {
      queryOptions.sort = options.sort
    } else if (options?.fuzzy) {
      // Sort by text search score for fuzzy search
      queryOptions.sort = { score: { $meta: 'textScore' } }
      queryOptions.projection.score = { $meta: 'textScore' }
    } else {
      // Default sort by drug name
      queryOptions.sort = { drugName: 1 }
    }

    const cursor = collection.find(searchFilter, queryOptions)
    const drugs = await cursor.toArray()
    
    console.log(`Search for "${query}" returned ${drugs.length} results`)
    
    // Remove score field from results if it was added
    return drugs.map(drug => {
      const { score, ...drugWithoutScore } = drug as any
      return drugWithoutScore as DrugLabel
    })
    
  } catch (error) {
    console.error(`Error searching drugs with query "${query}":`, error)
    return []
  }
}

/**
 * Get drugs by therapeutic class
 */
export async function getDrugsByTherapeuticClass(
  therapeuticClass: string,
  options?: QueryOptions
): Promise<DrugLabel[]> {
  try {
    if (!therapeuticClass || typeof therapeuticClass !== 'string') {
      console.error('Invalid therapeutic class provided:', therapeuticClass)
      return []
    }

    const db = getDatabase()
    
    if (!db.isConnected) {
      await db.connect()
    }

    const collection = getDrugsCollection()
    
    // Use case-insensitive regex for matching
    const classRegex = new RegExp(`^${therapeuticClass.trim()}$`, 'i')
    
    const filter = {
      $or: [
        { therapeuticClass: { $regex: classRegex } },
        { _therapeutic_class_normalized: therapeuticClass.toLowerCase().trim() }
      ]
    }

    const queryOptions: any = {
      projection: {
        _id: 0,
        _hash: 0,
        _created_at: 0,
        _updated_at: 0,
        _search_text: 0,
        _search_keywords: 0,
        _has_boxed_warning: 0,
        _has_generic_name: 0,
        _therapeutic_class_normalized: 0,
        _manufacturer_normalized: 0
      },
      sort: options?.sort || { drugName: 1 }
    }
    
    if (options?.limit) {
      queryOptions.limit = options.limit
    }
    
    if (options?.skip) {
      queryOptions.skip = options.skip
    }

    const cursor = collection.find(filter, queryOptions)
    const drugs = await cursor.toArray()
    
    console.log(`Found ${drugs.length} drugs for therapeutic class: ${therapeuticClass}`)
    return drugs as unknown as DrugLabel[]
    
  } catch (error) {
    console.error(`Error retrieving drugs by therapeutic class "${therapeuticClass}":`, error)
    return []
  }
}

/**
 * Get drugs by manufacturer
 */
export async function getDrugsByManufacturer(
  manufacturer: string,
  options?: QueryOptions
): Promise<DrugLabel[]> {
  try {
    if (!manufacturer || typeof manufacturer !== 'string') {
      console.error('Invalid manufacturer provided:', manufacturer)
      return []
    }

    const db = getDatabase()
    
    if (!db.isConnected) {
      await db.connect()
    }

    const collection = getDrugsCollection()
    
    // Use case-insensitive regex for matching
    const manufacturerRegex = new RegExp(`^${manufacturer.trim()}$`, 'i')
    
    const filter = {
      $or: [
        { manufacturer: { $regex: manufacturerRegex } },
        { labeler: { $regex: manufacturerRegex } },
        { _manufacturer_normalized: manufacturer.toLowerCase().trim() }
      ]
    }

    const queryOptions: any = {
      projection: {
        _id: 0,
        _hash: 0,
        _created_at: 0,
        _updated_at: 0,
        _search_text: 0,
        _search_keywords: 0,
        _has_boxed_warning: 0,
        _has_generic_name: 0,
        _therapeutic_class_normalized: 0,
        _manufacturer_normalized: 0
      },
      sort: options?.sort || { drugName: 1 }
    }
    
    if (options?.limit) {
      queryOptions.limit = options.limit
    }
    
    if (options?.skip) {
      queryOptions.skip = options.skip
    }

    const cursor = collection.find(filter, queryOptions)
    const drugs = await cursor.toArray()
    
    console.log(`Found ${drugs.length} drugs for manufacturer: ${manufacturer}`)
    return drugs as unknown as DrugLabel[]
    
  } catch (error) {
    console.error(`Error retrieving drugs by manufacturer "${manufacturer}":`, error)
    return []
  }
}