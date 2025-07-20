import { DrugLabel } from '@/types/drug'

// Client-side search implementation
export async function searchDrugsClient(query: string): Promise<DrugLabel[]> {
  try {
    const response = await fetch('/data/drugs/index.json')
    const drugs: DrugLabel[] = await response.json()
    
    const normalizedQuery = query.toLowerCase().trim()
    if (!normalizedQuery) return drugs
    
    return drugs.filter(drug => 
      drug.drugName.toLowerCase().includes(normalizedQuery) ||
      drug.genericName?.toLowerCase().includes(normalizedQuery) ||
      drug.activeIngredient?.toLowerCase().includes(normalizedQuery) ||
      drug.therapeuticClass?.toLowerCase().includes(normalizedQuery)
    )
  } catch (error) {
    console.error('Error searching drugs:', error)
    return []
  }
}

export async function getAllDrugsClient(): Promise<DrugLabel[]> {
  try {
    const response = await fetch('/data/drugs/index.json')
    return await response.json()
  } catch (error) {
    console.error('Error fetching drugs:', error)
    return []
  }
}