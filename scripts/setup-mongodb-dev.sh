#!/bin/bash

# MongoDB Development Setup Script
# This script sets up MongoDB for local development and seeds the database

set -e

echo "🚀 Setting up MongoDB for DrugFacts development..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if required files exist
if [ ! -f "data/drugs/Labels.json" ]; then
    echo "❌ Labels.json not found in data/drugs/ directory"
    echo "Please ensure the drug data files are present before running this script."
    exit 1
fi

if [ ! -f "drug_label_schema.yaml" ]; then
    echo "❌ drug_label_schema.yaml not found"
    echo "Please ensure the schema file is present before running this script."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.dev.yml down

# Remove existing volumes if requested
if [ "$1" = "--clean" ]; then
    echo "🧹 Cleaning up existing data volumes..."
    docker volume rm drugfacts_mongodb_dev_data 2>/dev/null || true
fi

# Start MongoDB
echo "🗄️  Starting MongoDB..."
docker-compose -f docker-compose.dev.yml up -d mongodb

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
timeout=60
counter=0
while ! docker-compose -f docker-compose.dev.yml exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo "❌ MongoDB failed to start within $timeout seconds"
        docker-compose -f docker-compose.dev.yml logs mongodb
        exit 1
    fi
    sleep 2
    counter=$((counter + 2))
    echo "  Waiting... ($counter/$timeout seconds)"
done

echo "✅ MongoDB is ready!"

# Run the database seeder
echo "🌱 Seeding database with drug data..."
docker-compose -f docker-compose.dev.yml up --build db-seeder

# Check seeding results
if [ $? -eq 0 ]; then
    echo "✅ Database seeding completed successfully!"
else
    echo "❌ Database seeding failed. Check the logs above for details."
    exit 1
fi

# Start Mongo Express for database management
echo "🖥️  Starting Mongo Express for database management..."
docker-compose -f docker-compose.dev.yml up -d mongo-express

echo ""
echo "🎉 MongoDB development setup complete!"
echo ""
echo "📊 Services running:"
echo "  - MongoDB: localhost:27017"
echo "  - Mongo Express: http://localhost:8081"
echo ""
echo "🔧 Connection details:"
echo "  - Database: drug_facts"
echo "  - Collection: drugs"
echo "  - Connection string: mongodb://localhost:27017/drug_facts"
echo ""
echo "📝 Next steps:"
echo "  1. Update your application's MongoDB connection string"
echo "  2. Install MongoDB dependencies: npm install mongodb"
echo "  3. Start your development server"
echo ""
echo "🛑 To stop all services: docker-compose -f docker-compose.dev.yml down"
echo "🧹 To clean and restart: $0 --clean"