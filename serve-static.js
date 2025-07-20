#!/usr/bin/env node

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Serve static files from the 'out' directory
app.use(express.static(path.join(__dirname, 'out')));

// Handle client-side routing - serve index.html for any unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'out', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Static server running on port ${port}`);
  console.log(`Serving files from: ${path.join(__dirname, 'out')}`);
});