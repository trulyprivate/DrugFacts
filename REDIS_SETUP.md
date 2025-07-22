# Redis Setup for DrugFacts on DigitalOcean

This guide explains how Redis is configured and used in the DrugFacts application on DigitalOcean.

## Overview

Redis is used for:
- Caching drug data to improve API response times
- Storing session data (if authentication is implemented)
- Rate limiting and temporary data storage

## DigitalOcean Managed Redis

The application is configured to use DigitalOcean's managed Redis service, which provides:
- High availability with automatic failover
- Automatic backups
- SSL/TLS encryption
- Monitoring and alerts

## Configuration

### 1. App Spec Configuration

The `digitalocean-combined-app-spec.yaml` includes:

```yaml
databases:
  - name: redis
    engine: REDIS
    production: true
    version: "7"
    size: db-s-1vcpu-1gb
    cluster_name: drugfacts-redis-cluster
```

### 2. Environment Variables

The backend service automatically receives these Redis environment variables:

- `REDIS_HOST` - Hostname of the Redis instance (from `${redis.HOSTNAME}`)
- `REDIS_PORT` - Port number (from `${redis.PORT}`)
- `REDIS_PASSWORD` - Authentication password (from `${redis.PASSWORD}`)
- `REDIS_TLS` - Set to "true" for SSL/TLS connections
- `USE_REDIS` - Set to "true" to enable Redis caching

### 3. Backend Configuration

The NestJS backend is configured to use Redis when available:

```typescript
// cache.config.ts
export default registerAs('cache', () => {
  const config = {
    store: redisStore,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    ttl: parseInt(process.env.CACHE_TTL_REDIS || '3600', 10),
    max: 100,
    isGlobal: true,
  };

  // TLS support for DigitalOcean
  if (process.env.REDIS_TLS === 'true') {
    config.tls = {
      rejectUnauthorized: false,
    };
  }

  return config;
});
```

## Caching Strategy

### 1. Drug Data Caching

The Enhanced Redis Cache Service provides:
- Automatic compression for large data
- Tag-based cache invalidation
- Multi-layer caching with TTL management

```typescript
// Cache drug data for 1 hour
const CACHE_TTL = 3600;

// Cache keys
generateDrugCacheKey(slug: string): string {
  return `drug:full:${slug}`;
}
```

### 2. Cache Warming

Popular drugs can be pre-cached on startup:
```typescript
await cacheWarmerService.warmupCache(['mounjaro', 'emgality', 'taltz']);
```

### 3. Cache Invalidation

When drug data is updated:
```typescript
// Invalidate specific drug
await cache.del(`drug:full:${slug}`);

// Invalidate by tag
await cache.invalidateTag('therapeutic:glp-1-agonists');
```

## Deployment Steps

1. **Deploy with Redis**:
   ```bash
   doctl apps create --spec digitalocean-combined-app-spec.yaml
   ```

2. **Verify Redis Connection**:
   - Check backend logs for Redis connection status
   - Visit `/health` endpoint to see Redis health

3. **Monitor Cache Performance**:
   - Use DigitalOcean's monitoring dashboard
   - Check cache hit rates in application logs

## Cost Considerations

- Redis Basic (1GB): ~$15/month
- Consider using Redis only for production
- Development can use in-memory caching

## Troubleshooting

### Connection Issues

1. **TLS Certificate Errors**:
   - Ensure `REDIS_TLS=true` is set
   - Check that TLS configuration includes `rejectUnauthorized: false`

2. **Authentication Failures**:
   - Verify `REDIS_PASSWORD` environment variable is set
   - Check Redis logs in DigitalOcean dashboard

3. **Performance Issues**:
   - Monitor memory usage
   - Adjust cache TTL values
   - Consider upgrading Redis size if needed

### Testing Redis Locally

For local development without Redis:
```bash
# Backend will automatically fall back to memory cache
USE_REDIS=false npm run start:dev
```

To test with local Redis:
```bash
# Start Redis in Docker
docker run -d -p 6379:6379 redis:7-alpine

# Run backend with Redis
USE_REDIS=true REDIS_HOST=localhost npm run start:dev
```

## Best Practices

1. **Cache Keys**:
   - Use consistent naming patterns
   - Include version in keys if data structure changes
   - Keep keys short but descriptive

2. **TTL Management**:
   - Shorter TTL for frequently changing data
   - Longer TTL for static content
   - Consider stale-while-revalidate pattern

3. **Memory Management**:
   - Monitor memory usage
   - Implement cache eviction policies
   - Compress large objects before caching

4. **Error Handling**:
   - Always have fallback to database
   - Log cache errors but don't fail requests
   - Implement circuit breaker pattern for Redis failures