# Performance Optimization and Caching Strategies

## Overview

This document details the comprehensive performance optimization and caching strategies implemented across the drugfacts.wiki platform, covering frontend (Next.js), backend (NestJS), and data processing (Python) layers.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
├─────────────────────────┬───────────────────────────────────┤
│  Build-time Caching     │        Runtime Caching            │
│  • Static Generation    │  • Data Cache                     │
│  • ISR (5 min)         │  • Full Route Cache               │
│  • Pre-built Pages     │  • Client-side Prefetch           │
└────────────┬───────────┴────────────┬──────────────────────┘
             │                         │
┌────────────▼─────────────┐ ┌────────▼──────────────────────┐
│   CDN / Static Assets    │ │    API Layer (NestJS)         │
│  • Edge Caching         │ │  • Memory Cache (Dev)         │
│  • Asset Optimization   │ │  • Redis Cache (Prod)         │
│  • Image Optimization   │ │  • Response Compression       │
└──────────────────────────┘ └────────┬──────────────────────┘
                                      │
                            ┌─────────▼─────────────┐
                            │   Database Layer      │
                            │  • MongoDB Indexes    │
                            │  • Query Optimization │
                            │  • Connection Pooling │
                            └───────────────────────┘
```

## Frontend Performance Optimizations

### 1. Build-Time Optimizations

#### Static Generation with ISR
```typescript
// app/drugs/[slug]/page.tsx
export const revalidate = 300; // Revalidate every 5 minutes

export async function generateStaticParams() {
  const drugs = await getAllDrugs();
  return drugs.map((drug) => ({
    slug: drug.slug,
  }));
}
```

#### Pre-built Data Files
```javascript
// scripts/prepare-build-data.js
async function prepareBuildData() {
  const drugs = await fetchAllDrugs();
  
  // Generate index for quick lookups
  await fs.writeFile(
    'public/data/drugs/index.json',
    JSON.stringify(drugs)
  );
  
  // Generate individual files for static fallback
  for (const drug of drugs) {
    await fs.writeFile(
      `public/data/drugs/${drug.slug}.json`,
      JSON.stringify(drug)
    );
  }
}
```

### 2. Critical CSS Inlining

```typescript
// app/layout.tsx
<style dangerouslySetInnerHTML={{
  __html: `
    /* Critical above-the-fold styles for fastest LCP */
    body{font-family:'Inter',system-ui,-apple-system;margin:0;background:#fff}
    .drug-header{font-size:2rem;font-weight:700;line-height:1.2}
    .container{max-width:1200px;margin:0 auto;padding:0 1rem}
    /* Optimized for immediate render */
  `
}} />
```

### 3. Font Optimization

```typescript
// Self-hosted with preload and swap
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
});

// Inline @font-face for immediate loading
@font-face {
  font-family: 'Inter';
  font-display: swap;
  src: url(https://fonts.gstatic.com/...) format('woff2');
  unicode-range: U+0000-00FF;
}
```

### 4. Resource Hints

```typescript
// DNS prefetch and preconnect
<link rel="dns-prefetch" href="//fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

// Prefetch popular content
const popularDrugs = ['mounjaro-d2d7da5', 'emgality-33a147b'];
popularDrugs.forEach(slug => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = `/data/drugs/${slug}.json`;
  link.as = 'fetch';
  document.head.appendChild(link);
});
```

### 5. Next.js Data Cache

```typescript
// lib/drugs-server.ts
const response = await fetch(fullUrl, {
  headers: {
    'Content-Type': 'application/json',
  },
  // Cache for 5 minutes in production
  next: { revalidate: process.env.NODE_ENV === 'production' ? 300 : 0 }
});
```

### 6. Environment-Aware Data Fetching

```typescript
// lib/drugs.ts
const isServer = typeof window === 'undefined';

