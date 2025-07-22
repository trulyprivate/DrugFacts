#!/bin/bash
# Script to check if database is already seeded and seed if empty

# MongoDB connection details
MONGODB_URL="${MONGODB_URL:-mongodb://drugfacts_user:drugfacts_password@mongodb:27017/drug_facts}"
MONGODB_DB_NAME="${MONGODB_DB_NAME:-drug_facts}"

# Check if database already has data
echo "Checking if database needs seeding..."
python3 -c "
from pymongo import MongoClient
import sys

try:
    client = MongoClient('$MONGODB_URL')
    db = client['$MONGODB_DB_NAME']
    count = db.drugs.count_documents({})
    print(f'Found {count} documents in drugs collection')
    
    if count > 0:
        print('Database already seeded. Skipping...')
        sys.exit(1)
    else:
        print('Database is empty. Proceeding with seeding...')
        sys.exit(0)
except Exception as e:
    print(f'Error checking database: {e}')
    sys.exit(2)
"

# Check the exit code
if [ $? -eq 0 ]; then
    echo "Running database seeder..."
    python hardened_mongo_import.py -j /app/data/Labels.json -s /app/drug_label_schema.yaml --mongo-uri "${MONGODB_URL}" --db-name "${MONGODB_DB_NAME}" --collection-name "${MONGODB_COLLECTION_NAME:-drugs}"
elif [ $? -eq 1 ]; then
    echo "Database already seeded. Exiting successfully."
    exit 0
else
    echo "Error checking database. Exiting."
    exit 1
fi