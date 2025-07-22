/**
 * Drug Service - Main interface with automatic server/client detection
 * Uses server-side data fetching during SSR/SSG for better SEO
 * Falls back to client-side API calls with static JSON fallback
 */

import { DrugLabel } from '@/types/drug'

// Detect if we're running on the server
const isServer = typeof window === 'undefined'

// Lazy load the appropriate implementation
async function getImplementation() {
  if (isServer) {
    // Use server-side implementation for SSR/SSG
    const { 
      getAllDrugsServer,
      getDrugBySlugServer,
      searchDrugsServer,
      getDrugsByTherapeuticClassServer,
      getDrugsByManufacturerServer
    } = await import('./drugs-server')
    
    return {
      getAllDrugs: getAllDrugsServer,
      getDrugBySlug: getDrugBySlugServer,
      searchDrugs: searchDrugsServer,
      getDrugsByTherapeuticClass: getDrugsByTherapeuticClassServer,
      getDrugsByManufacturer: getDrugsByManufacturerServer
    }
  } else {
    // Use client-side implementation for browser
    const {
      getAllDrugsClient,
      getDrugBySlugClient,
      searchDrugsClient,
      getDrugsByTherapeuticClassClient,
      getDrugsByManufacturerClient
    } = await import('./drugs-client')
    
    return {
      getAllDrugs: getAllDrugsClient,
      getDrugBySlug: getDrugBySlugClient,
      searchDrugs: searchDrugsClient,
      getDrugsByTherapeuticClass: getDrugsByTherapeuticClassClient,
      getDrugsByManufacturer: getDrugsByManufacturerClient
    }
  }
}

/**
 * Get all drugs - automatically uses server or client implementation
 */
export async function getAllDrugs(): Promise<DrugLabel[]> {
  try {
    const impl = await getImplementation()
    return await impl.getAllDrugs()
  } catch (error) {
    console.error('Error in getAllDrugs:', error)
    return []
  }
}

/**
 * Get drug by slug - automatically uses server or client implementation
 */
export async function getDrugBySlug(slug: string): Promise<DrugLabel | null> {
  try {
    const impl = await getImplementation()
    return await impl.getDrugBySlug(slug)
  } catch (error) {
    console.error(`Error in getDrugBySlug for ${slug}:`, error)
    return null
  }
}

/**
 * Search drugs - automatically uses server or client implementation
 */
export async function searchDrugs(query: string): Promise<DrugLabel[]> {
  try {
    const impl = await getImplementation()
    return await impl.searchDrugs(query)
  } catch (error) {
    console.error(`Error in searchDrugs for query "${query}":`, error)
    return []
  }
}

/**
 * Get drugs by therapeutic class - automatically uses server or client implementation
 */
export async function getDrugsByTherapeuticClass(therapeuticClass: string): Promise<DrugLabel[]> {
  try {
    const impl = await getImplementation()
    return await impl.getDrugsByTherapeuticClass(therapeuticClass)
  } catch (error) {
    console.error(`Error in getDrugsByTherapeuticClass for "${therapeuticClass}":`, error)
    return []
  }
}

/**
 * Get drugs by manufacturer - automatically uses server or client implementation
 */
export async function getDrugsByManufacturer(manufacturer: string): Promise<DrugLabel[]> {
  try {
    const impl = await getImplementation()
    return await impl.getDrugsByManufacturer(manufacturer)
  } catch (error) {
    console.error(`Error in getDrugsByManufacturer for "${manufacturer}":`, error)
    return []
  }
}