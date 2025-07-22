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
 * Get API base URL from environment
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

/**
 * Base API request function with error handling
 */
async function apiRequest<T>(url: string): Promise<T> {
  try {
    // Use full URL for NestJS backend
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
    
    const response = await fetch(fullUrl, {
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
 * Get all drugs from MongoDB API
 */
export async function getAllDrugsClient(
  page: number = 1,
  limit: number = 50
): Promise<DrugLabel[]> {
  return await getAllDrugsFromAPI(page, limit)
}

/**
 * Get all drugs in index format (matching the old index.json structure)
 */
export async function getAllDrugsIndexFormat(): Promise<DrugLabel[]> {
  try {
    const response = await apiRequest<DrugLabel[]>(`/api/drugs/index`)
    console.log(`Retrieved ${response.length} drugs in index format from API`)
    return response
  } catch (error) {
    console.error('Error fetching drugs index from API:', error)
    
    // Fallback to static JSON
    console.log('Falling back to static JSON index')
    try {
      const response = await fetch('/data/drugs/index.json')
      if (response.ok) {
        return await response.json()
      }
    } catch (fallbackError) {
      console.error('Static JSON fallback also failed:', fallbackError)
    }
    
    return []
  }
}

/**
 * Internal function to get all drugs from API with fallback
 */
async function getAllDrugsFromAPI(
  page: number = 1,
  limit: number = 50
): Promise<DrugLabel[]> {
  try {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    const response = await apiRequest<ApiResponse<DrugLabel[]>>(`/api/drugs?${searchParams}`)
    
    console.log(`Retrieved ${response.data.length} drugs from MongoDB API`)
    return response.data
  } catch (error) {
    console.error('Error fetching drugs from API:', error)
    
    // Fallback to static JSON
    console.log('Falling back to static JSON')
    return await getAllDrugsFromStaticJSON(page, limit)
  }
}

/**
 * Fallback function to get drugs from static JSON
 */
async function getAllDrugsFromStaticJSON(
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
 * Get paginated drugs from MongoDB API with fallback
 */
export async function getAllDrugsClientPaginated(
  page: number = 1,
  limit: number = 50
): Promise<PaginatedResult<DrugLabel>> {
  try {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    const response = await apiRequest<ApiResponse<DrugLabel[]>>(`/api/drugs?${searchParams}`)
    
    if (response.pagination) {
      console.log(`Retrieved paginated drugs from MongoDB API (page ${page})`)
      return {
        data: response.data,
        pagination: response.pagination
      }
    } else {
      // If no pagination info, create it
      return {
        data: response.data,
        pagination: {
          page,
          limit,
          total: response.data.length,
          totalPages: Math.ceil(response.data.length / limit),
          hasNext: false,
          hasPrev: page > 1
        }
      }
    }
  } catch (error) {
    console.error('Error fetching paginated drugs from API:', error)
    
    // Fallback to static JSON
    console.log('Falling back to static JSON for paginated drugs')
    return await getAllDrugsClientPaginatedFallback(page, limit)
  }
}

/**
 * Fallback function to get paginated drugs from static JSON
 */
async function getAllDrugsClientPaginatedFallback(
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
    console.error('Error fetching paginated drugs from static JSON:', error)
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
 * Search drugs using MongoDB API
 */
export async function searchDrugsClient(
  query: string,
  page: number = 1,
  limit: number = 50
): Promise<DrugLabel[]> {
  try {
    if (!query || query.trim().length === 0) {
      // Return all drugs if no query provided
      return await getAllDrugsFromAPI(page, limit)
    }

    const searchParams = new URLSearchParams({
      q: query.trim(),
      page: page.toString(),
      limit: limit.toString()
    })

    const response = await apiRequest<ApiResponse<DrugLabel[]>>(`/api/drugs?${searchParams}`)
    
    console.log(`Search for "${query}" returned ${response.data.length} results`)
    return response.data
  } catch (error) {
    console.error('Error searching drugs via API:', error)
    
    // Fallback to static JSON if API fails
    console.log('Falling back to static JSON search')
    return await searchDrugsClientFallback(query, page, limit)
  }
}

/**
 * Fallback search using client-side filtering (for when API is unavailable)
 */
async function searchDrugsClientFallback(
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
      
      console.log(`Fallback search for "${query}" returned ${filtered.length} results`)
      return filtered
    }
  } catch (error) {
    console.error('Error in fallback search:', error)
  }
  
  return []
}

/**
 * Get drug by slug using MongoDB API with fallback
 */
export async function getDrugBySlugClient(slug: string): Promise<DrugLabel | null> {
  try {
    if (!slug || slug.trim().length === 0) {
      return null
    }

    // Try MongoDB API first - the response has a 'data' wrapper
    const response = await apiRequest<{ data: DrugLabel }>(`/api/drugs/${slug}`)
    console.log(`Retrieved drug ${slug} from MongoDB API`)
    return response.data
  } catch (error) {
    console.error(`Error fetching drug by slug ${slug} from API:`, error)
    
    // Fallback to static JSON file
    console.log(`Falling back to static JSON for drug ${slug}`)
    return await getDrugBySlugClientFallback(slug)
  }
}

/**
 * Fallback function to get drug by slug from static JSON
 */
async function getDrugBySlugClientFallback(slug: string): Promise<DrugLabel | null> {
  try {
    const response = await fetch(`/data/drugs/${slug}.json`)
    if (response.ok) {
      const drug: DrugLabel = await response.json()
      console.log(`Retrieved drug ${slug} from static JSON file`)
      return drug
    }
  } catch (error) {
    console.error(`Error fetching drug by slug ${slug} from static JSON:`, error)
  }
  
  return null
}

/**
 * Get drugs by therapeutic class using MongoDB API
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

    const searchParams = new URLSearchParams({
      therapeuticClass: therapeuticClass.trim(),
      page: page.toString(),
      limit: limit.toString()
    })

    const response = await apiRequest<ApiResponse<DrugLabel[]>>(`/api/drugs?${searchParams}`)
    
    console.log(`Found ${response.data.length} drugs for therapeutic class: ${therapeuticClass}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching drugs by therapeutic class ${therapeuticClass} from API:`, error)
    
    // Fallback to static JSON
    console.log(`Falling back to static JSON for therapeutic class: ${therapeuticClass}`)
    return await getDrugsByTherapeuticClassClientFallback(therapeuticClass, page, limit)
  }
}

/**
 * Fallback function to get drugs by therapeutic class from static JSON
 */
async function getDrugsByTherapeuticClassClientFallback(
  therapeuticClass: string,
  page: number = 1,
  limit: number = 50
): Promise<DrugLabel[]> {
  try {
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
 * Get drugs by manufacturer using MongoDB API
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

    const searchParams = new URLSearchParams({
      manufacturer: manufacturer.trim(),
      page: page.toString(),
      limit: limit.toString()
    })

    const response = await apiRequest<ApiResponse<DrugLabel[]>>(`/api/drugs?${searchParams}`)
    
    console.log(`Found ${response.data.length} drugs for manufacturer: ${manufacturer}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching drugs by manufacturer ${manufacturer} from API:`, error)
    
    // Fallback to static JSON
    console.log(`Falling back to static JSON for manufacturer: ${manufacturer}`)
    return await getDrugsByManufacturerClientFallback(manufacturer, page, limit)
  }
}

/**
 * Fallback function to get drugs by manufacturer from static JSON
 */
async function getDrugsByManufacturerClientFallback(
  manufacturer: string,
  page: number = 1,
  limit: number = 50
): Promise<DrugLabel[]> {
  try {
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
 * Advanced search options interface
 */
export interface AdvancedSearchOptions {
  query?: string
  therapeuticClass?: string
  manufacturer?: string
  fuzzy?: boolean
  caseSensitive?: boolean
  fields?: string[]
  page?: number
  limit?: number
  sort?: 'name' | 'therapeutic_class' | 'manufacturer' | 'relevance'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Advanced search function with multiple filters and options
 */
export async function advancedSearchDrugs(
  options: AdvancedSearchOptions
): Promise<PaginatedResult<DrugLabel>> {
  try {
    const searchParams = new URLSearchParams()
    
    // Add search parameters
    if (options.query) searchParams.set('q', options.query.trim())
    if (options.therapeuticClass) searchParams.set('therapeuticClass', options.therapeuticClass.trim())
    if (options.manufacturer) searchParams.set('manufacturer', options.manufacturer.trim())
    if (options.fuzzy !== undefined) searchParams.set('fuzzy', options.fuzzy.toString())
    if (options.caseSensitive !== undefined) searchParams.set('caseSensitive', options.caseSensitive.toString())
    if (options.fields) searchParams.set('fields', options.fields.join(','))
    if (options.sort) searchParams.set('sort', options.sort)
    if (options.sortOrder) searchParams.set('sortOrder', options.sortOrder)
    
    // Pagination
    const page = options.page || 1
    const limit = options.limit || 50
    searchParams.set('page', page.toString())
    searchParams.set('limit', limit.toString())

    const response = await apiRequest<ApiResponse<DrugLabel[]>>(`/api/drugs?${searchParams}`)
    
    if (response.pagination) {
      console.log(`Advanced search returned ${response.data.length} results`)
      return {
        data: response.data,
        pagination: response.pagination
      }
    } else {
      // Create pagination info if not provided
      return {
        data: response.data,
        pagination: {
          page,
          limit,
          total: response.data.length,
          totalPages: Math.ceil(response.data.length / limit),
          hasNext: false,
          hasPrev: page > 1
        }
      }
    }
  } catch (error) {
    console.error('Error in advanced search:', error)
    
    // Return empty result on error
    return {
      data: [],
      pagination: {
        page: options.page || 1,
        limit: options.limit || 50,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    }
  }
}

/**
 * Get search suggestions based on partial query
 */
export async function getSearchSuggestions(
  query: string,
  limit: number = 10
): Promise<string[]> {
  try {
    if (!query || query.trim().length < 2) {
      return []
    }

    // Use the search API with a small limit to get suggestions
    const searchParams = new URLSearchParams({
      q: query.trim(),
      limit: limit.toString(),
      fuzzy: 'true'
    })

    const response = await apiRequest<ApiResponse<DrugLabel[]>>(`/api/drugs?${searchParams}`)
    
    // Extract unique drug names as suggestions
    const suggestions = response.data
      .map(drug => drug.drugName)
      .filter((name, index, array) => array.indexOf(name) === index)
      .slice(0, limit)
    
    console.log(`Generated ${suggestions.length} search suggestions for "${query}"`)
    return suggestions
  } catch (error) {
    console.error('Error getting search suggestions:', error)
    return []
  }
}

/**
 * Get popular therapeutic classes
 */
export async function getPopularTherapeuticClasses(limit: number = 20): Promise<string[]> {
  try {
    // Get all drugs and extract therapeutic classes
    const response = await apiRequest<ApiResponse<DrugLabel[]>>('/api/drugs?limit=1000')
    
    // Count therapeutic classes
    const classCount: { [key: string]: number } = {}
    response.data.forEach(drug => {
      if (drug.therapeuticClass) {
        const normalizedClass = drug.therapeuticClass.trim()
        classCount[normalizedClass] = (classCount[normalizedClass] || 0) + 1
      }
    })
    
    // Sort by count and return top classes
    const sortedClasses = Object.entries(classCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([className]) => className)
    
    console.log(`Retrieved ${sortedClasses.length} popular therapeutic classes`)
    return sortedClasses
  } catch (error) {
    console.error('Error getting popular therapeutic classes:', error)
    return []
  }
}

/**
 * Get popular manufacturers
 */
export async function getPopularManufacturers(limit: number = 20): Promise<string[]> {
  try {
    // Get all drugs and extract manufacturers
    const response = await apiRequest<ApiResponse<DrugLabel[]>>('/api/drugs?limit=1000')
    
    // Count manufacturers
    const manufacturerCount: { [key: string]: number } = {}
    response.data.forEach(drug => {
      if (drug.manufacturer) {
        const normalizedManufacturer = drug.manufacturer.trim()
        manufacturerCount[normalizedManufacturer] = (manufacturerCount[normalizedManufacturer] || 0) + 1
      }
    })
    
    // Sort by count and return top manufacturers
    const sortedManufacturers = Object.entries(manufacturerCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([manufacturerName]) => manufacturerName)
    
    console.log(`Retrieved ${sortedManufacturers.length} popular manufacturers`)
    return sortedManufacturers
  } catch (error) {
    console.error('Error getting popular manufacturers:', error)
    return []
  }
}

/**
 * Check API and data availability
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    // First try MongoDB API with health endpoint
    const healthResponse = await fetch(`${API_BASE_URL}/health`)
    if (healthResponse.ok) {
      const health = await healthResponse.json()
      console.log('Backend API health:', health)
      
      // Also check drugs endpoint
      const apiResponse = await fetch(`${API_BASE_URL}/api/drugs?limit=1`)
      if (apiResponse.ok) {
        console.log('MongoDB API is healthy')
        return true
      }
    }
    
    // Fallback to static JSON check
    console.log('MongoDB API unavailable, checking static JSON fallback')
    const staticResponse = await fetch('/data/drugs/index.json')
    return staticResponse.ok
  } catch (error) {
    console.error('API health check failed:', error)
    return false
  }
}