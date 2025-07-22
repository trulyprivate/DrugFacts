#!/usr/bin/env node
/**
 * Test script for MongoDB search functionality
 */

const { searchDrugs } = require('./lib/drugs-mongodb.ts')

async function testSearch() {
  console.log('Testing MongoDB search functionality...')
  
  try {
    // Test basic search
    console.log('\n=== Testing Basic Search ===')
    const results = await searchDrugs('mounjaro')
    console.log(`Search for "mounjaro" returned ${results.length} results`)
    
    if (results.length > 0) {
      console.log('First result:', {
        drugName: results[0].drugName,
        genericName: results[0].genericName,
        therapeuticClass: results[0].therapeuticClass
      })
    }
    
    // Test fuzzy search
    console.log('\n=== Testing Fuzzy Search ===')
    const fuzzyResults = await searchDrugs('lipitor', { fuzzy: true })
    console.log(`Fuzzy search for "lipitor" returned ${fuzzyResults.length} results`)
    
    // Test search with options
    console.log('\n=== Testing Search with Options ===')
    const limitedResults = await searchDrugs('diabetes', { 
      limit: 5,
      fields: ['drugName', 'therapeuticClass', 'indicationsAndUsage']
    })
    console.log(`Limited search for "diabetes" returned ${limitedResults.length} results`)
    
  } catch (error) {
    console.error('Search test failed:', error)
  }
}

// Run the test
testSearch()