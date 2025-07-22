#!/usr/bin/env node

/**
 * Debug script to test MongoDB search directly
 */

const { MongoClient } = require('mongodb');

async function debugSearch() {
  const client = new MongoClient(process.env.MONGODB_URL || 'mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB_NAME || 'drug_facts');
    const collection = db.collection('drugs');
    
    console.log('=== Debug Search for "arthritis" ===\n');
    
    // 1. Check total documents
    const totalDocs = await collection.countDocuments();
    console.log(`Total documents in database: ${totalDocs}`);
    
    // 2. Simple regex search in indicationsAndUsage
    console.log('\n--- Simple regex search in indicationsAndUsage ---');
    const simpleResults = await collection.find({
      indicationsAndUsage: { $regex: 'arthritis', $options: 'i' }
    }).limit(5).toArray();
    
    console.log(`Found ${simpleResults.length} drugs with "arthritis" in indicationsAndUsage`);
    simpleResults.forEach(drug => {
      console.log(`- ${drug.drugName} (${drug.slug})`);
      const excerpt = drug.indicationsAndUsage?.substring(0, 200) + '...';
      console.log(`  ${excerpt}\n`);
    });
    
    // 3. Check specific drug (Olumiant)
    console.log('\n--- Checking for Olumiant specifically ---');
    const olumiant = await collection.findOne({
      drugName: { $regex: 'olumiant', $options: 'i' }
    });
    
    if (olumiant) {
      console.log(`Found: ${olumiant.drugName}`);
      console.log(`Slug: ${olumiant.slug}`);
      console.log(`Indications excerpt: ${olumiant.indicationsAndUsage?.substring(0, 300)}...`);
      
      // Check if "arthritis" is in the indications
      const hasArthritis = olumiant.indicationsAndUsage?.toLowerCase().includes('arthritis');
      console.log(`\nContains "arthritis": ${hasArthritis}`);
    } else {
      console.log('Olumiant not found in database');
    }
    
    // 4. Test the aggregation pipeline
    console.log('\n--- Testing aggregation pipeline ---');
    const pipeline = [
      {
        $addFields: {
          searchScore: {
            $cond: [
              {
                $and: [
                  { $ne: ['$indicationsAndUsage', null] },
                  {
                    $regexMatch: {
                      input: { $toLower: { $ifNull: ['$indicationsAndUsage', ''] } },
                      regex: 'arthritis',
                      options: 'i'
                    }
                  }
                ]
              },
              1,
              0
            ]
          }
        }
      },
      { $match: { searchScore: { $gt: 0 } } },
      { $limit: 5 },
      { $project: { drugName: 1, slug: 1, searchScore: 1 } }
    ];
    
    const aggResults = await collection.aggregate(pipeline).toArray();
    console.log(`Aggregation found ${aggResults.length} results:`);
    aggResults.forEach(drug => {
      console.log(`- ${drug.drugName} (score: ${drug.searchScore})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

debugSearch();