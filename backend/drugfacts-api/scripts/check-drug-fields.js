#!/usr/bin/env node

/**
 * Check what fields are available in the drug documents
 */

const { MongoClient } = require('mongodb');

async function checkFields() {
  const client = new MongoClient(process.env.MONGODB_URL || 'mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB_NAME || 'drug_facts');
    const collection = db.collection('drugs');
    
    console.log('=== Checking Drug Document Structure ===\n');
    
    // Get a sample drug (Olumiant)
    const olumiant = await collection.findOne({
      drugName: { $regex: 'olumiant', $options: 'i' }
    });
    
    if (olumiant) {
      console.log(`Sample drug: ${olumiant.drugName}\n`);
      console.log('Available fields:');
      Object.keys(olumiant).forEach(key => {
        const value = olumiant[key];
        const preview = value ? 
          (typeof value === 'string' ? value.substring(0, 100) + '...' : typeof value) : 
          'null/undefined';
        console.log(`- ${key}: ${preview}`);
      });
      
      // Check for any field containing "indication"
      console.log('\n--- Fields containing "indication" ---');
      Object.keys(olumiant).forEach(key => {
        if (key.toLowerCase().includes('indication')) {
          console.log(`Found field: ${key}`);
          if (olumiant[key] && typeof olumiant[key] === 'string') {
            console.log(`Content preview: ${olumiant[key].substring(0, 200)}...`);
          }
        }
      });
      
      // Check for any field containing "arthritis"
      console.log('\n--- Fields containing "arthritis" text ---');
      Object.entries(olumiant).forEach(([key, value]) => {
        if (typeof value === 'string' && value.toLowerCase().includes('arthritis')) {
          console.log(`Found in field: ${key}`);
          const arthritisIndex = value.toLowerCase().indexOf('arthritis');
          const excerpt = value.substring(Math.max(0, arthritisIndex - 50), arthritisIndex + 100);
          console.log(`Excerpt: ...${excerpt}...`);
        }
      });
      
      // Check label object structure
      console.log('\n--- Label object structure ---');
      if (olumiant.label && typeof olumiant.label === 'object') {
        console.log('Label fields:');
        Object.keys(olumiant.label).forEach(key => {
          const value = olumiant.label[key];
          const preview = value ? 
            (typeof value === 'string' ? value.substring(0, 100) + '...' : typeof value) : 
            'null/undefined';
          console.log(`- label.${key}: ${preview}`);
        });
        
        // Check if indicationsAndUsage is in label
        if (olumiant.label.indicationsAndUsage) {
          console.log('\n--- Found indicationsAndUsage in label ---');
          console.log(`Preview: ${olumiant.label.indicationsAndUsage.substring(0, 300)}...`);
          const hasArthritis = olumiant.label.indicationsAndUsage.toLowerCase().includes('arthritis');
          console.log(`Contains "arthritis": ${hasArthritis}`);
        }
      }
    } else {
      console.log('Olumiant not found');
    }
    
    // Check all unique field names across all documents
    console.log('\n=== All unique field names in collection ===');
    const allDocs = await collection.find({}).limit(10).toArray();
    const allFields = new Set();
    allDocs.forEach(doc => {
      Object.keys(doc).forEach(key => allFields.add(key));
    });
    console.log(Array.from(allFields).sort().join(', '));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkFields();