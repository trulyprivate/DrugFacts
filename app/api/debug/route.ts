/**
 * Debug API Route
 * Test data retrieval and environment setup
 */

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Debug: Starting test...')
    
    // Test environment variables
    const env = {
      USE_MONGODB: process.env.USE_MONGODB,
      MONGODB_URL: process.env.MONGODB_URL,
      MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
      NODE_ENV: process.env.NODE_ENV
    }
    
    console.log('🌍 Environment:', env)
    
    // Test basic import
    const { getAllDrugs } = await import('@/lib/drugs')
    console.log('✅ Import successful')
    
    // Test function call
    const drugs = await getAllDrugs()
    console.log(`📊 getAllDrugs returned: ${drugs.length} drugs`)
    
    // Test individual drug data
    const sampleDrug = drugs[0]
    console.log('💊 Sample drug:', sampleDrug?.drugName)
    
    return NextResponse.json({
      success: true,
      message: `Successfully loaded ${drugs.length} drugs using ${env.USE_MONGODB === 'false' ? 'JSON files' : 'MongoDB'}`,
      count: drugs.length,
      sampleDrugs: drugs.slice(0, 3).map(drug => ({
        drugName: drug.drugName,
        slug: drug.slug,
        therapeuticClass: drug.therapeuticClass
      })),
      environment: env,
      dataSource: env.USE_MONGODB === 'false' ? 'JSON Files' : 'MongoDB'
    })
  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined,
      environment: {
        USE_MONGODB: process.env.USE_MONGODB,
        MONGODB_URL: process.env.MONGODB_URL,
        MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
        NODE_ENV: process.env.NODE_ENV
      }
    }, { status: 500 })
  }
}