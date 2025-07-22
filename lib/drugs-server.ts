/**
 * Server-side Drug Service
 * This runs on the server and can access server environment variables
 * Falls back to static JSON files if API is unavailable
 */

import { DrugLabel } from '@/types/drug'
import fs from 'fs/promises'
import path from 'path'

// Server-side API URL (not NEXT_PUBLIC)
const API_BASE_URL = process.env.API_URL || 'http://localhost:3001'

/**
 * Server-side API request function
 */
async function serverApiRequest<T>(url: string): Promise<T> {
  try {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
    
    const response = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache for 5 minutes in production
      next: { revalidate: process.env.NODE_ENV === 'production' ? 300 : 0 }
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    // Don't log in production to avoid noise
    if (process.env.NODE_ENV !== 'production') {
      console.error(`Server API request failed for ${url}:`, error)
    }
    throw error
  }
}

/**
 * Read drug data from static JSON file (server-side)
 */
async function readDrugFromFile(slug: string): Promise<DrugLabel | null> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'drugs', `${slug}.json`)
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // Try data directory as well
    try {
      const altPath = path.join(process.cwd(), 'data', 'drugs', `${slug}.json`)
      const data = await fs.readFile(altPath, 'utf-8')
      return JSON.parse(data)
    } catch {
      return null
    }
  }
}

/**
 * Read all drugs from index file (server-side)
 */
async function readAllDrugsFromFile(): Promise<DrugLabel[]> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'drugs', 'index.json')
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // Try data directory as well
    try {
      const altPath = path.join(process.cwd(), 'data', 'drugs', 'index.json')
      const data = await fs.readFile(altPath, 'utf-8')
      return JSON.parse(data)
    } catch {
      return []
    }
  }
}

/**
 * Get all drugs - server-side with fallback
 */
export async function getAllDrugsServer(): Promise<DrugLabel[]> {
  try {
    // Try API first with default pagination
    const response = await serverApiRequest<{ data: DrugLabel[] }>('/api/drugs?page=1&limit=50')
    return response.data
  } catch (error) {
    // Fallback to static files
    return await readAllDrugsFromFile()
  }
}

/**
 * Get drug by slug - server-side with fallback
 */
export async function getDrugBySlugServer(slug: string): Promise<DrugLabel | null> {
  if (!slug) return null
  
  try {
    // Try API first
    const response = await serverApiRequest<{ data: DrugLabel }>(`/api/drugs/${slug}`)
    return response.data
  } catch (error) {
    // Fallback to static file
    return await readDrugFromFile(slug)
  }
}

/**
 * Search drugs - server-side with fallback
 */
export async function searchDrugsServer(query: string): Promise<DrugLabel[]> {
  try {
    // Try API first
    const params = new URLSearchParams({ q: query, limit: '50' })
    const response = await serverApiRequest<{ data: DrugLabel[] }>(`/api/drugs?${params}`)
    return response.data
  } catch (error) {
    // Fallback to filtering static data
    const allDrugs = await readAllDrugsFromFile()
    const normalizedQuery = query.toLowerCase().trim()
    
    return allDrugs.filter(drug => 
      drug.drugName.toLowerCase().includes(normalizedQuery) ||
      drug.genericName?.toLowerCase().includes(normalizedQuery) ||
      drug.therapeuticClass?.toLowerCase().includes(normalizedQuery) ||
      drug.manufacturer?.toLowerCase().includes(normalizedQuery)
    )
  }
}

/**
 * Get drugs by therapeutic class - server-side with fallback
 */
export async function getDrugsByTherapeuticClassServer(therapeuticClass: string): Promise<DrugLabel[]> {
  try {
    // Try API first
    const params = new URLSearchParams({ therapeuticClass, limit: '50' })
    const response = await serverApiRequest<{ data: DrugLabel[] }>(`/api/drugs?${params}`)
    return response.data
  } catch (error) {
    // Fallback to filtering static data
    const allDrugs = await readAllDrugsFromFile()
    return allDrugs.filter(drug => 
      drug.therapeuticClass?.toLowerCase() === therapeuticClass.toLowerCase()
    )
  }
}

/**
 * Get drugs by manufacturer - server-side with fallback
 */
export async function getDrugsByManufacturerServer(manufacturer: string): Promise<DrugLabel[]> {
  try {
    // Try API first
    const params = new URLSearchParams({ manufacturer, limit: '50' })
    const response = await serverApiRequest<{ data: DrugLabel[] }>(`/api/drugs?${params}`)
    return response.data
  } catch (error) {
    // Fallback to filtering static data
    const allDrugs = await readAllDrugsFromFile()
    return allDrugs.filter(drug => 
      drug.manufacturer?.toLowerCase() === manufacturer.toLowerCase() ||
      drug.labeler?.toLowerCase() === manufacturer.toLowerCase()
    )
  }
}