#!/usr/bin/env node

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5005;

// Check if out directory exists
const outDir = path.join(__dirname, 'out');
if (!fs.existsSync(outDir)) {
  console.error('❌ Error: "out" directory not found. Run "npm run build" first.');
  process.exit(1);
}

console.log('🚀 Starting static server for DrugFacts Wiki...');
console.log(`📁 Serving from: ${outDir}`);

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Internal Server Error');
});

// Serve static files from the 'out' directory with enhanced error handling
app.use(express.static(outDir, {
  setHeaders: (res, filePath) => {
    try {
      // Cache static assets for better performance
      if (filePath.endsWith('.js') || filePath.endsWith('.css') || filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.ico')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
    } catch (error) {
      console.warn('Header setting error:', error.message);
    }
  },
  fallthrough: true
}));

// Handle client-side routing with error handling
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
  console.log(`📊 Serving static files from Next.js export`);
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

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});