#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// Check if the build exists
const buildDir = path.join(__dirname, '.next');
if (!fs.existsSync(buildDir)) {
  console.error('❌ Error: Build not found. Run "npm run build" first.');
  process.exit(1);
}

console.log('🚀 Starting Next.js production server...');
console.log(`📁 Serving from: ${buildDir}`);
console.log(`📱 Local access: http://localhost:${PORT}`);
console.log(`🌐 Network access: http://0.0.0.0:${PORT}`);

// Set environment variables for Next.js
process.env.NODE_ENV = 'production';
process.env.PORT = PORT;
process.env.HOSTNAME = '0.0.0.0';

// Start Next.js production server
const nextServer = spawn('npx', ['next', 'start'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: PORT,
    HOSTNAME: '0.0.0.0'
  }
});

// Handle process termination gracefully
process.on('SIGTERM', () => {
  console.log('📦 Shutting down server...');
  nextServer.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('\n📦 Shutting down server...');
  nextServer.kill('SIGINT');
});

nextServer.on('close', (code) => {
  console.log(`📦 Server process exited with code ${code}`);
  process.exit(code);
});

nextServer.on('error', (error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});