# Redis Caching Setup for drugfacts.wiki

## Overview

This document describes the Redis caching implementation for efficient content processing and improved performance.

## Architecture

### Caching Layers

1. **Enhanced Redis Cache Service** (`enhanced-redis-cache.service.ts`)
   - Automatic compression for large data (>1KB)
   - Tag-based cache invalidation
   - Batch operations (mget/mset)
   - Health monitoring
   - Connection pooling with automatic failover

2. **Cached Drugs Service** (`cached-drugs.service.ts`)
   - Wraps the main drugs service with caching
   - Different TTLs for different data types:
     - Drug details: 1 hour
     - Search results: 15 minutes
     - Metadata (classes, manufacturers): 2 hours
     - Index data: 30 minutes

3. **Cache Warming** (`cache-warmer.service.ts`)
   - Optional warmup on application start
   - Scheduled warmup (daily at 3 AM)
   - Configurable via environment variables

## Environment Variables

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_password
REDIS_URL=redis://localhost:6379  # Alternative to host/port
USE_REDIS=true                     # Set to false to use memory cache

# Cache TTL Settings
CACHE_TTL_REDIS=3600              # Default TTL in seconds (1 hour)

# Cache Warming
CACHE_WARMUP_ON_START=false       # Enable cache warmup on startup
CACHE_SCHEDULED_WARMUP=false      # Enable daily cache warmup
```

## Docker Configuration

### Development (docker-compose.dev.yml)

Redis is optional in development. To use Redis:

```bash
docker-compose -f docker-compose.dev.yml up -d redis
```

### Production (docker-compose.prod.yml)

Redis is included in the production profile:

```bash
docker-compose -f docker-compose.prod.yml --profile with-redis up -d
```

Production Redis configuration:
- Password protected
- Persistent storage with AOF (append-only file)
- Health checks configured
- Optimized for performance

## API Endpoints

### Cache Management

- `GET /api/drugs/cache/stats` - Get cache statistics
- `POST /api/drugs/cache/warmup` - Trigger cache warmup
- `POST /api/drugs/cache/invalidate/:slug` - Invalidate specific drug cache

### Health Checks

- `GET /api/health` - Overall health including Redis
- `GET /api/health/cache` - Redis-specific health check

## Caching Strategies

### 1. Cache-Aside Pattern
- Check cache first
- If miss, fetch from database
- Store in cache with appropriate TTL

### 2. Tag-Based Invalidation
- Each cached item can have multiple tags
- Invalidate all items with a specific tag
- Tags used: `drug`, `search`, `meta`, `therapeutic-class`, `manufacturer`

### 3. Compression
- Automatic GZIP compression for data > 1KB
- Base64 encoding for storage
- Transparent decompression on retrieval

### 4. Batch Operations
- `findBySlugs()` - Fetch multiple drugs in one operation
- Minimizes round trips to Redis
- Fallback to database for missing items

## Performance Optimizations

### 1. Connection Pooling
- Reuses Redis connections
- Automatic reconnection on failure
- Health checks every 30 seconds

### 2. Intelligent Key Generation
- Namespace prefixing: `drugfacts:`
- SHA256 hashing for complex keys
- Predictable key patterns for debugging

### 3. Selective Caching
- Not all data is cached
- Focus on frequently accessed data
- Configurable TTLs per data type

### 4. Graceful Degradation
- Falls back to direct database queries if Redis is unavailable
- Logs errors but doesn't break functionality
- Health indicator shows cache status

## Monitoring

### Metrics Available
- Cache hit/miss rates (via logs)
- Redis connection health
- Memory usage
- Key count

### Health Checks
```bash
# Check Redis health
curl http://localhost:3001/api/health/cache

# Get cache statistics
curl http://localhost:3001/api/drugs/cache/stats
```

## Testing

### Local Testing with Docker
```bash
# Start Redis
docker run -d --name redis-test -p 6379:6379 redis:7-alpine

# Set environment variables
export USE_REDIS=true
export REDIS_HOST=localhost
export REDIS_PORT=6379

# Run the application
npm run start:dev
```

### Load Testing
```bash
# Warm up cache
curl -X POST http://localhost:3001/api/drugs/cache/warmup

# Test cached endpoints
ab -n 1000 -c 10 http://localhost:3001/api/drugs
ab -n 1000 -c 10 http://localhost:3001/api/drugs/mounjaro-d2d7da5
```

## Troubleshooting

### Common Issues

1. **Redis Connection Refused**
   - Check if Redis is running: `docker ps | grep redis`
   - Verify connection settings in environment variables
   - Check firewall/network settings

2. **High Memory Usage**
   - Monitor with: `redis-cli INFO memory`
   - Adjust TTLs if needed
   - Consider implementing cache eviction policies

3. **Cache Misses**
   - Check if warmup is enabled
   - Verify TTL settings are appropriate
   - Monitor logs for cache invalidation events

### Debug Commands

```bash
# Connect to Redis CLI
docker exec -it drugfacts-redis redis-cli

# List all keys
KEYS drugfacts:*

# Check specific key
GET drugfacts:drug:full:mounjaro-d2d7da5

# Monitor commands in real-time
MONITOR

# Check memory usage
INFO memory
```

## Best Practices

1. **Use Appropriate TTLs**
   - Shorter for frequently changing data
   - Longer for static content
   - Consider business requirements

2. **Implement Cache Warming**
   - For critical, frequently accessed data
   - During low-traffic periods
   - Monitor performance impact

3. **Monitor Cache Performance**
   - Track hit rates
   - Watch for memory issues
   - Set up alerts for Redis downtime

4. **Plan for Cache Invalidation**
   - Use tags for grouped invalidation
   - Implement webhooks for real-time updates
   - Consider event-driven invalidation

5. **Security**
   - Always use passwords in production
   - Restrict network access
   - Regular security updates
   - Don't cache sensitive data

## Future Enhancements

1. **Redis Cluster Support**
   - For horizontal scaling
   - Automatic sharding
   - High availability

2. **Advanced Caching Patterns**
   - Write-through caching
   - Cache preloading based on analytics
   - Predictive cache warming

3. **Monitoring Integration**
   - Prometheus metrics
   - Grafana dashboards
   - Custom alerts

4. **Cache Analytics**
   - Most/least accessed keys
   - Cache efficiency metrics
   - Cost optimization recommendations