async function getImplementation() {
  if (isServer) {
    // Server: Direct file/API access
    const { getAllDrugsServer } = await import('./drugs-server');
    return { getAllDrugs: getAllDrugsServer };
  } else {
    // Client: HTTP fetch with caching
    const { getAllDrugsClient } = await import('./drugs-client');
    return { getAllDrugs: getAllDrugsClient };
  }
}
```

## Backend Performance Optimizations

### 1. Multi-Tier Caching Architecture

#### Enhanced Redis Cache Service
```typescript
@Injectable()
export class EnhancedRedisCacheService {
  // Different TTLs for different data types
  private readonly DRUG_DETAIL_TTL = 3600;      // 1 hour
  private readonly SEARCH_RESULTS_TTL = 900;    // 15 minutes
  private readonly LIST_DATA_TTL = 7200;        // 2 hours
  private readonly INDEX_DATA_TTL = 1800;       // 30 minutes

  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    // Check cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    // Fetch and cache
    const result = await fn();
    await this.set(key, result, options);
    return result;
  }
}
```

#### Compression for Large Data
```typescript
private async compressData(data: any): Promise<{ compressed: boolean; data: any }> {
  const jsonStr = JSON.stringify(data);
  
  if (jsonStr.length > this.compressionThreshold) { // > 1KB
    const compressed = await gzip(jsonStr);
    return {
      compressed: true,
      data: compressed.toString('base64'),
    };
  }
  
  return { compressed: false, data };
}
```

### 2. MongoDB Query Optimization

#### Strategic Indexing
```typescript
// drugs.service.ts
private async createIndexes() {
  // Text index for full-text search with weights
  await this.drugModel.collection.createIndex(
    {
      drugName: 'text',
      genericName: 'text',
      activeIngredient: 'text',
      indicationsAndUsage: 'text',
    },
    {
      weights: {
        drugName: 10,
        genericName: 8,
        activeIngredient: 6,
        indicationsAndUsage: 4,
      },
      name: 'drug_text_search',
      background: true,
    }
  );

  // Compound indexes for common queries
  await this.drugModel.collection.createIndex(
    { drugName: 1, therapeuticClass: 1 },
    { name: 'drug_name_class', background: true }
  );

  // Unique index for slug lookups
  await this.drugModel.collection.createIndex(
    { slug: 1 },
    { unique: true, name: 'slug_unique', background: true }
  );
}
```

#### Optimized Aggregation Pipeline
```typescript
// Weighted search with scoring
pipeline.push({
  $addFields: {
    searchScore: {
      $add: [
        // Exact match on drugName (weight: 10)
        {
          $cond: [
            { $eq: [{ $toLower: '$drugName' }, query.toLowerCase()] },
            10,
            0,
          ],
        },
        // Partial match (weight: 8)
        {
          $cond: [
            {
              $regexMatch: {
                input: { $toLower: { $ifNull: ['$drugName', ''] } },
                regex: searchPattern,
              },
            },
            8,
            0,
          ],
        },
        // Additional scoring logic...
      ],
    },
  },
});

// Efficient sorting and pagination
pipeline.push({ $sort: { searchScore: -1, drugName: 1 } });
pipeline.push({
  $facet: {
    metadata: [{ $count: 'total' }],
    data: [
      { $skip: skip },
      { $limit: limit },
      { $project: { _id: 0, __v: 0 } }, // Exclude unnecessary fields
    ],
  },
});
```

### 3. Lean Queries

```typescript
// Return plain JavaScript objects instead of Mongoose documents
const drug = await this.drugModel
  .findOne({ slug })
  .select('-_id -__v -_hash')  // Exclude internal fields
  .lean()                       // Much faster for read-only
  .exec();
