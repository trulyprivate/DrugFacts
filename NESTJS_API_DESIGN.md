# NestJS API Design and Data Validation

## Overview

This document describes the NestJS API architecture, design patterns, and data validation approaches implemented in the drugfacts.wiki backend API.

## Architecture Overview

### Project Structure

```
backend/drugfacts-api/
├── src/
│   ├── common/                 # Shared modules and utilities
│   │   ├── interceptors/       # Global interceptors
│   │   ├── pipes/             # Validation and sanitization pipes
│   │   ├── services/          # Shared services (cache, etc.)
│   │   └── filters/           # Exception filters
│   ├── config/                # Configuration modules
│   ├── drugs/                 # Drugs feature module
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── schemas/          # Mongoose schemas
│   │   ├── services/         # Business logic
│   │   └── controllers/      # HTTP endpoints
│   ├── health/               # Health check module
│   └── mcp/                  # Model Context Protocol module
```

### Core Design Principles

1. **Modular Architecture**: Features are organized into modules (drugs, health, common)
2. **Dependency Injection**: Services are injected using NestJS DI container
3. **Separation of Concerns**: Controllers handle HTTP, services contain business logic
4. **Global Configuration**: Centralized config using `@nestjs/config`
5. **Layered Architecture**: Controller → Service → Repository (Mongoose) → Database

## API Design Patterns

### 1. RESTful Endpoints

```typescript
@Controller('drugs')
export class DrugsController {
  @Get()                      // GET /api/drugs
  @Get(':slug')              // GET /api/drugs/:slug
  @Get('therapeutic-classes') // GET /api/drugs/therapeutic-classes
  @Get('manufacturers')       // GET /api/drugs/manufacturers
}
```

### 2. Response Structure

Consistent response format across all endpoints:

```typescript
// Success response
{
  "data": { ... },      // Actual response data
  "pagination": {       // Optional: for paginated responses
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  }
}

// Error response (from exception filter)
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": {
    "field": ["error message"]
  }
}
```

### 3. Pagination Pattern

Implemented via query parameters with validation:

```typescript
export class SearchDrugsDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 50;
}
```

### 4. Service Layer Pattern

Services encapsulate business logic and data access:

```typescript
@Injectable()
export class DrugsService {
  constructor(
    @InjectModel(Drug.name) private drugModel: Model<DrugDocument>
  ) {}

  // Business logic separated from HTTP concerns
  async findAll(searchDto: SearchDrugsDto) { ... }
  async findBySlug(slug: string) { ... }
}
```

### 5. Caching Strategy

Multi-layer caching with different strategies:

```typescript
// Memory cache for development
@Injectable()
export class MemoryCacheService { ... }

// Redis cache for production
@Injectable()
export class EnhancedRedisCacheService { ... }

// Cached service wrapper
@Injectable()
export class CachedDrugsService {
  async findBySlug(slug: string) {
    return this.cacheService.wrap(
      cacheKey,
      () => this.drugsService.findBySlug(slug),
      { ttl: 3600, compress: true }
    );
  }
}
```

## Data Validation Approaches

### 1. DTO-Based Validation

Using `class-validator` decorators for input validation:

```typescript
export class SearchDrugsDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Matches(/^[a-zA-Z0-9\s\-\.]+$/, {
    message: 'Search query contains invalid characters'
  })
  @Transform(({ value }) => value?.trim())
  q?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  therapeuticClass?: string;

  @IsOptional()
  @IsEnum(SearchType)
  searchType?: SearchType = SearchType.WEIGHTED;
}
```

### 2. Global Validation Pipe

Applied application-wide with strict configuration:

```typescript
// main.ts
app.useGlobalPipes(
  new CustomValidationPipe({
    whitelist: true,              // Strip unknown properties
    forbidNonWhitelisted: true,   // Throw on unknown properties
    transform: true,              // Enable type transformation
    transformOptions: {
      enableImplicitConversion: true
    }
  })
);
```

### 3. Custom Validation Pipe

Enhanced validation with detailed error messages:

```typescript
@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  protected flattenValidationErrors(
    validationErrors: ValidationError[]
  ): Record<string, string[]> {
    const errors = {};
    validationErrors.forEach(error => {
      errors[error.property] = Object.values(error.constraints || {});
    });
    return errors;
  }
}
```

### 4. Sanitization Pipes

Two-tier sanitization approach:

```typescript
// Strict sanitization - removes all HTML
@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any): any {
    if (typeof value === 'string') {
      return sanitizeHtml(value, { allowedTags: [] });
    }
    // Recursive sanitization for objects/arrays
    return this.sanitizeDeep(value);
  }
}

// HTML sanitization - allows safe tags
@Injectable()
export class HtmlSanitizePipe implements PipeTransform {
  transform(value: string): string {
    return sanitizeHtml(value, {
      allowedTags: ['h1', 'h2', 'h3', 'p', 'b', 'i', 'em', 'strong', 'a'],
      allowedAttributes: { 'a': ['href', 'target', 'rel'] }
    });
  }
}
```

