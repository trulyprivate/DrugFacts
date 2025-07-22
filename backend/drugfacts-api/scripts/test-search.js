#!/usr/bin/env node

/**
 * Test script for the enhanced drug search functionality
 * Usage: node scripts/test-search.js
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api';

async function testSearch(query, params = {}) {
  const queryParams = new URLSearchParams({
    q: query,
    limit: 5,
    ...params
  });
  
  const url = `${API_BASE_URL}/drugs?${queryParams}`;
  console.log(`\nTesting: ${url}`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error:', data);
      return;
    }
    
    console.log(`Found ${data.pagination.total} results`);
    console.log('First 5 results:');
    data.data.forEach((drug, index) => {
      console.log(`${index + 1}. ${drug.drugName} (${drug.genericName || 'N/A'})`);
      console.log(`   Therapeutic Class: ${drug.therapeuticClass || 'N/A'}`);
      console.log(`   Manufacturer: ${drug.manufacturer || 'N/A'}`);
    });
    
    return data;
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

async function runTests() {
  console.log('=== DrugFacts Enhanced Search Tests ===\n');
  
  // Test 1: Weighted search for a specific drug
  console.log('Test 1: Weighted search for "aspirin"');
  await testSearch('aspirin', { searchType: 'weighted' });
  
  // Test 2: Search for a condition in indicationsAndUsage
  console.log('\nTest 2: Weighted search for condition "diabetes"');
  await testSearch('diabetes', { searchType: 'weighted' });
  
  // Test 3: Text search for faster results
  console.log('\nTest 3: Text search for "insulin"');
  await testSearch('insulin', { searchType: 'text' });
  
  // Test 4: Standard search across all fields
  console.log('\nTest 4: Standard search for "pain"');
  await testSearch('pain', { searchType: 'standard' });
  
  // Test 5: Search with filters
  console.log('\nTest 5: Search "medication" filtered by therapeutic class');
  await testSearch('medication', { 
    therapeuticClass: 'Antidiabetic',
    searchType: 'weighted'
  });
  
  // Test 6: Compare search types
  console.log('\n\n=== Search Type Comparison ===');
  const searchTerm = 'metformin';
  
  console.log(`\nComparing results for "${searchTerm}":`);
  
  const weightedStart = Date.now();
  const weightedResults = await testSearch(searchTerm, { searchType: 'weighted' });
  const weightedTime = Date.now() - weightedStart;
  
  const textStart = Date.now();
  const textResults = await testSearch(searchTerm, { searchType: 'text' });
  const textTime = Date.now() - textStart;
  
  const standardStart = Date.now();
  const standardResults = await testSearch(searchTerm, { searchType: 'standard' });
  const standardTime = Date.now() - standardStart;
  
  console.log('\n=== Performance Summary ===');
  console.log(`Weighted search: ${weightedTime}ms (${weightedResults?.pagination.total || 0} results)`);
  console.log(`Text search: ${textTime}ms (${textResults?.pagination.total || 0} results)`);
  console.log(`Standard search: ${standardTime}ms (${standardResults?.pagination.total || 0} results)`);
}

// Check if the API is running
async function checkAPI() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error('API is not healthy');
    }
    return true;
  } catch (error) {
    console.error('API is not running at', API_BASE_URL);
    console.error('Please start the API with: npm run start:dev');
    return false;
  }
}

// Main execution
(async () => {
  const apiRunning = await checkAPI();
  if (apiRunning) {
    await runTests();
  }
})();