```

### 4. Batch Operations

```typescript
// Cached batch fetching
async findBySlugs(slugs: string[]): Promise<(Drug | null)[]> {
  // Try cache first
  const cachedResults = await this.cacheService.mget<Drug>(cacheKeys);
  
  // Batch fetch missing items
  const toFetch = cachedResults
    .map((result, index) => result === null ? slugs[index] : null)
    .filter(Boolean);
  
  if (toFetch.length > 0) {
    const fetchedDrugs = await Promise.all(
      toFetch.map(slug => this.drugsService.findBySlug(slug))
    );
    
    // Batch cache update
    await this.cacheService.mset(cacheItems);
  }
  
  return cachedResults;
}
```

### 5. Connection Pooling

```typescript
// MongoDB connection configuration
MongooseModule.forRootAsync({
  useFactory: async (configService: ConfigService) => ({
    uri: configService.get<string>('database.uri'),
    dbName: configService.get<string>('database.name'),
    // Connection pool settings
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 10000,
  }),
});
```

### 6. Response Compression

```typescript
// main.ts
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024, // Only compress responses > 1KB
}));
```

## AI Processing Optimizations

### 1. MongoDB-Based AI Cache

```typescript
class CacheManager:
    def __init__(self):
        self.ttl = config['AI_CLASSIFICATION_CACHE_TTL']  # 24 hours
        
        # Create indexes for efficient lookups
        self.collection.create_index("expires_at", expireAfterSeconds=0)
        self.collection.create_index("cache_key", unique=True)
    
    def generate_cache_key(self, drug_data: Dict[str, Any]) -> str:
        """Content-based cache key generation."""
        content_hash = self._calculate_content_hash(drug_data)
        return f"drug-classification:{set_id}:{drug_name}:{content_hash}"
```

### 2. Rate Limiting

```python
class RateLimiter:
    """Sliding window rate limiter."""
    
    def wait_if_needed(self):
        with self.lock:
            # Remove old requests
            while self.requests and (now - self.requests[0]).total_seconds() > self.time_window:
                self.requests.popleft()
            
            # Wait if needed
            if len(self.requests) >= self.max_requests:
                wait_time = self.time_window - (now - oldest_request).total_seconds()
                if wait_time > 0:
                    time.sleep(wait_time)
```

### 3. Batch Processing

```python
def process_documents(self, documents: List[Dict[str, Any]]) -> Dict[str, int]:
    """Process documents with efficient batching."""
    for i, document in enumerate(documents):
        try:
            # Check cache first
            cached_result = self.cache_manager.get_cached_result(cache_key)
            if cached_result:
                stats['cache_hits'] += 1
                continue
                
            # Process with AI if not cached
            classification_result = self.drug_classifier.classify_drug(document)
            
            # Store in cache for future use
            self.cache_manager.store_result(cache_key, classification_result)
            
        except Exception as e:
            # Continue processing other documents
            stats['failed'] += 1
```

## Cache Invalidation Strategies

### 1. Tag-Based Invalidation

```typescript
// Tag items for grouped invalidation
await this.set(key, value, {
  ttl: 3600,
  tags: ['drug', `drug:${slug}`, 'search'],
});

// Invalidate all items with a tag
async invalidateTag(tag: string): Promise<void> {
  const tagKey = this.generateKey(`tag:${tag}`);
  const keys = await this.cacheManager.get<string[]>(tagKey);
  
  if (keys && keys.length > 0) {
    await this.delMany(keys);
  }
}
```

### 2. TTL-Based Expiration

```typescript
// Different TTLs for different data freshness requirements
const TTL_CONFIG = {
  DRUG_DETAILS: 3600,        // 1 hour - relatively static
  SEARCH_RESULTS: 900,       // 15 minutes - may change more frequently
  METADATA_LISTS: 7200,      // 2 hours - rarely changes
  AI_CLASSIFICATION: 86400,  // 24 hours - expensive to regenerate
};
```

### 3. Manual Invalidation Endpoints

```typescript
@Post('cache/invalidate/:slug')
async invalidateDrug(@Param('slug') slug: string) {
  await this.cachedDrugsService.invalidateDrug(slug);
  return { message: `Cache invalidated for drug: ${slug}` };
}
```

## Performance Monitoring

### 1. Cache Metrics

```typescript
async getStats(): Promise<CacheStats> {
  return {
    healthy: this.connectionHealthy,
    hit_rate: this.cache_hits / (this.cache_hits + this.cache_misses),
    total_requests: this.total_requests,
    avg_response_time: this.calculateAvgResponseTime(),
    cache_size: await this.getCacheSize(),
  };
}
```

### 2. Web Vitals Tracking

```typescript
// Performance monitoring script
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'largest-contentful-paint') {
      // Track LCP
    }
  }
});

