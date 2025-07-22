# Drug Label Import Guide

This guide explains how to import drug label data into MongoDB using the enhanced import script with AI classification capabilities.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Usage](#detailed-usage)
- [Configuration](#configuration)
- [AI Classification](#ai-classification)
- [Troubleshooting](#troubleshooting)
- [Examples](#examples)

## Prerequisites

### System Requirements
- Python 3.8 or higher
- MongoDB 4.4+ (local or remote)
- At least 4GB RAM for AI classification
- Internet connection (for AI features)

### Required Python Packages
```bash
pip install pymongo pyyaml openai numpy scikit-learn python-dotenv
```

### Environment Setup
Create a `.env` file in the project root:
```bash
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017/
MONGODB_DB_NAME=drug_facts
MONGODB_COLLECTION_NAME=drugs

# OpenAI Configuration (for AI classification)
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Disable AI classification
ENABLE_AI_CLASSIFICATION=true
```

## Quick Start

### Basic Import
```bash
# Import using default settings
python run_enhanced_import.py

# Import a specific JSON file
python run_enhanced_import.py -j data/drugs/Labels.json

# Import without AI classification
python run_enhanced_import.py --disable-ai
```

### Import to Remote MongoDB
```bash
python run_enhanced_import.py \
  --mongo-uri "mongodb+srv://username:password@cluster.mongodb.net/" \
  --db-name production_drugs \
  --collection-name drug_labels
```

## Detailed Usage

### Command Line Arguments

```bash
python run_enhanced_import.py [OPTIONS]
```

#### File Options
- `-j, --json-file PATH`: Path to JSON file containing drug labels (default: `data/drugs/Labels.json`)
- `-s, --schema-file PATH`: Path to YAML schema file (default: `drug_label_schema.yaml`)

#### MongoDB Options
- `--mongo-uri URI`: MongoDB connection URI (default: `mongodb://localhost:27017/`)
- `--db-name NAME`: Database name (default: `drug_facts`)
- `--collection-name NAME`: Collection name (default: `drugs`)

#### AI Options
- `--disable-ai`: Disable AI classification for therapeutic categories
- `--ai-model MODEL`: Specify AI model (default: `gpt-4`)
- `--ai-temperature FLOAT`: AI temperature setting (default: 0.3)

#### Other Options
- `-v, --verbose`: Enable verbose logging
- `--dry-run`: Validate and process without making database changes
- `--batch-size INT`: Number of documents to process at once (default: 100)
- `--skip-validation`: Skip schema validation
- `--force-update`: Update all documents even if unchanged

### Input File Format

The JSON file should contain an array of drug label objects:

```json
[
  {
    "drugName": "Mounjaro",
    "genericName": "tirzepatide",
    "activeIngredient": "tirzepatide",
    "manufacturer": "Eli Lilly and Company",
    "therapeuticClass": "GLP-1 receptor agonist",
    "indicationsAndUsage": "...",
    "dosageAndAdministration": "...",
    "warnings": "...",
    "adverseReactions": "...",
    "setId": "d2d7da5e-1234-5678-90ab-cdef12345678"
  }
]
```

## Configuration

### Schema File (drug_label_schema.yaml)

The schema file defines required and optional fields, validation rules, and AI classification settings:

```yaml
required_fields:
  - drugName
  - setId

optional_fields:
  - genericName
  - activeIngredient
  - manufacturer
  - therapeuticClass
  - indicationsAndUsage
  - dosageAndAdministration
  - warnings
  - contraindications
  - adverseReactions
  - drugInteractions
  - boxedWarning

ai_classification:
  enabled: true
  fields_to_analyze:
    - indicationsAndUsage
    - activeIngredient
    - clinicalPharmacology
  confidence_threshold: 0.8
```

### MongoDB Connection

#### Local MongoDB
```bash
# Default connection
python run_enhanced_import.py

# Custom local instance
python run_enhanced_import.py --mongo-uri mongodb://localhost:27017/
```

#### MongoDB Atlas
```bash
python run_enhanced_import.py \
  --mongo-uri "mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority"
```

#### Docker MongoDB
```bash
# If MongoDB is running in Docker
python run_enhanced_import.py --mongo-uri mongodb://localhost:27017/
```

## AI Classification

### How It Works

The AI classification feature analyzes drug information to:
1. Identify therapeutic categories
2. Extract mechanism of action
3. Classify drug interactions
4. Generate searchable tags

### AI Fields Added

When AI classification is enabled, the following fields are added:
- `aiClassification.therapeuticCategories`: Array of therapeutic categories
- `aiClassification.mechanismOfAction`: Extracted mechanism description
- `aiClassification.primaryIndications`: Main uses of the drug
- `aiClassification.drugClass`: Pharmacological classification
- `aiClassification.tags`: Searchable tags
- `aiClassification.confidence`: Confidence score (0-1)
- `aiClassification.timestamp`: When classification was performed

### Disabling AI

To import without AI classification:
```bash
# Command line
python run_enhanced_import.py --disable-ai

# Environment variable
export ENABLE_AI_CLASSIFICATION=false
python run_enhanced_import.py
```

## Examples

### Example 1: Basic Import
```bash
# Import default Labels.json with AI classification
python run_enhanced_import.py -v
```

### Example 2: Import Single Drug
```bash
# Import a single drug file
python run_enhanced_import.py \
  -j data/drugs/mounjaro-d2d7da5.json \
  -v
```

### Example 3: Production Import
```bash
# Import to production with specific settings
python run_enhanced_import.py \
  -j data/drugs/Labels.json \
  --mongo-uri "$PROD_MONGODB_URL" \
  --db-name production \
  --collection-name drug_labels \
  --batch-size 50 \
  -v
```

### Example 4: Dry Run Testing
```bash
# Test import without making changes
python run_enhanced_import.py \
  -j data/drugs/test_labels.json \
  --dry-run \
  -v
```

### Example 5: Update Existing Data
```bash
# Force update all documents with new AI classification
python run_enhanced_import.py \
  --force-update \
  --ai-model gpt-4 \
  -v
```

## Output and Logging

### Console Output
```
Importing drug labels from: data/drugs/Labels.json
Using schema: drug_label_schema.yaml
Target database: mongodb://localhost:27017/drug_facts.drugs
AI classification: enabled

Processing 1523 documents...
[====================] 100% Complete

==================================================
IMPORT SUMMARY
==================================================
Documents inserted: 1200
Documents updated: 300
Documents skipped (no changes): 23
Documents failed: 0
Documents AI enhanced: 1500
Documents AI failed: 0
==================================================
```

### Log Files
Logs are written to:
- `logs/import_YYYYMMDD_HHMMSS.log`: Detailed import log
- `logs/ai_classification.log`: AI classification details
- `logs/errors.log`: Error details

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
```
Error: Failed to connect to MongoDB
```
**Solution**: Check MongoDB is running and connection string is correct
```bash
# Test connection
mongosh "your_connection_string"
```

#### 2. AI Classification Failed
```
Error: OpenAI API error
```
**Solution**: Check your OpenAI API key and internet connection
```bash
# Test API key
export OPENAI_API_KEY=your_key
python -c "import openai; print('API key valid')"
```

#### 3. Memory Issues
```
Error: Out of memory
```
**Solution**: Reduce batch size
```bash
python run_enhanced_import.py --batch-size 50
```

#### 4. Schema Validation Errors
```
Error: Document validation failed
```
**Solution**: Check your JSON matches the schema or skip validation
```bash
python run_enhanced_import.py --skip-validation
```

### Debug Mode
For detailed debugging:
```bash
# Maximum verbosity
export AI_LOG_LEVEL=DEBUG
python run_enhanced_import.py -v

# Save debug output
python run_enhanced_import.py -v 2>&1 | tee import_debug.log
```

## Performance Tips

1. **Batch Processing**: Use appropriate batch sizes
   - Small datasets (<1000): `--batch-size 100`
   - Large datasets (>10000): `--batch-size 500`

2. **AI Optimization**: 
   - Disable AI for initial import: `--disable-ai`
   - Run AI classification separately later

3. **MongoDB Optimization**:
   - Create indexes before import
   - Use connection pooling for large imports

4. **Resource Usage**:
   - AI classification uses ~1-2 API calls per drug
   - Expect ~$0.01-0.02 per drug for AI classification
   - Processing speed: ~10-50 drugs/minute with AI

## Best Practices

1. **Always Test First**:
   ```bash
   python run_enhanced_import.py --dry-run -v
   ```

2. **Backup Before Import**:
   ```bash
   mongodump --db drug_facts --collection drugs
   ```

3. **Monitor Progress**:
   ```bash
   # In another terminal
   tail -f logs/import_*.log
   ```

4. **Validate Results**:
   ```bash
   # Check import results
   mongosh drug_facts --eval "db.drugs.countDocuments()"
   ```

## Support

For issues or questions:
1. Check the logs in the `logs/` directory
2. Review error messages with `-v` flag
3. Consult the MongoDB logs
4. Check AI API status and quotas