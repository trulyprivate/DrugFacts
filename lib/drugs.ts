/**
 * Drug Service - MongoDB Implementation
 * Main drug service interface using MongoDB backend
 */

import { DrugLabel } from '@/types/drug'
import {
  getAllDrugs as getAllDrugsMongo,
  getDrugBySlug as getDrugBySlugMongo,
  searchDrugs as searchDrugsMongo,
  getDrugsByTherapeuticClass as getDrugsByTherapeuticClassMongo,
  getDrugsByManufacturer as getDrugsByManufacturerMongo
} from './drugs-mongodb'

/**
 * Get all drugs from MongoDB
 */
export async function getAllDrugs(): Promise<DrugLabel[]> {
  return await getAllDrugsMongo()
}

/**
 * Get drug by slug from MongoDB
 */
export async function getDrugBySlug(slug: string): Promise<DrugLabel | null> {
  return await getDrugBySlugMongo(slug)
}

/**
 * Search drugs using MongoDB
 */
export async function searchDrugs(query: string): Promise<DrugLabel[]> {
  return await searchDrugsMongo(query)
}

/**
 * Get drugs by therapeutic class from MongoDB
 */
export async function getDrugsByTherapeuticClass(therapeuticClass: string): Promise<DrugLabel[]> {
  return await getDrugsByTherapeuticClassMongo(therapeuticClass)
}

/**
 * Get drugs by manufacturer from MongoDB
 */
export async function getDrugsByManufacturer(manufacturer: string): Promise<DrugLabel[]> {
  return await getDrugsByManufacturerMongo(manufacturer)
}