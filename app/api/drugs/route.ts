/**
 * API Route: /api/drugs
 * Handles drug-related API requests
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAllDrugs, searchDrugs, getDrugsByTherapeuticClass, getDrugsByManufacturer } from '@/lib/drugs'
import { initializeDatabase } from '@/lib/database/connection'
import { initializeDatabaseSetup } from '@/lib/database/setup'

// Initialize database connection on module load
let dbInitialized = false

async function ensureDbInitialized() {
  if (!dbInitialized) {
    try {
      await initializeDatabase()
      await initializeDatabaseSetup()
      dbInitialized = true
    } catch (error) {
      console.error('Failed to initialize database:', error)
      // Continue without throwing - fallback to JSON will handle this
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureDbInitialized()
    
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const therapeuticClass = searchParams.get('therapeuticClass')
    const manufacturer = searchParams.get('manufacturer')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    let drugs = []

    if (query) {
      // Search drugs
      drugs = await searchDrugs(query)
    } else if (therapeuticClass) {
      // Filter by therapeutic class
      drugs = await getDrugsByTherapeuticClass(therapeuticClass)
    } else if (manufacturer) {
      // Filter by manufacturer
      drugs = await getDrugsByManufacturer(manufacturer)
    } else {
      // Get all drugs
      drugs = await getAllDrugs()
    }

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedDrugs = drugs.slice(startIndex, endIndex)

    const response = {
      data: paginatedDrugs,
      pagination: {
        page,
        limit,
        total: drugs.length,
        totalPages: Math.ceil(drugs.length / limit),
        hasNext: endIndex < drugs.length,
        hasPrev: page > 1
      }
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error('API Error in /api/drugs:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to retrieve drugs'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}