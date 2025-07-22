# NestJS Backend Architecture Improvement Plan

## Executive Summary
This plan outlines improvements to the DrugFacts NestJS backend API, focusing on code cleanup, MCP server integration, performance optimization, and robust error handling.

## 1. API Structure Cleanup

### Current State Analysis
- **Backend Location**: `/backend/drugfacts-api/`
- **Framework**: NestJS with MongoDB/Mongoose
- **Current Endpoints**:
  - `GET /api/drugs` - Search drugs with filters
  - `GET /api/drugs/index` - Get all drugs in index format
  - `GET /api/drugs/therapeutic-classes` - List therapeutic classes
  - `GET /api/drugs/manufacturers` - List manufacturers
  - `GET /api/drugs/count` - Get total drug count
  - `GET /api/drugs/:slug` - Get drug by slug

### Identified Issues & Cleanup Tasks

#### 1.1 Unused Dependencies
**Remove from package.json**:
- `@types/supertest` - Only needed if actually writing e2e tests
- `supertest` - Same as above
- `source-map-support` - Not actively used
- `@swc/*` packages - Using ts-jest, not SWC

#### 1.2 Unused Files
**Files to remove**:
- `/src/app.controller.ts` - Default controller not needed
- `/src/app.service.ts` - Default service not needed
- `/src/app.controller.spec.ts` - Test for unused controller
- `/test/*` - If not implementing tests immediately

#### 1.3 Code Structure Improvements
```
backend/drugfacts-api/
├── src/
│   ├── common/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   ├── cache.interceptor.ts
│   │   │   └── logging.interceptor.ts
│   │   └── pipes/
│   │       └── validation.pipe.ts
│   ├── config/
│   │   ├── app.config.ts
│   │   ├── cache.config.ts
│   │   └── database.config.ts
│   ├── drugs/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── interfaces/
│   │   └── services/
│   │       ├── drugs.service.ts
│   │       └── drugs-cache.service.ts
│   └── mcp/
│       ├── mcp.module.ts
│       ├── mcp.service.ts
│       └── tools/
```

## 2. MCP Server Implementation

### 2.1 Architecture Design
Create a Model Context Protocol (MCP) server to expose drug data as AI-accessible tools:

```typescript
// mcp/tools/drug-search.tool.ts
export const drugSearchTool = {
  name: 'drug_search',
  description: 'Search for drugs by name, ingredient, or therapeutic class',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query' },
      filters: {
        type: 'object',
        properties: {
          therapeuticClass: { type: 'string' },
          manufacturer: { type: 'string' },
          limit: { type: 'number', default: 10 }
        }
      }
    },
    required: ['query']
  }
};

// mcp/tools/drug-details.tool.ts
export const drugDetailsTool = {
  name: 'drug_details',
  description: 'Get comprehensive information about a specific drug',
  inputSchema: {
    type: 'object',
    properties: {
      slug: { type: 'string', description: 'Drug slug identifier' }
    },
    required: ['slug']
  }
};

// mcp/tools/drug-interactions.tool.ts
export const drugInteractionsTool = {
  name: 'check_drug_interactions',
  description: 'Check potential interactions between multiple drugs',
  inputSchema: {
    type: 'object',
    properties: {
      drugSlugs: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of drug slugs to check'
      }
    },
    required: ['drugSlugs']
  }
};
```

### 2.2 MCP Server Setup
```typescript
// mcp/mcp.service.ts
import { Injectable } from '@nestjs/common';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

@Injectable()
export class McpService {
  private server: Server;

  async initialize() {
    this.server = new Server({
      name: 'drugfacts-mcp',
      version: '1.0.0',
    });

    // Register tools
    this.server.setRequestHandler('tools/list', async () => ({
      tools: [drugSearchTool, drugDetailsTool, drugInteractionsTool]
    }));

    // Handle tool calls
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;
      
      switch (name) {
        case 'drug_search':
          return await this.handleDrugSearch(args);
        case 'drug_details':
          return await this.handleDrugDetails(args);
        case 'check_drug_interactions':
          return await this.handleDrugInteractions(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });

    // Start server
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}
```

## 3. Caching Strategies

### 3.1 Multi-Level Caching Architecture

#### Level 1: In-Memory Cache (Node.js)
```typescript
// common/cache/memory-cache.service.ts
import { Injectable } from '@nestjs/common';
import * as NodeCache from 'node-cache';

@Injectable()
export class MemoryCacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 300, // 5 minutes default
      checkperiod: 60,
      maxKeys: 1000
    });
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    this.cache.set(key, value, ttl);
  }
}
```

