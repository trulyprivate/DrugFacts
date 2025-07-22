const fs = require('fs');
const path = require('path');

// Read the Labels.json file which contains all drug data
const labelsPath = path.join(__dirname, '..', 'data', 'drugs', 'Labels.json');
const publicDrugsDir = path.join(__dirname, '..', 'public', 'data', 'drugs');

// Ensure public/data/drugs directory exists
if (!fs.existsSync(publicDrugsDir)) {
  fs.mkdirSync(publicDrugsDir, { recursive: true });
}

try {
  // Read and parse Labels.json
  const labelsData = fs.readFileSync(labelsPath, 'utf8');
  const drugs = JSON.parse(labelsData);

  console.log(`Found ${drugs.length} drugs to process`);

  // Generate individual JSON files for each drug
  drugs.forEach((drug, index) => {
    if (drug.slug) {
      const drugFilePath = path.join(publicDrugsDir, `${drug.slug}.json`);
      fs.writeFileSync(drugFilePath, JSON.stringify(drug, null, 2));
      console.log(`Generated file ${index + 1}/${drugs.length}: ${drug.slug}.json`);
    }
  });

  // Also copy the index.json
  const indexSourcePath = path.join(__dirname, '..', 'data', 'drugs', 'index.json');
  const indexDestPath = path.join(publicDrugsDir, 'index.json');
  fs.copyFileSync(indexSourcePath, indexDestPath);
  console.log('Copied index.json');

  console.log('✅ Successfully generated all drug files!');
} catch (error) {
  console.error('Error generating drug files:', error);
  process.exit(1);
}