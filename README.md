# drugfacts.wiki - Professional Drug Information Platform

A comprehensive drug information platform providing healthcare professionals with easy access to FDA drug labeling information, prescribing guidelines, and clinical data.

## Table of Contents
- [Quick Start Guide](#quick-start-guide)
- [AI Integration](#ai-integration-decisions-and-rationale)
- [Architecture Overview](#architecture-overview)
- [SEO Optimization](#seo-optimization-approach)
- [Performance & Caching](#performance-considerations-and-caching-strategies)
- [Known Limitations & Improvements](#known-limitations-and-potential-improvements)

## Quick Start Guide

Get the entire platform running in under 5 minutes:

### Prerequisites
- Docker and Docker Compose installed
- Port 3000, 3001, and 27018 available

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/drugfacts.git
cd drugfacts
```

### 2. Start All Services
```bash
docker-compose up -d
```

This single command will:
- Start MongoDB with authentication
- Initialize the database with proper user permissions
- Automatically seed the database with drug data
- Start the NestJS backend API
- Start the Next.js frontend
- Configure Nginx as a reverse proxy
- Set up Redis for caching (optional)

### 3. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/health

### 4. Verify Installation
```bash
# Check all services are running
docker-compose ps

# Test the API
curl http://localhost:3001/api/drugs?limit=3
```

That's it! The platform is now fully operational with sample drug data.

## AI Integration Decisions and Rationale

### 1. AI-Enhanced Database Seeder
**Decision**: Implemented an AI-powered seeder that can classify and enhance drug information during import.

**Rationale**:
- **Automated Classification**: Uses OpenAI/OpenPipe to automatically categorize drugs by therapeutic class
- **Data Enhancement**: Enriches drug labels with structured metadata for better searchability
- **Quality Control**: AI validates and standardizes drug information formats

**Implementation**:
```yaml
# Run AI-enhanced seeder
docker-compose --profile ai-seeder run --rm ai-seeder
```

### 2. MCP (Model Context Protocol) Integration
**Decision**: Integrated MCP tools for AI-assisted development and maintenance.

**Rationale**:
- **Code Generation**: AI can help generate boilerplate code for new drug endpoints
- **Documentation**: Automated generation of API documentation
- **Testing**: AI-assisted test case generation

**Architecture**:
```
backend/drugfacts-api/src/mcp/
├── mcp.module.ts          # MCP module configuration
├── mcp.service.ts         # Core MCP service
└── mcp.controller.ts      # MCP endpoints
```

### 3. Content Processing Optimization
**Decision**: AI-powered content extraction and summarization for drug labels.

**Rationale**:
- **Readability**: Converts complex FDA labels into digestible sections
- **Highlighting**: AI identifies and highlights critical safety information
- **Searchability**: Generates semantic search vectors for drug information

## Architecture Overview

### System Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Next.js SSR    │────▶│  NestJS API     │────▶│    MongoDB      │
│  (Frontend)     │     │  (Backend)      │     │   (Database)    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                         │
        │                       │                         │
        ▼                       ▼                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│     Nginx       │     │     Redis       │     │   PostgreSQL    │
│ (Reverse Proxy) │     │   (Caching)     │     │   (Optional)    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Key Technical Decisions

#### 1. **Next.js with App Router (Frontend)**
- **Server-Side Rendering**: Optimal SEO and initial page load performance
- **React Server Components**: Reduced client-side JavaScript
- **Built-in Image Optimization**: Automatic image format conversion and lazy loading
- **API Routes**: Simplified backend integration

#### 2. **NestJS (Backend)**
- **Modular Architecture**: Clean separation of concerns
- **Built-in Validation**: DTOs with class-validator
- **OpenAPI Support**: Automatic API documentation
- **Microservices Ready**: Easy to scale individual services

#### 3. **MongoDB (Primary Database)**
- **Document Structure**: Perfect for complex drug label data
- **Full-Text Search**: Built-in text search capabilities
- **Flexible Schema**: Easy to add new drug attributes
- **Aggregation Pipeline**: Complex queries for analytics

#### 4. **Docker Compose Orchestration**
- **Single Command Deployment**: All services start with one command
- **Health Checks**: Ensures services start in correct order
- **Automatic Seeding**: Database populated on first run
- **Volume Management**: Persistent data across restarts

### API Design
```typescript
// RESTful endpoints with clear naming
GET    /api/drugs                 // List all drugs with pagination
GET    /api/drugs/:slug           // Get specific drug by slug
GET    /api/drugs/search          // Search drugs
GET    /api/therapeutic-classes   // List therapeutic classes
GET    /api/manufacturers         // List manufacturers

// Response format
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "hasNext": true
  }
}
```

## SEO Optimization Approach

### 1. **Server-Side Rendering**
Every drug page is fully rendered on the server with complete meta tags:

```tsx
// app/drugs/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const drug = await getDrugData(params.slug);
  return {
    title: `${drug.name} - Prescribing Information | drugfacts.wiki`,
    description: drug.summary,
    openGraph: {
      title: drug.name,
      description: drug.summary,
      type: 'article',
    },
  };
}
```

### 2. **Structured Data (JSON-LD)**
Rich snippets for search engines:

```json
{
  "@context": "https://schema.org",
  "@type": "Drug",
  "name": "Mounjaro",
  "activeIngredient": "tirzepatide",
  "prescribingInfo": "...",
  "manufacturer": {
    "@type": "Organization",
    "name": "Eli Lilly"
  }
}
```

### 3. **URL Structure**
- Clean, descriptive URLs: `/drugs/mounjaro-d2d7da5`
- Therapeutic class pages: `/therapeutic-classes/glp-1-agonists`
- Manufacturer pages: `/manufacturers/eli-lilly`

### 4. **Technical SEO**
- **Sitemap Generation**: Automatic sitemap.xml generation
- **Robots.txt**: Proper crawler directives
- **Canonical URLs**: Prevent duplicate content issues
- **Mobile Optimization**: Responsive design with viewport meta tag

### 5. **Performance SEO**
- **Core Web Vitals**: Optimized for LCP, FID, and CLS
- **Image Optimization**: Next.js Image component with lazy loading
- **Font Optimization**: Preloaded critical fonts
- **Critical CSS**: Inline above-the-fold styles

## Performance Considerations and Caching Strategies

### 1. **Multi-Layer Caching Architecture**

#### Browser Caching
```nginx
# Static assets cached for 1 year
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### Redis Caching
```typescript
// Enhanced Redis cache with compression
@Injectable()
export class EnhancedRedisCacheService {
  // Automatic compression for large data
  // Tag-based cache invalidation
  // Stale-while-revalidate pattern
}
```

#### MongoDB Query Caching
```typescript
// Indexes for common queries
db.drugs.createIndex({ slug: 1 }, { unique: true });
db.drugs.createIndex({ drugName: 'text', genericName: 'text' });
db.drugs.createIndex({ therapeuticClass: 1 });
```

### 2. **Performance Optimizations**

#### Database
- **Connection Pooling**: Reuse database connections
- **Aggregation Pipeline**: Efficient data transformation
- **Projection**: Return only needed fields
- **Pagination**: Limit results with cursor-based pagination

#### API
- **Response Compression**: Gzip compression for API responses
- **Field Filtering**: Allow clients to request specific fields
- **Rate Limiting**: Prevent API abuse
- **Health Checks**: Quick liveness/readiness probes

#### Frontend
- **Code Splitting**: Dynamic imports for route-based splitting
- **Image Optimization**: WebP format with fallbacks
- **Prefetching**: Next.js Link prefetching for navigation
- **Bundle Optimization**: Tree shaking and minification

### 3. **Caching Strategies**

```typescript
// Cache drug data for 1 hour
const CACHE_TTL = 3600; // seconds

// Cache key patterns
generateDrugCacheKey(slug: string): string {
  return `drug:full:${slug}`;
}

// Cache warming for popular drugs
async warmupCache(popularDrugs: string[]) {
  // Pre-populate cache with frequently accessed drugs
}
```

## Known Limitations and Potential Improvements

### Current Limitations

1. **Search Functionality**
   - Basic text search only
   - No fuzzy matching or typo correction
   - Limited filtering options

2. **Data Coverage**
   - Currently only 8 sample drugs
   - Manual data import process
   - No real-time FDA updates

3. **Authentication**
   - No user authentication system
   - No personalized features
   - No audit trail for data access

4. **Mobile Experience**
   - Limited offline functionality
   - No native mobile app
   - Complex tables not optimized for small screens

### Potential Improvements

1. **Enhanced Search**
   ```typescript
   // Elasticsearch integration for advanced search
   - Fuzzy matching
   - Synonyms and related terms
   - Faceted search with filters
   - Search suggestions
   ```

2. **Real-time Data Updates**
   ```typescript
   // FDA API integration
   - Automated daily imports
   - Change detection and alerts
   - Version history tracking
   ```

3. **AI-Powered Features**
   ```typescript
   // Drug interaction checker
   - AI-based interaction analysis
   - Severity categorization
   - Alternative suggestions
   
   // Personalized recommendations
   - Similar drug suggestions
   - Dosing calculators
   - Clinical decision support
   ```

4. **Performance Enhancements**
   ```typescript
   // GraphQL implementation
   - Reduce over-fetching
   - Batch queries
   - Real-time subscriptions
   
   // Edge caching with CDN
   - Global distribution
   - Reduced latency
   - DDoS protection
   ```

5. **Enterprise Features**
   ```typescript
   // Multi-tenancy
   - Organization management
   - Role-based access control
   - API key management
   
   // Compliance and audit
   - HIPAA compliance logging
   - Data access audit trail
   - Export capabilities
   ```

6. **Analytics and Monitoring**
   ```typescript
   // Usage analytics
   - Most searched drugs
   - User journey tracking
   - Performance metrics
   
   // Business intelligence
   - Drug usage trends
   - Regional variations
   - Prescriber patterns
   ```

## Development

### Local Development
```bash
# Frontend development
cd frontend
npm install
npm run dev

# Backend development
cd backend/drugfacts-api
npm install
npm run start:dev
```

### Testing
```bash
# Run backend tests
cd backend/drugfacts-api
npm run test

# Run e2e tests
npm run test:e2e
```

### Environment Variables
```env
# Backend
MONGODB_URL=mongodb://localhost:27017/drug_facts
PORT=3001
NODE_ENV=development

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# AI Features (optional)
OPENAI_API_KEY=your-key-here
OPENPIPE_API_KEY=your-key-here
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- FDA for providing drug label data
- OpenAI for AI integration capabilities
- The open-source community for amazing tools and libraries