#!/usr/bin/env node

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Check if out directory exists
const outDir = path.join(__dirname, 'out');
if (!fs.existsSync(outDir)) {
  console.error('❌ Error: "out" directory not found. Run "npm run build" first.');
  process.exit(1);
}

console.log('🚀 Starting static server for DrugFacts Wiki...');
console.log(`📁 Serving from: ${outDir}`);

// Serve static files from the 'out' directory
app.use(express.static(outDir, {
  setHeaders: (res, path) => {
    // Cache static assets for better performance
    if (path.endsWith('.js') || path.endsWith('.css') || path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.ico')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }
}));

// Handle client-side routing - serve index.html for any unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(outDir, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Static server running on port ${port}`);
  console.log(`🌐 Access your app at: http://localhost:${port}`);
  console.log(`📊 Serving static files from Next.js export`);
});