### 5. Output Sanitization

Global interceptor for response sanitization:

```typescript
@Injectable()
export class SanitizeOutputInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => this.sanitizeResponse(data))
    );
  }

  private sanitizeResponse(data: any): any {
    // Remove sensitive fields
    const sensitiveFields = ['_id', '__v', 'password', 'token'];
    // HTML encode specific fields
    const htmlFields = ['description', 'content', 'body'];
    // Process recursively...
  }
}
```

## Security Measures

### 1. Input Security

- **Regex validation**: Restricts character sets in search queries
- **Length limits**: MaxLength decorators prevent buffer attacks
- **Type coercion**: Strict type checking with transformation
- **Whitelist filtering**: Unknown properties are stripped

### 2. NoSQL Injection Prevention

```typescript
// Safe: Using Mongoose query builders
const drugs = await this.drugModel
  .find({ drugName: { $regex: searchTerm, $options: 'i' } })
  .exec();

// Pattern escaping for user input
const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
```

### 3. XSS Prevention

- HTML sanitization on input
- Entity encoding on output
- Content Security Policy headers
- Sanitized error messages

### 4. Rate Limiting

```typescript
// Applied per IP address
app.use(
  rateLimit({
    windowMs: rateLimitWindow,
    max: rateLimitMax,
    message: 'Too many requests from this IP'
  })
);
```

## API Interceptors and Filters

### 1. Logging Interceptor

Tracks request/response cycle:

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        logger.log(`${method} ${url} ${duration}ms`);
      })
    );
  }
}
```

### 2. Exception Filters

Consistent error handling:

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Format and sanitize error responses
    // Log errors appropriately
    // Return consistent error structure
  }
}
```

## Database Schema Validation

### Mongoose Schema Definition

```typescript
@Schema({ 
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})
export class Drug {
  @Prop({ required: true, index: true })
  drugName: string;

  @Prop({ index: true })
  genericName?: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  label: Record<string, any>;
}
```

## Testing Strategy

### 1. Unit Tests

```typescript
describe('DrugsService', () => {
  let service: DrugsService;
  let model: Model<DrugDocument>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DrugsService,
        { provide: getModelToken(Drug.name), useValue: mockModel }
      ],
    }).compile();
  });
});
```

### 2. E2E Tests

```typescript
describe('Drugs API (e2e)', () => {
  it('/drugs (GET)', () => {
    return request(app.getHttpServer())
      .get('/drugs')
      .expect(200)
      .expect(res => {
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('pagination');
      });
  });
});
```

## Best Practices Implemented

1. **Validation at the Edge**: Validate as early as possible
2. **Fail Fast**: Return errors immediately on invalid input
3. **Sanitize Twice**: On input and output
4. **Type Safety**: Leverage TypeScript throughout
5. **Consistent Responses**: Uniform API response structure
6. **Error Transparency**: Clear validation error messages
7. **Performance**: Caching at multiple levels
8. **Security in Depth**: Multiple layers of protection

## Areas for Enhancement

1. **Expand DTO Coverage**: Create DTOs for all endpoints
2. **Custom Validators**: Domain-specific validation rules
3. **API Versioning**: Implement version strategy
4. **Request ID Tracking**: Add correlation IDs
5. **OpenAPI Documentation**: Auto-generate API docs
6. **Field-Level Permissions**: Implement RBAC
7. **Audit Logging**: Track data modifications
8. **Input Transformation**: More sophisticated data mapping

## Configuration Management

### Environment Variables

```typescript
// env.validation.ts
export class EnvironmentVariables {
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number;

  @IsUrl({ require_tld: false })
  @IsOptional()
  MONGODB_URI?: string;

  @IsEnum(['development', 'production', 'test'])
  NODE_ENV: string;
}
```

### Configuration Modules

```typescript
// app.config.ts
export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  environment: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api',
}));
```

## Performance Optimizations

1. **Database Indexing**: Strategic indexes on frequently queried fields
2. **Lean Queries**: Using `.lean()` for read-only operations
3. **Projection**: Selecting only required fields
4. **Aggregation Pipeline**: Efficient complex queries
5. **Connection Pooling**: Reusing database connections
6. **Response Compression**: Gzip for large responses
7. **Caching Strategy**: Multi-tier caching approach

## Monitoring and Health Checks

### Health Check Endpoints

```typescript
GET /api/health          # Overall system health
GET /api/health/liveness # Application liveness
GET /api/health/readiness # Ready to serve traffic
GET /api/health/cache    # Cache system health
```

### Metrics Collection

- Request duration tracking
- Error rate monitoring
- Cache hit/miss ratios
- Database query performance
- Memory usage tracking

## Conclusion

The NestJS API implementation follows industry best practices for building secure, scalable, and maintainable APIs. The validation strategy provides multiple layers of protection against common vulnerabilities while maintaining good performance and developer experience. Regular security audits and updates to dependencies ensure the API remains secure over time.