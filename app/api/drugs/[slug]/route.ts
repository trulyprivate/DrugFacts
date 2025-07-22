/**
 * API Route: /api/drugs/[slug]
 * Handles individual drug lookup by slug
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDrugBySlug } from '@/lib/drugs'
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

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await ensureDbInitialized()
    
    const { slug } = params

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      )
    }

    const drug = await getDrugBySlug(slug)

    if (!drug) {
      return NextResponse.json(
        { error: 'Drug not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: drug })
    
  } catch (error) {
    console.error(`API Error in /api/drugs/${params.slug}:`, error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to retrieve drug'
      },
      { status: 500 }
    )
  }
}