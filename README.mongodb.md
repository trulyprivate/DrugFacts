# MongoDB Setup and Migration Guide

This guide covers setting up MongoDB for the DrugFacts application and migrating from JSON file storage to MongoDB.

## Quick Start (Development)

### 1. Start MongoDB and Seed Database

```bash
# Start MongoDB with automatic database seeding
./scripts/setup-mongodb-dev.sh

# Or clean start (removes existing data)
./scripts/setup-mongodb-dev.sh --clean
```

This script will:
- Start MongoDB in Docker
- Seed the database with drug data from `data/drugs/Labels.json`
- Start Mongo Express for database management
- Provide connection details

### 2. Access Services

- **MongoDB**: `mongodb://localhost:27017/drug_facts`
- **Mongo Express**: http://localhost:8081 (database management UI)

### 3. Stop Services

```bash
docker-compose -f docker-compose.dev.yml down
```

## Manual Setup

### 1. Start MongoDB Only

```bash
docker-compose -f docker-compose.dev.yml up -d mongodb
```

### 2. Seed Database Manually

#### Using Enhanced Import Script (Recommended)

For AI-powered classification and enhanced import features:

```bash
# Basic import with AI classification
python run_enhanced_import.py

# Import without AI classification
python run_enhanced_import.py --disable-ai

# See IMPORT_GUIDE.md for detailed usage
```

#### Using Basic Import Script

```bash
# Using Python script directly
python hardened_mongo_import.py \
  -j data/drugs/Labels.json \
  -s drug_label_schema.yaml \
  --mongo-uri mongodb://localhost:27017/ \
  --db-name drug_facts \
  --collection-name drugs \
  -v

# Or using Docker
docker-compose -f docker-compose.dev.yml up --build db-seeder
```

**Note**: For comprehensive import options and AI classification features, see [IMPORT_GUIDE.md](./IMPORT_GUIDE.md).

## Production Setup

### 1. Environment Variables

Set these environment variables for production:

```bash
MONGODB_URL=mongodb://localhost:27017  # or your MongoDB Atlas URL
MONGODB_DB_NAME=drug_facts
MONGODB_COLLECTION_NAME=drugs
```

### 2. Start Production Services

```bash
docker-compose up -d
```

## Database Schema

The MongoDB collection uses the following structure:

```javascript
{
  // Required fields
  "drugName": "Emgality",
  "setId": "33a147be-233a-40e8-a55e-e40936e28db0",
  "slug": "emgality-33a147b",
  
  // Optional fields
  "labeler": "Eli Lilly and Company",
  "therapeuticClass": "CGRP Antagonist",
  "manufacturer": "Eli Lilly and Company",
  
  // Structured label data
  "label": {
    "genericName": "galcanezumab-gnlm",
    "indicationsAndUsage": "...",
    "dosageAndAdministration": "...",
    // ... other label fields
  },
  
  // Legacy compatibility fields
  "genericName": "galcanezumab-gnlm",
  "activeIngredient": "galcanezumab-gnlm",
  // ... other legacy fields
  
  // Metadata (added automatically)
  "_hash": "sha256-hash-of-content",
  "_created_at": "2024-01-01T00:00:00.000Z",
  "_updated_at": "2024-01-01T00:00:00.000Z"
}
```

## Database Indexes

The following indexes are automatically created:

- **Unique index on `slug`**: Ensures each drug has a unique URL identifier
- **Text index on searchable fields**: Enables full-text search across drug names, generic names, and therapeutic classes
- **Index on `therapeuticClass`**: Optimizes filtering by therapeutic class
- **Index on `manufacturer`**: Optimizes filtering by manufacturer

## Migration Features

### Data Validation

The migration script validates all data against the schema defined in `drug_label_schema.yaml`:

- Required fields validation
- Data type validation  
- Format validation (UUIDs, slugs, etc.)
- Comprehensive error reporting

### Deduplication

- Uses `slug` field as unique identifier
- Compares content hashes to detect changes
- Updates only when content has changed
- Preserves creation timestamps

### Error Handling

- Validates each document before insertion
- Reports validation errors with details
- Continues processing on individual failures
- Provides comprehensive import statistics

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
docker-compose -f docker-compose.dev.yml ps mongodb

# View MongoDB logs
docker-compose -f docker-compose.dev.yml logs mongodb

# Test connection
mongosh mongodb://localhost:27017/drug_facts
```

### Seeding Issues

```bash
# Check seeder logs
docker-compose -f docker-compose.dev.yml logs db-seeder

# Run seeder with verbose output
python hardened_mongo_import.py -j data/drugs/Labels.json -s drug_label_schema.yaml -v
```

### Data Validation Errors

The seeder will report specific validation errors. Common issues:

- Missing required fields (`drugName`, `setId`, `slug`)
- Invalid UUID format in `setId`
- Invalid slug format (must be lowercase, hyphen-separated)
- Missing or corrupted JSON data

### Performance Issues

- Ensure indexes are created (automatic on first run)
- Monitor collection size: `db.drugs.stats()`
- Check query performance: `db.drugs.find({...}).explain()`

## Development Tools

### Mongo Express

Access the database management UI at http://localhost:8081 when running the development setup.

### MongoDB Compass

Connect to `mongodb://localhost:27017` using MongoDB Compass for advanced database management.

### Command Line

```bash
# Connect to database
mongosh mongodb://localhost:27017/drug_facts

# Basic queries
db.drugs.countDocuments()
db.drugs.findOne()
db.drugs.find({"drugName": "Emgality"})
db.drugs.find({"therapeuticClass": "CGRP Antagonist"})
```

## Migration Checklist

- [ ] MongoDB is running and accessible
- [ ] Drug data files exist in `data/drugs/`
- [ ] Schema file `drug_label_schema.yaml` is present
- [ ] Database seeding completed successfully
- [ ] Indexes are created
- [ ] Application environment variables are set
- [ ] Connection from application is working
- [ ] Data integrity validation passed

## Next Steps

After successful MongoDB setup:

1. **Update Application Code**: Modify `lib/drugs.ts` to use MongoDB instead of JSON files
2. **Environment Configuration**: Set MongoDB connection strings in your deployment environment
3. **Testing**: Run comprehensive tests to ensure data integrity
4. **Monitoring**: Set up database monitoring and backup procedures
5. **Documentation**: Update API documentation to reflect any changes