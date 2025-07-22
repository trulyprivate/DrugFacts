# Docker Usage Guide

This guide explains how to use Docker and Docker Compose for the DrugFacts application.

## Prerequisites

- Docker Engine 20.10+ installed
- Docker Compose 2.0+ installed
- For AI-enhanced features: OpenAI API key and/or OpenPipe API key

## Quick Start

### Development Mode

1. **Basic development setup (without AI):**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d mongodb
   docker-compose -f docker-compose.dev.yml --profile basic-seeder up db-seeder
   npm run dev
   ```

2. **AI-enhanced development setup:**
   ```bash
   # Create .env file with your API keys
   echo "OPENAI_API_KEY=your_openai_key_here" >> .env
   echo "OPENPIPE_API_KEY=your_openpipe_key_here" >> .env
   
   # Start services
   docker-compose -f docker-compose.dev.yml up -d mongodb
   docker-compose -f docker-compose.dev.yml --profile ai-seeder up ai-seeder
   npm run dev
   ```

3. **View MongoDB data (development only):**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d mongo-express
   # Access at http://localhost:8081
   ```

### Production Mode

1. **Build and run with basic seeder:**
   ```bash
   docker-compose --profile basic-seeder up -d
   ```

2. **Build and run with AI-enhanced seeder:**
   ```bash
   # Ensure .env file has API keys
   docker-compose --profile ai-seeder up -d
   ```

## Service Profiles

The Docker setup uses profiles to control which services start:

- **No profile**: Starts core services (app, mongodb, redis, postgres, nginx)
- **`basic-seeder`**: Uses the basic MongoDB importer without AI
- **`ai-seeder`**: Uses the AI-enhanced importer with therapeutic classification

## Environment Variables

### Core Application
- `NODE_ENV`: Environment mode (production/development)
- `PORT`: Application port (default: 5005)
- `MONGODB_URL`: MongoDB connection string
- `MONGODB_DB_NAME`: Database name (default: drug_facts)

### AI Enhancement
- `OPENAI_API_KEY`: OpenAI API key for AI classification
- `OPENPIPE_API_KEY`: OpenPipe API key (optional)
- `ENABLE_AI_CLASSIFICATION`: Enable/disable AI features (true/false)
- `AI_LOG_LEVEL`: Logging level (DEBUG/INFO/WARNING/ERROR)

## Common Commands

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f ai-seeder
```

### Rebuild services
```bash
# Rebuild specific service
docker-compose build ai-seeder

# Rebuild and restart
docker-compose up -d --build ai-seeder
```

### Clean up
```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Run manual import
```bash
# Basic import
docker-compose run --rm db-seeder python hardened_mongo_import.py -j /app/data/Labels.json -v

# AI-enhanced import
docker-compose run --rm ai-seeder python run_enhanced_import.py -v
```

## Troubleshooting

### MongoDB connection issues
```bash
# Check MongoDB health
docker-compose ps mongodb
docker-compose logs mongodb

# Test connection
docker exec -it drugfacts-mongodb mongosh --eval "db.adminCommand('ping')"
```

### AI seeder failures
```bash
# Check logs
docker-compose logs ai-seeder

# Verify API keys
docker-compose run --rm ai-seeder env | grep -E "(OPENAI|OPENPIPE)"

# Run with debug logging
docker-compose run --rm -e AI_LOG_LEVEL=DEBUG ai-seeder python run_enhanced_import.py -v
```

### Port conflicts
If ports are already in use, modify the port mappings in docker-compose.yml:
```yaml
ports:
  - "5006:5005"  # Change host port from 5005 to 5006
```

## Production Deployment

For production deployment:

1. Use proper MongoDB authentication
2. Set secure passwords in environment variables
3. Enable SSL/TLS for nginx
4. Use Docker secrets for sensitive data
5. Set up proper logging and monitoring

See `DEPLOYMENT.md` for detailed production setup instructions.