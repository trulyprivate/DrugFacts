/**
 * Client-side Drug Service
 * Updated to work with MongoDB-backed API endpoints
 */

import { DrugLabel } from '@/types/drug'
import { PaginatedResult } from '@/types/mongodb'

/**
 * API response interface
 */
interface ApiResponse<T> {
  data: T
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * API error interface
 */
interface ApiError {
  error: string
  message?: string
}

/**
 * Base API request function with error handling
 */
async function apiRequest<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: 'Unknown error',
        message: `HTTP ${response.status}: ${response.statusText}`
      }))
      
      throw new Error(errorData.message || errorData.error)
    }

    return await response.json()
  } catch (error) {
    console.error(`API request failed for ${url}:`, error)
    throw error
  }
}

/**
 * Get all drugs from static JSON
 */
export async function getAllDrugsClient(
  page: number = 1,
  limit: number = 50
): Promise<DrugLabel[]> {
  try {
    const response = await fetch('/data/drugs/index.json')
    if (response.ok) {
      const drugs: DrugLabel[] = await response.json()
      
      // Apply client-side pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedDrugs = drugs.slice(startIndex, endIndex)
      
      console.log(`Retrieved ${paginatedDrugs.length} drugs from static JSON`)
      return paginatedDrugs
    }
  } catch (error) {
    console.error('Error fetching drugs from static JSON:', error)
  }
  
  return []
}

/**
 * Get paginated drugs from static JSON
 */
export async function getAllDrugsClientPaginated(
  page: number = 1,
  limit: number = 50
): Promise<PaginatedResult<DrugLabel>> {
  try {
    const response = await fetch('/data/drugs/index.json')
    if (response.ok) {
      const allDrugs: DrugLabel[] = await response.json()
      
      // Calculate pagination
      const total = allDrugs.length
      const totalPages = Math.ceil(total / limit)
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedDrugs = allDrugs.slice(startIndex, endIndex)
      
      return {
        data: paginatedDrugs,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    }
  } catch (error) {
    console.error('Error fetching paginated drugs:', error)
  }
  
  return {
    data: [],
    pagination: {
      page,
      limit,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    }
  }
}

/**
 * Search drugs using client-side filtering
 */
export async function searchDrugsClient(
  query: string,
  page: number = 1,
  limit: number = 50
): Promise<DrugLabel[]> {
  try {
    const response = await fetch('/data/drugs/index.json')
    if (response.ok) {
      const drugs: DrugLabel[] = await response.json()
      const normalizedQuery = query.toLowerCase().trim()
      
      if (!normalizedQuery) return drugs
      
      const filtered = drugs.filter(drug => 
        drug.drugName.toLowerCase().includes(normalizedQuery) ||
        drug.genericName?.toLowerCase().includes(normalizedQuery) ||
        drug.activeIngredient?.toLowerCase().includes(normalizedQuery) ||
        drug.therapeuticClass?.toLowerCase().includes(normalizedQuery)
      )
      
      console.log(`Search for "${query}" returned ${filtered.length} results`)
      return filtered
    }
  } catch (error) {
    console.error('Error searching drugs:', error)
  }
  
  return []
}

/**
 * Get drug by slug using static JSON file
 */
export async function getDrugBySlugClient(slug: string): Promise<DrugLabel | null> {
  try {
    if (!slug || slug.trim().length === 0) {
      return null
    }

    // Try to fetch the individual drug file
    const response = await fetch(`/data/drugs/${slug}.json`)
    if (response.ok) {
      const drug: DrugLabel = await response.json()
      console.log(`Retrieved drug ${slug} from static JSON file`)
      return drug
    }
  } catch (error) {
    console.error(`Error fetching drug by slug ${slug}:`, error)
  }
  
  return null
}

/**
 * Get drugs by therapeutic class using client-side filtering
 */
export async function getDrugsByTherapeuticClassClient(
  therapeuticClass: string,
  page: number = 1,
  limit: number = 50
): Promise<DrugLabel[]> {
  try {
    if (!therapeuticClass || therapeuticClass.trim().length === 0) {
      return []
    }

    const response = await fetch('/data/drugs/index.json')
    if (response.ok) {
      const allDrugs: DrugLabel[] = await response.json()
      const filtered = allDrugs.filter(drug => 
        drug.therapeuticClass?.toLowerCase() === therapeuticClass.toLowerCase()
      )
      console.log(`Found ${filtered.length} drugs for therapeutic class: ${therapeuticClass}`)
      return filtered
    }
  } catch (error) {
    console.error(`Error fetching drugs by therapeutic class ${therapeuticClass}:`, error)
  }
  
  return []
}

/**
 * Get drugs by manufacturer using client-side filtering
 */
export async function getDrugsByManufacturerClient(
  manufacturer: string,
  page: number = 1,
  limit: number = 50
): Promise<DrugLabel[]> {
  try {
    if (!manufacturer || manufacturer.trim().length === 0) {
      return []
    }

    const response = await fetch('/data/drugs/index.json')
    if (response.ok) {
      const allDrugs: DrugLabel[] = await response.json()
      const filtered = allDrugs.filter(drug => 
        drug.manufacturer?.toLowerCase() === manufacturer.toLowerCase() ||
        drug.labeler?.toLowerCase() === manufacturer.toLowerCase()
      )
      console.log(`Found ${filtered.length} drugs for manufacturer: ${manufacturer}`)
      return filtered
    }
  } catch (error) {
    console.error(`Error fetching drugs by manufacturer ${manufacturer}:`, error)
  }
  
  return []
}

/**
 * Check data availability
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch('/data/drugs/index.json')
    return response.ok
  } catch (error) {
    console.error('Data availability check failed:', error)
    return false
  }
}