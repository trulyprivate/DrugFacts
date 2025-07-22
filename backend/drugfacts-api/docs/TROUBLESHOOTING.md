# DrugFacts API Troubleshooting Guide

This guide helps diagnose and resolve common issues with the DrugFacts API.

## Table of Contents

1. [Startup Issues](#startup-issues)
2. [Database Connection Problems](#database-connection-problems)
3. [Performance Issues](#performance-issues)
4. [API Errors](#api-errors)
5. [Caching Problems](#caching-problems)
6. [Security Issues](#security-issues)
7. [Development Issues](#development-issues)
8. [Deployment Issues](#deployment-issues)
9. [Debugging Tools](#debugging-tools)
10. [Getting Help](#getting-help)

## Startup Issues

### Application Won't Start

#### Symptom
```
Error: Cannot find module '@nestjs/core'
```

#### Solution
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Symptom
```
Error: listen EADDRINUSE: address already in use :::3001
```

#### Solution
```bash
# Find and kill the process using the port
lsof -ti:3001 | xargs kill -9

# Or change the port in .env
PORT=3002
```

#### Symptom
```
SyntaxError: Cannot use import statement outside a module
```

#### Solution
Ensure you're running the built version:
```bash
npm run build
npm run start:prod
```

### TypeScript Compilation Errors

#### Symptom
```
error TS2307: Cannot find module 'X' or its corresponding type declarations
```

#### Solution
```bash
# Install missing types
npm install --save-dev @types/X

# Or if the module doesn't have types
echo "declare module 'X';" > src/types/X.d.ts
```

## Database Connection Problems

### MongoDB Connection Failed

#### Symptom
```
MongoServerError: Authentication failed
```

#### Solution
1. Check connection string format:
```
mongodb://username:password@host:port/database?authSource=admin
```

2. Verify credentials:
```bash
mongosh "mongodb://localhost:27017" -u username -p password --authenticationDatabase admin
```

3. Check network connectivity:
```bash
nc -zv mongodb-host 27017
```

#### Symptom
```
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

#### Solution
1. Ensure MongoDB is running:
```bash
# Check status
systemctl status mongod

# Start MongoDB
systemctl start mongod

# Or with Docker
docker run -d -p 27017:27017 mongo:latest
```

2. Check firewall rules:
```bash
sudo ufw allow 27017
```

### Connection Pool Exhausted

#### Symptom
```
MongoError: connection pool exhausted
```

#### Solution
1. Increase pool size in configuration:
```javascript
MongooseModule.forRootAsync({
  useFactory: async () => ({
    uri: 'mongodb://...',
    maxPoolSize: 100, // Increase from default 10
    minPoolSize: 10,
  }),
})
```

2. Check for connection leaks:
```bash
# Monitor connections
mongostat --host localhost:27017
```

## Performance Issues

### Slow API Response Times

#### Symptom
Response times > 1 second for simple queries

#### Solution
1. Check database indexes:
```javascript
// In MongoDB shell
db.drugs.getIndexes()

// Add missing indexes
db.drugs.createIndex({ slug: 1 })
db.drugs.createIndex({ drugName: "text", genericName: "text" })
```

2. Enable query profiling:
```javascript
// MongoDB shell
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().limit(5).sort({ ts: -1 }).pretty()
```

3. Check cache hit rates:
```bash
# Add logging to cache service
console.log('Cache hit rate:', this.cacheHits / this.totalRequests);
```

### High Memory Usage

#### Symptom
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

#### Solution
1. Increase Node.js memory limit:
```bash
node --max-old-space-size=4096 dist/main.js
```

2. Fix memory leaks:
```javascript
// Use weak references for caches
const cache = new WeakMap();

// Clear large objects
largeObject = null;
```

3. Monitor memory usage:
```javascript
setInterval(() => {
  const usage = process.memoryUsage();
  console.log('Memory usage:', {
    rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
  });
}, 60000);
```

### CPU Spikes

#### Symptom
High CPU usage during normal operation

#### Solution
1. Profile CPU usage:
```bash
# Using clinic.js
npm install -g clinic
clinic doctor -- node dist/main.js
```

2. Optimize regex operations:
```javascript
// Bad - compiled on each request
query.$or = [
  { drugName: { $regex: q, $options: 'i' } }
];

// Good - pre-compile regex
const regex = new RegExp(q, 'i');
query.$or = [
  { drugName: regex }
];
```

## API Errors

### 400 Bad Request

#### Common Causes
1. Invalid query parameters
2. Missing required fields
3. Type mismatches

#### Debug Steps
```bash
# Enable validation error details
app.useGlobalPipes(new ValidationPipe({
  disableErrorMessages: false,
  enableDebugMessages: true,
}));
```

### 404 Not Found

#### Check routing:
```bash
# List all routes
npm run start:dev | grep "Mapped"
```

#### Verify slug format:
```javascript
// Ensure slug matches pattern
/^[a-z0-9-]+$/
```

### 429 Too Many Requests

#### Solution
1. Check rate limit configuration:
```javascript
// Increase limits for development
RATE_LIMIT_WINDOW_MS=60000  // 1 minute
RATE_LIMIT_MAX_REQUESTS=1000
```

2. Implement retry logic:
```javascript
async function retryRequest(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
}
```

### 500 Internal Server Error

#### Debug Steps
1. Check logs:
```bash
# Application logs
tail -f logs/error.log

# PM2 logs
pm2 logs drugfacts-api --err

# Docker logs
docker logs drugfacts-api -f
```

2. Enable detailed error logging:
```javascript
// In main.ts
app.useLogger(['error', 'warn', 'log', 'debug', 'verbose']);
```

## Caching Problems

### Cache Not Working

#### Symptom
Same requests hitting database every time

#### Solution
1. Verify Redis connection:
```bash
redis-cli ping
# Should return PONG
```

2. Check cache keys:
```bash
redis-cli
> KEYS drug:*
> GET drug:aspirin-325mg
```

3. Debug cache operations:
```javascript
// Add logging to cache service
async set(key: string, value: any, ttl?: number) {
  console.log(`Setting cache key: ${key}, TTL: ${ttl}`);
  // ... rest of implementation
}
```

### Cache Invalidation Issues

#### Solution
1. Implement cache versioning:
```javascript
const CACHE_VERSION = 'v1';
const cacheKey = `${CACHE_VERSION}:${key}`;
```

2. Clear specific patterns:
```bash
# Clear all drug caches
redis-cli --scan --pattern "drug:*" | xargs redis-cli DEL
```

## Security Issues

### CORS Errors

#### Symptom
```
Access to XMLHttpRequest blocked by CORS policy
```

#### Solution
1. Check CORS configuration:
```javascript
app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});
```

2. Verify headers:
```bash
curl -I -X OPTIONS http://localhost:3001/api/drugs \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET"
```

### CSP Violations

#### Symptom
```
Refused to execute inline script because it violates Content Security Policy
```

#### Solution
Adjust CSP headers in Helmet configuration:
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Only for development
    },
  },
}));
```

## Development Issues

### Hot Reload Not Working

#### Solution
1. Check file watchers:
```bash
# Increase watchers limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

2. Use polling in Docker:
```json
// nest-cli.json
{
  "watchOptions": {
    "usePolling": true,
    "interval": 1000
  }
}
```

### TypeScript IntelliSense Issues

#### Solution
1. Restart TypeScript server in VS Code:
```
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

2. Clear TypeScript cache:
```bash
rm -rf node_modules/.cache/
```

## Deployment Issues

### Docker Build Fails

#### Symptom
```
npm ERR! code EACCES
```

#### Solution
Use proper user permissions:
```dockerfile
# Create app directory with correct permissions
RUN mkdir -p /app && chown -R node:node /app
USER node
```

### Environment Variables Not Loading

#### Solution
1. Check .env file location:
```javascript
ConfigModule.forRoot({
  envFilePath: ['.env', '.env.local', '.env.production'],
})
```

2. Debug environment:
```javascript
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGODB_URL: process.env.MONGODB_URL?.replace(/\/\/.*@/, '//***@'),
});
```

## Debugging Tools

### 1. Debug Mode

```bash
# Start with debugger
npm run start:debug

# Attach Chrome DevTools
chrome://inspect
```

### 2. Performance Profiling

```bash
# CPU profiling
node --cpu-prof dist/main.js

# Memory profiling
node --heap-prof dist/main.js
```

### 3. Request Logging

```javascript
// Add request ID for tracing
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  console.log(`[${req.id}] ${req.method} ${req.url}`);
  next();
});
```

### 4. Database Query Logging

```javascript
// Enable Mongoose debug mode
mongoose.set('debug', true);

// Or custom logging
mongoose.set('debug', (collectionName, method, query) => {
  console.log(`${collectionName}.${method}`, JSON.stringify(query));
});
```

### 5. Memory Leak Detection

```bash
# Using heapdump
npm install heapdump

# In your code
const heapdump = require('heapdump');
// Generate heap snapshot
heapdump.writeSnapshot('./heap-' + Date.now() + '.heapsnapshot');
```

## Common Error Patterns

### 1. Unhandled Promise Rejection

```javascript
// Bad
async function risky() {
  await someOperation(); // Can throw
}

// Good
async function safe() {
  try {
    await someOperation();
  } catch (error) {
    logger.error('Operation failed:', error);
    throw new InternalServerErrorException('Operation failed');
  }
}
```

### 2. Memory Leaks

```javascript
// Bad - event listeners not cleaned up
class Service {
  constructor() {
    emitter.on('event', this.handler);
  }
}

// Good - clean up listeners
class Service {
  constructor() {
    emitter.on('event', this.handler);
  }
  
  onModuleDestroy() {
    emitter.off('event', this.handler);
  }
}
```

### 3. Circular Dependencies

```bash
# Detect circular dependencies
npm install -g madge
madge --circular src/
```

## Health Check Failures

### Troubleshooting Steps

1. Check individual services:
```bash
# MongoDB
mongosh --eval "db.adminCommand('ping')"

# Redis
redis-cli ping

# API
curl http://localhost:3001/health
```

2. Review health check configuration:
```javascript
// Adjust timeouts if needed
@Get('readiness')
@HealthCheck()
readiness() {
  return this.health.check([
    () => this.mongo.pingCheck('mongodb', { timeout: 5000 }), // Increase timeout
  ]);
}
```

## Getting Help

### 1. Enable Debug Logging

```bash
# All NestJS debug output
DEBUG=* npm run start:dev

# Specific module
DEBUG=nestjs:* npm run start:dev
```

### 2. Collect Diagnostic Information

Create a diagnostic script:
```bash
#!/bin/bash
echo "=== System Info ==="
uname -a
node --version
npm --version

echo "=== Environment ==="
env | grep -E "(NODE|MONGO|REDIS|PORT)" | sed 's/=.*@/=***@/g'

echo "=== Dependencies ==="
npm ls --depth=0

echo "=== Database ==="
mongosh --eval "db.version()" 2>/dev/null || echo "MongoDB not accessible"

echo "=== Ports ==="
netstat -tlnp 2>/dev/null | grep -E "(3001|27017|6379)" || echo "Requires sudo"

echo "=== Logs (last 20 lines) ==="
tail -20 logs/error.log 2>/dev/null || echo "No error logs"
```

### 3. Create Minimal Reproduction

```javascript
// minimal-repro.js
const express = require('express');
const app = express();

// Add minimal code to reproduce issue
app.get('/test', (req, res) => {
  // Your problematic code here
});

app.listen(3000, () => console.log('Minimal repro on :3000'));
```

### 4. Community Resources

- GitHub Issues: [Report bugs and issues](https://github.com/yourrepo/issues)
- Stack Overflow: Tag with `nestjs` and `mongodb`
- NestJS Discord: [Official Discord server](https://discord.gg/nestjs)
- MongoDB Community: [MongoDB forums](https://www.mongodb.com/community/forums/)

### 5. Emergency Contacts

For production issues:
- On-call engineer: [Contact information]
- Escalation: [Escalation procedure]
- Status page: [Status page URL]

## Preventive Measures

1. **Regular Maintenance**
   - Update dependencies monthly
   - Review error logs weekly
   - Monitor performance metrics
   - Test backups regularly

2. **Monitoring Setup**
   - Set up alerts for error rates > 1%
   - Monitor response times
   - Track memory/CPU usage
   - Watch database connections

3. **Documentation**
   - Keep runbooks updated
   - Document known issues
   - Maintain change log
   - Update troubleshooting guide

Remember: When in doubt, check the logs first!