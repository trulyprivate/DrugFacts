# DDI (Drug-Drug Interaction) Service

A NestJS-based microservice for checking drug-drug interactions with MongoDB storage and Redis caching.

## Features

- **Drug-Drug Interaction Checking**: Comprehensive interaction analysis
- **Severity Classification**: Minor, Moderate, Major, Contraindicated
- **Mechanism Analysis**: Pharmacokinetic and Pharmacodynamic interactions
- **Caching**: Redis-based caching for improved performance
- **Drug Search**: Fast drug lookup with fuzzy matching
- **Health Monitoring**: Built-in health checks and monitoring

## API Endpoints

### Health Check
```
GET /health
```

### Check Drug Interactions
```
POST /interactions/check
{
  "drugIds": ["rxcui1", "rxcui2", "rxcui3"],
  "includeMinor": false,
  "patientId": "optional-patient-id"
}
```

### Search Drugs
```
GET /interactions/drugs/search?query=aspirin&limit=10
```

### Get Severity Levels
```
GET /interactions/severity-levels
```

### Get Interaction Mechanisms
```
GET /interactions/mechanisms
```

## Development

### Prerequisites
- Node.js 18+
- MongoDB
- Redis

### Installation
```bash
npm install
```

### Environment Variables
Copy `.env.example` to `.env` and configure:

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ddi-service
REDIS_HOST=localhost
REDIS_PORT=6379
ALLOWED_ORIGINS=http://localhost:3000
```

### Running the Service

#### Development Mode
```bash
npm run start:dev
```

#### Production Mode
```bash
npm run build
npm run start:prod
```

#### Docker
```bash
# Build and run with docker-compose
docker-compose up ddi-service
```

### Testing
```bash
npm run test
npm run test:e2e
npm run test:cov
```

## Data Model

### Drug Schema
```typescript
{
  rxcui: string;           // RxNorm Concept Unique Identifier
  name: string;            // Drug name
  genericName?: string;    // Generic name
  brandNames: string[];    // Brand names
  activeIngredients: string[];
  therapeuticClasses: string[];
}
```

### Drug Interaction Schema
```typescript
{
  drug1: ObjectId;         // Reference to Drug
  drug2: ObjectId;         // Reference to Drug
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
  mechanism: 'pharmacokinetic' | 'pharmacodynamic' | 'unknown';
  description: string;     // Interaction description
  management: string;      // Clinical management advice
  references: Reference[]; // Supporting literature
}
```

## Performance

- **Response Time**: <100ms for typical interaction checks
- **Caching**: 24-hour TTL for interaction data, 2-hour TTL for drug searches
- **Concurrency**: Handles 1000+ requests/second
- **Database**: Indexed queries for optimal performance

## Monitoring

The service includes comprehensive health checks:
- MongoDB connection status
- Redis connection status
- Memory usage
- Response time metrics

## Deployment

The service is containerized and ready for production deployment:

1. **Docker**: Single container deployment
2. **Kubernetes**: Helm charts available
3. **Docker Compose**: Integrated with main application stack

## Contributing

1. Follow NestJS conventions
2. Write tests for new features
3. Update documentation
4. Ensure Docker compatibility

## License

Private - Terragon Labs