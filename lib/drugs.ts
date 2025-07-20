import fs from 'fs/promises'
import path from 'path'
import { DrugLabel } from '@/types/drug'

const DRUGS_DIR = path.join(process.cwd(), 'data', 'drugs')

export async function getAllDrugs(): Promise<DrugLabel[]> {
  try {
    const indexPath = path.join(DRUGS_DIR, 'index.json')
    const data = await fs.readFile(indexPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading drugs index:', error)
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