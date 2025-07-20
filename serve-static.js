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

console.log('📁 Serving static files from:', outDir);

// Serve static files from the 'out' directory
app.use(express.static(outDir, {
  fallthrough: true
}));

// Handle client-side routing with error handling - avoid wildcard routes
app.use((req, res, next) => {
  try {
    const indexPath = path.join(outDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Not Found');
    }
  } catch (error) {
    console.error('Route handling error:', error);
    res.status(500).send('Server Error');
  }
});

// Start server with error handling
const server = app.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
  console.log(`✅ Static server running on port ${port}`);
  console.log(`🌐 Access your app at: http://localhost:${port}`);
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${port} is already in use. Try a different port.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});