#### Level 2: Redis Cache
```typescript
// common/cache/redis-cache.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    return await this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    await this.cacheManager.set(key, value, ttl * 1000);
  }
}
```

### 3.2 Cache Strategy Implementation
```typescript
// drugs/services/drugs-cache.service.ts
@Injectable()
export class DrugsCacheService {
  constructor(
    private memoryCache: MemoryCacheService,
    private redisCache: RedisCacheService,
    private drugsService: DrugsService
  ) {}

  async getDrugBySlug(slug: string): Promise<Drug> {
    // L1: Memory cache
    const memCached = await this.memoryCache.get<Drug>(`drug:${slug}`);
    if (memCached) return memCached;

    // L2: Redis cache
    const redisCached = await this.redisCache.get<Drug>(`drug:${slug}`);
    if (redisCached) {
      await this.memoryCache.set(`drug:${slug}`, redisCached, 300);
      return redisCached;
    }

    // L3: Database
    const drug = await this.drugsService.findBySlug(slug);
    
    // Cache in both layers
    await this.redisCache.set(`drug:${slug}`, drug, 3600);
    await this.memoryCache.set(`drug:${slug}`, drug, 300);
    
    return drug;
  }

  // Cache invalidation
  async invalidateDrug(slug: string): Promise<void> {
    await this.memoryCache.del(`drug:${slug}`);
    await this.redisCache.del(`drug:${slug}`);
  }
}
```

### 3.3 Cache Headers & CDN Integration
```typescript
// common/interceptors/cache-control.interceptor.ts
@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();
    
    // Static data endpoints
    if (request.url.includes('/therapeutic-classes') || 
        request.url.includes('/manufacturers')) {
      response.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    }
    // Drug details
    else if (request.url.match(/\/drugs\/[^\/]+$/)) {
      response.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
    }
    // Search results
    else if (request.url.includes('/drugs?')) {
      response.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
    }
    
    return next.handle();
  }
}
```

## 4. Error Handling for AI Services

### 4.1 Comprehensive Error Handling Strategy

```typescript
// common/filters/ai-service-exception.filter.ts
@Catch()
export class AiServiceExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = 500;
    let message = 'Internal server error';
    let error = 'UNKNOWN_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = exceptionResponse['message'] || exception.message;
      error = exceptionResponse['error'] || 'HTTP_ERROR';
    } else if (exception instanceof MongoError) {
      if (exception.code === 11000) {
        status = 409;
        message = 'Duplicate entry';
        error = 'DUPLICATE_ENTRY';
      } else {
        message = 'Database error';
        error = 'DATABASE_ERROR';
      }
    } else if (exception instanceof AIServiceError) {
      status = 503;
      message = 'AI service temporarily unavailable';
      error = 'AI_SERVICE_ERROR';
    }

    // Log error
    console.error({
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: exception,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(status).json({
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

### 4.2 Circuit Breaker Pattern
```typescript
// common/services/circuit-breaker.service.ts
@Injectable()
export class CircuitBreakerService {
  private states = new Map<string, CircuitState>();

