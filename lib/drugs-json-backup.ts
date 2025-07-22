import { DrugLabel } from '@/types/drug'

export async function getAllDrugs(): Promise<DrugLabel[]> {
  try {
    // Import MongoDB implementation
    const { getAllDrugs: getFromMongoDB } = await import('./drugs-mongodb')
    return await getFromMongoDB()
  } catch (error) {
    console.error('Error retrieving drugs from MongoDB:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    return []
  }
}

export async function getDrugBySlug(slug: string): Promise<DrugLabel | null> {
  // Import MongoDB implementation
  const { getDrugBySlug: getFromMongoDB } = await import('./drugs-mongodb')
  return getFromMongoDB(slug)
}

export async function searchDrugs(query: string): Promise<DrugLabel[]> {
  try {
    // Import MongoDB implementation
    const { searchDrugs: searchFromMongoDB } = await import('./drugs-mongodb')
    return await searchFromMongoDB(query)
  } catch (error) {
    console.error('Error searching drugs in MongoDB:', error)
    return []
  }
}

export async function getDrugsByTherapeuticClass(therapeuticClass: string): Promise<DrugLabel[]> {
  try {
    // Import MongoDB implementation
    const { getDrugsByTherapeuticClass: getFromMongoDB } = await import('./drugs-mongodb')
    return await getFromMongoDB(therapeuticClass)
  } catch (error) {
    console.error('Error retrieving drugs by therapeutic class from MongoDB:', error)
    return []
  }
}

export async function getDrugsByManufacturer(manufacturer: string): Promise<DrugLabel[]> {
  try {
    // Import MongoDB implementation
    const { getDrugsByManufacturer: getFromMongoDB } = await import('./drugs-mongodb')
    return await getFromMongoDB(manufacturer)
  } catch (error) {
    console.error('Error retrieving drugs by manufacturer from MongoDB:', error)
    return []
  }
}