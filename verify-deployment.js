#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying Next.js Static Export Deployment...\n');

// Check if out directory exists
const outDir = path.join(__dirname, 'out');
if (!fs.existsSync(outDir)) {
  console.error('❌ Error: /out directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Check essential files
const essentialFiles = [
  'index.html',
  'robots.txt',
  'sitemap.xml',
  '_next/static',
  'drugs'
];

let allFilesExist = true;
console.log('📁 Checking essential files:');

essentialFiles.forEach(file => {
  const filePath = path.join(outDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check drug pages
console.log('\n💊 Checking drug pages:');
const drugsDir = path.join(outDir, 'drugs');
if (fs.existsSync(drugsDir)) {
  const drugPages = fs.readdirSync(drugsDir);
  if (drugPages.length > 0) {
    console.log(`✅ Found ${drugPages.length} drug page(s): ${drugPages.join(', ')}`);
  } else {
    console.log('⚠️  No drug pages found');
  }
} else {
  console.log('❌ Drugs directory not found');
  allFilesExist = false;
}

// Check for proper static structure
console.log('\n🔧 Checking static structure:');
const nextStatic = path.join(outDir, '_next', 'static');
if (fs.existsSync(nextStatic)) {
  console.log('✅ Next.js static assets present');
} else {
  console.log('❌ Next.js static assets missing');
  allFilesExist = false;
}

// Final result
console.log('\n' + '='.repeat(50));
if (allFilesExist) {
  console.log('🎉 SUCCESS: Static export is ready for deployment!');
  console.log('\n📋 Deployment options:');
  console.log('1. Static hosting (Vercel, Netlify, GitHub Pages)');
  console.log('2. Custom server: node serve-static.js');
  console.log('3. Simple server: npx serve out');
  console.log('\n📄 See DEPLOYMENT_CONFIG.md for detailed instructions.');
} else {
  console.log('❌ FAILED: Some required files are missing.');
  console.log('Run "npm run build" to generate the static export.');
}

console.log('='.repeat(50));