  async call<T>(
    key: string,
    fn: () => Promise<T>,
    options: CircuitBreakerOptions = {}
  ): Promise<T> {
    const state = this.getState(key);
    
    if (state.isOpen()) {
      throw new ServiceUnavailableException('Service is temporarily unavailable');
    }

    try {
      const result = await fn();
      state.recordSuccess();
      return result;
    } catch (error) {
      state.recordFailure();
      
      if (state.shouldOpen()) {
        state.open();
        setTimeout(() => state.halfOpen(), options.resetTimeout || 60000);
      }
      
      throw error;
    }
  }
}
```

### 4.3 Retry Logic with Exponential Backoff
```typescript
// common/decorators/retry.decorator.ts
export function Retry(options: RetryOptions = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const maxAttempts = options.maxAttempts || 3;
      const backoff = options.backoff || 1000;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          if (attempt === maxAttempts) throw error;
          
          const delay = backoff * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    };
    
    return descriptor;
  };
}
```

## 5. Data Validation and Sanitization

### 5.1 Input Validation Strategy

```typescript
// common/pipes/sanitize.pipe.ts
@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      // Remove potential XSS vectors
      value = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      value = value.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
      
      // Trim whitespace
      value = value.trim();
      
      // Normalize whitespace
      value = value.replace(/\s+/g, ' ');
    }
    
    return value;
  }
}
```

### 5.2 DTO Validation Schemas
```typescript
// drugs/dto/create-drug.dto.ts
import { IsString, IsOptional, MaxLength, Matches, IsArray, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateDrugDto {
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  drugName: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  genericName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  activeIngredient?: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens'
  })
  slug: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitizeHtml(value))
  indicationsAndUsage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => value?.map(v => v.trim()))
  therapeuticClass?: string[];
}
```

### 5.3 Output Sanitization
```typescript
// common/interceptors/sanitize-output.interceptor.ts
@Injectable()
export class SanitizeOutputInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => this.sanitizeData(data))
    );
  }

  private sanitizeData(data: any): any {
    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }
    
    if (data && typeof data === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeData(value);
      }
      return sanitized;
    }
    
    return data;
  }

  private sanitizeString(str: string): string {
    // Remove MongoDB internal fields
    if (str.startsWith('_')) return undefined;
    
    // Basic HTML entity encoding for output
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
}
```

## 6. Implementation Timeline

### Phase 1: Cleanup (Week 1)
- Remove unused dependencies and files
- Restructure directories
- Update imports and module organization
- Create base configuration files

### Phase 2: Caching (Week 2)
- Implement memory cache service
- Set up Redis integration
- Add cache interceptors
- Implement cache invalidation logic

### Phase 3: Error Handling (Week 3)
- Create custom exception filters
- Implement circuit breaker
- Add retry mechanisms
- Set up comprehensive logging

### Phase 4: Validation (Week 4)
- Create validation pipes
- Update all DTOs with proper validation
- Implement sanitization logic
- Add security headers

### Phase 5: MCP Server (Weeks 5-6)
- Design MCP tool interfaces
- Implement MCP server
- Create tool handlers
- Test AI integration
- Deploy MCP server

## 7. Testing Strategy

### Unit Tests
```typescript
// drugs/drugs.service.spec.ts
describe('DrugsService', () => {
  let service: DrugsService;
  let model: Model<DrugDocument>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DrugsService,
        {
          provide: getModelToken(Drug.name),
          useValue: mockDrugModel,
        },
      ],
    }).compile();

    service = module.get<DrugsService>(DrugsService);
    model = module.get<Model<DrugDocument>>(getModelToken(Drug.name));
  });

  describe('findBySlug', () => {
    it('should return drug when found', async () => {
      const mockDrug = { drugName: 'Test Drug', slug: 'test-drug' };
      jest.spyOn(model, 'findOne').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockDrug),
          }),
        }),
      } as any);

      const result = await service.findBySlug('test-drug');
      expect(result).toEqual(mockDrug);
    });

    it('should throw NotFoundException when drug not found', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        }),
      } as any);

      await expect(service.findBySlug('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
```

### Integration Tests
```typescript
// test/drugs.e2e-spec.ts
describe('DrugsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/api/drugs (GET)', () => {
    it('should return paginated drug list', () => {
      return request(app.getHttpServer())
        .get('/api/drugs?page=1&limit=10')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(res.body.pagination).toHaveProperty('page', 1);
          expect(res.body.pagination).toHaveProperty('limit', 10);
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## 8. Monitoring and Observability

### 8.1 Logging Configuration
```typescript
// config/logging.config.ts
import * as winston from 'winston';

export const loggerConfig = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.json(),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.json(),
    }),
  ],
};
```

### 8.2 Health Checks
```typescript
// health/health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongo: MongooseHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.mongo.pingCheck('mongodb'),
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
    ]);
  }
}
```

## 9. Security Considerations

### 9.1 Rate Limiting
```typescript
// main.ts additions
import * as rateLimit from 'express-rate-limit';

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP',
  }),
);
```

### 9.2 Security Headers
```typescript
import * as helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

## 10. Deployment Considerations

### 10.1 Environment Variables
```env
# .env.example
NODE_ENV=production
PORT=3001

# MongoDB
MONGODB_URI=mongodb://localhost:27017/drugfacts

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# MCP Server
MCP_SERVER_PORT=3002
MCP_SERVER_HOST=0.0.0.0

# Cache TTL (seconds)
CACHE_TTL_MEMORY=300
CACHE_TTL_REDIS=3600
CACHE_TTL_CDN=86400

# API Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 10.2 Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3001 3002

CMD ["node", "dist/main.js"]
```

## Conclusion

This comprehensive plan addresses all aspects of improving the NestJS backend:
1. **Clean API structure** with removed unused dependencies
2. **MCP server integration** for AI tool exposure
3. **Multi-level caching** for optimal performance
4. **Robust error handling** with circuit breakers and retries
5. **Comprehensive validation** and sanitization

The implementation follows NestJS best practices and provides a scalable, maintainable solution for the DrugFacts API.