observer.observe({ entryNames: ['largest-contentful-paint'] });
```

### 3. Request Performance Logging

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        this.logger.log(`${method} ${url} - ${duration}ms`);
      })
    );
  }
}
```

## Cache Warming Strategies

### 1. Application Startup

```typescript
@Injectable()
export class CacheWarmerService implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    if (this.enableWarmup) {
      await this.warmupCache();
    }
  }
  
  private async warmupCache() {
    // Warm up frequently accessed data
    const popularDrugs = await this.getPopularDrugs();
    await Promise.all(
      popularDrugs.map(drug => this.cachedDrugsService.findBySlug(drug.slug))
    );
  }
}
```

### 2. Scheduled Cache Warming

```typescript
@Cron(CronExpression.EVERY_DAY_AT_3AM)
async scheduledWarmup() {
  if (this.enableScheduledWarmup) {
    await this.warmupCache();
  }
}
```

## Memory Optimization

### 1. Stream Processing

```typescript
// For large datasets, use streaming
async streamAllDrugs(): Promise<Readable> {
  const cursor = this.drugModel.find().cursor();
  
  return cursor.pipe(
    new Transform({
      objectMode: true,
      transform(doc, encoding, callback) {
        callback(null, JSON.stringify(doc) + '\n');
      }
    })
  );
}
```

### 2. Garbage Collection Optimization

```typescript
// Clear large objects after use
function processLargeDataset(data: any[]) {
  try {
    // Process data
    const result = transformData(data);
    return result;
  } finally {
    // Clear reference for GC
    data = null;
  }
}
```

## Network Optimization

### 1. HTTP/2 Support

```nginx
# nginx.conf
server {
  listen 443 ssl http2;
  
  # HTTP/2 push for critical resources
  location / {
    add_header Link "</styles/critical.css>; rel=preload; as=style" always;
  }
}
```

### 2. CDN Integration

```typescript
// Use CDN for static assets
const assetUrl = process.env.CDN_URL 
  ? `${process.env.CDN_URL}/assets/${filename}`
  : `/assets/${filename}`;
```

## Database Optimization

### 1. Query Projection

```typescript
// Only fetch needed fields
const drugs = await this.drugModel
  .find(query)
  .select('drugName slug therapeuticClass manufacturer')  // Only needed fields
  .lean()
  .exec();
```

### 2. Pagination

```typescript
// Efficient cursor-based pagination
const drugs = await this.drugModel
  .find({ _id: { $gt: lastId } })
  .sort({ _id: 1 })
  .limit(pageSize)
  .lean()
  .exec();
```

## Best Practices Summary

1. **Cache Everything Cacheable**
   - Static assets with long TTLs
   - API responses with appropriate TTLs
   - Expensive computations (AI classifications)

2. **Optimize Critical Path**
   - Inline critical CSS
   - Preload key resources
   - Minimize blocking JavaScript

3. **Use Appropriate Cache Levels**
   - CDN for static assets
   - Redis for shared application data
   - Memory cache for request-scoped data

4. **Monitor and Measure**
   - Track cache hit rates
   - Monitor response times
   - Alert on performance degradation

5. **Plan for Scale**
   - Implement connection pooling
   - Use batch operations
   - Design for horizontal scaling

## Performance Targets

- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **API Response**: < 200ms (cached), < 1s (uncached)
- **Cache Hit Rate**: > 80%
- **Database Query**: < 100ms

## Conclusion

The implementation demonstrates a comprehensive approach to performance optimization with multiple caching layers, efficient data structures, and careful resource management. This ensures fast, responsive user experiences even under high load while maintaining data freshness and accuracy.