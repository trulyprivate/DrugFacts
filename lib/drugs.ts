import fs from 'fs/promises'
import path from 'path'
import { DrugLabel } from '@/types/drug'

const DRUGS_DIR = path.join(process.cwd(), 'data', 'drugs')

export async function getAllDrugs(): Promise<DrugLabel[]> {
  try {
    const indexPath = path.join(DRUGS_DIR, 'index.json')
    const data = await fs.readFile(indexPath, 'utf-8')
    
    // Add debugging to see the data being parsed
    if (!data || data.trim().length === 0) {
      console.error('Empty data read from index.json')
      return []
    }
    
    // Check if data looks like valid JSON
    if (!data.trim().startsWith('[') && !data.trim().startsWith('{')) {
      console.error('Data does not appear to be valid JSON:', data.substring(0, 100))
      return []
    }
    
    const result = JSON.parse(data)
    console.log('Successfully parsed drugs data:', result.length, 'drugs')
    return result
  } catch (error) {
    console.error('Error reading drugs index:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    return []
  }
}

export async function getDrugBySlug(slug: string): Promise<DrugLabel | null> {
  try {
    const filePath = path.join(DRUGS_DIR, `${slug}.json`)
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading drug ${slug}:`, error)
    return null
  }
}

export async function searchDrugs(query: string): Promise<DrugLabel[]> {
  const drugs = await getAllDrugs()
  const normalizedQuery = query.toLowerCase().trim()
  
  if (!normalizedQuery) return drugs
  
  return drugs.filter(drug => 
    drug.drugName.toLowerCase().includes(normalizedQuery) ||
    drug.genericName?.toLowerCase().includes(normalizedQuery) ||
    drug.activeIngredient?.toLowerCase().includes(normalizedQuery) ||
    drug.therapeuticClass?.toLowerCase().includes(normalizedQuery)
  )
}

export async function getDrugsByTherapeuticClass(therapeuticClass: string): Promise<DrugLabel[]> {
  const drugs = await getAllDrugs()
  return drugs.filter(drug => 
    drug.therapeuticClass?.toLowerCase() === therapeuticClass.toLowerCase()
  )
}

export async function getDrugsByManufacturer(manufacturer: string): Promise<DrugLabel[]> {
  const drugs = await getAllDrugs()
  return drugs.filter(drug => 
    drug.manufacturer?.toLowerCase() === manufacturer.toLowerCase()
  )
}