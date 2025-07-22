# DrugFacts API - NestJS Backend

A high-performance, production-ready REST API for drug information built with NestJS, MongoDB, and advanced caching strategies.

## 🚀 Features

- **RESTful API** for drug information with comprehensive search capabilities
- **Multi-level caching** (Memory → Redis → Database) for optimal performance
- **AI Integration** via Model Context Protocol (MCP) tools
- **Comprehensive error handling** with circuit breakers and retry logic
- **Security-first design** with rate limiting, input sanitization, and CSP headers
- **Health monitoring** endpoints for production deployments
- **Type-safe** with full TypeScript support

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 5.0+
- Redis 6.0+ (optional, falls back to memory cache)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend/drugfacts-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Required
   PORT=3001
   MONGODB_URL=mongodb://localhost:27017
   MONGODB_DB_NAME=drug_facts
   
   # Optional (see .env.example for all options)
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name drugfacts-mongo mongo:latest
   
   # Or use your local MongoDB installation
   ```

5. **Start Redis (optional)**
   ```bash
   # Using Docker
   docker run -d -p 6379:6379 --name drugfacts-redis redis:latest
   ```

## 🚦 Running the Application

### Development Mode
```bash
npm run start:dev
```
The API will be available at `http://localhost:3001`

### Production Mode
```bash
npm run build
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

## 📡 API Endpoints

### Drug Endpoints

#### Search Drugs
```http
GET /api/drugs?q=aspirin&limit=10&page=1&searchType=weighted
```
Query parameters:
- `q` - Search query (drug name, generic name, conditions, or symptoms)
- `therapeuticClass` - Filter by therapeutic class
- `manufacturer` - Filter by manufacturer
- `limit` - Results per page (1-100, default: 50)
- `page` - Page number (default: 1)
- `searchType` - Search algorithm (default: 'weighted')
  - `weighted` - Prioritizes drug names, then conditions in indications
  - `text` - Fast MongoDB full-text search
  - `standard` - Equal weight across all fields

Response:
```json
{
  "data": [
    {
      "drugName": "Aspirin",
      "genericName": "aspirin",
      "therapeuticClass": "Nonsteroidal Anti-inflammatory Drug",
      "manufacturer": "Bayer",
      "slug": "aspirin-12345"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Get Drug Details
```http
GET /api/drugs/aspirin-12345
```

Response:
```json
{
  "data": {
    "drugName": "Aspirin",
    "genericName": "aspirin",
    "activeIngredient": "Aspirin 325 mg",
    "indicationsAndUsage": "...",
    "dosageAndAdministration": "...",
    "warnings": "...",
    "adverseReactions": "...",
    "drugInteractions": "...",
    "contraindications": "...",
    "slug": "aspirin-12345"
  }
}
```

#### Get All Drugs (Index Format)
```http
GET /api/drugs/index
```

#### List Therapeutic Classes
```http
GET /api/drugs/therapeutic-classes
```

Response:
```json
{
  "data": [
    "Analgesics",
    "Antibiotics",
    "Antidepressants",
    "Cardiovascular Agents"
  ]
}
```

#### List Manufacturers
```http
GET /api/drugs/manufacturers
```

#### Get Drug Count
```http
GET /api/drugs/count
```

Response:
```json
{
  "count": 15000
}
```

### Health Check Endpoints

#### Basic Health Check
```http
GET /health
```

#### Liveness Probe (Kubernetes)
```http
GET /health/liveness
```

#### Readiness Probe (Kubernetes)
```http
GET /health/readiness
```

## 🔍 Enhanced Search Features

The API provides three search algorithms optimized for different use cases:

### Weighted Search (Default)
- **Best for**: Finding specific drugs or searching by conditions
- **How it works**: Prioritizes matches in this order:
  1. Exact drug name matches (highest weight)
  2. Partial drug name matches
  3. Generic name matches
  4. Active ingredient matches
  5. Conditions in indications and usage
  6. Other fields (therapeutic class, manufacturer)

### Text Search
- **Best for**: Fast searches across large datasets
- **How it works**: Uses MongoDB's full-text search with pre-configured weights
- **Performance**: Fastest option for large result sets

### Standard Search
- **Best for**: Broad searches where all fields are equally important
- **How it works**: Simple regex search across all fields

### Search Examples

```bash
# Search for a specific drug
GET /api/drugs?q=aspirin&searchType=weighted

# Search for drugs by condition
GET /api/drugs?q=diabetes&searchType=weighted

# Fast text search
GET /api/drugs?q=insulin&searchType=text

# Test search functionality
npm run test:search
```

## 🤖 MCP (Model Context Protocol) Integration

The API includes MCP tools for AI agents to interact with drug data:

### Available Tools

1. **drug_search** - Search for drugs with enhanced search capabilities
2. **drug_details** - Get detailed drug information
3. **check_drug_interactions** - Check interactions between multiple drugs

### Using MCP Tools

```javascript
// Search for drugs by condition
{
  "name": "drug_search",
  "arguments": {
    "query": "hypertension",
    "filters": {
      "limit": 10,
      "searchType": "weighted"
    }
  }
}
```

## 🏗️ Architecture

### Caching Strategy

```
Request → Memory Cache (L1) → Redis Cache (L2) → MongoDB (L3)
   ↓           ↓ 5 min              ↓ 1 hour
Response ← Cache Hit ←──────── Cache Hit ←───── Database Query
```

- **Memory Cache**: 5-minute TTL for hot data
- **Redis Cache**: 1-hour TTL for frequently accessed data
- **Static Data**: 24-hour cache for therapeutic classes and manufacturers

### Error Handling

- **Global Exception Filter**: Catches and formats all errors
- **Circuit Breaker**: Prevents cascading failures
- **Retry Logic**: Automatic retry with exponential backoff
- **Detailed Logging**: Winston logger for debugging

### Security Features

- **Helmet.js**: Security headers including CSP
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Sanitization**: XSS prevention
- **Output Sanitization**: Removes sensitive fields
- **CORS**: Configurable origins

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URL` | MongoDB connection string | mongodb://localhost:27017 |
| `MONGODB_DB_NAME` | Database name | drug_facts |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |
| `CORS_ORIGINS` | Allowed origins | http://localhost:3000 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

See `.env.example` for the complete list.

## 📊 Performance

- **Response Times**: <50ms for cached requests
- **Throughput**: 1000+ requests/second (with caching)
- **Cache Hit Rate**: 80%+ for common queries
- **Memory Usage**: ~200MB baseline

## 🐛 Debugging

### Enable Debug Logs
```bash
DEBUG=* npm run start:dev
```

### View Logs
```bash
# Application logs
tail -f logs/combined.log

# Error logs only
tail -f logs/error.log
```

### Common Issues

1. **MongoDB Connection Failed**
   - Check MongoDB is running: `mongosh --eval "db.version()"`
   - Verify connection string in `.env`

2. **Redis Connection Failed**
   - The app will fall back to memory cache
   - Check Redis: `redis-cli ping`

3. **Port Already in Use**
   - Change PORT in `.env`
   - Kill process: `lsof -ti:3001 | xargs kill`

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Building for Production

```bash
# Build the application
npm run build

# Run production build
npm run start:prod

# Using PM2
pm2 start dist/main.js --name drugfacts-api
```

## 🐳 Docker

```bash
# Build image
docker build -t drugfacts-api .

# Run container
docker run -p 3001:3001 \
  -e MONGODB_URL=mongodb://host.docker.internal:27017 \
  drugfacts-api
```

## 📈 Monitoring

### Health Check Script
```bash
#!/bin/bash
curl -f http://localhost:3001/health || exit 1
```

### Prometheus Metrics (Coming Soon)
```http
GET /metrics
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Create an issue in the repository
- Check the [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)
- Review the [API Documentation](./docs/API.md)