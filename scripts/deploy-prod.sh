#!/bin/bash

# Production Deployment Script for DrugFacts
# This script handles deployment with external MongoDB

set -e

echo "==================================="
echo "DrugFacts Production Deployment"
echo "==================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for required environment variables
check_env_vars() {
    local missing_vars=()
    
    if [ -z "$MONGODB_URL" ]; then
        missing_vars+=("MONGODB_URL")
    fi
    
    if [ -z "$MONGODB_DB_NAME" ]; then
        echo -e "${YELLOW}Warning: MONGODB_DB_NAME not set, using default 'drug_facts'${NC}"
        export MONGODB_DB_NAME="drug_facts"
    fi
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo -e "${RED}Error: Missing required environment variables:${NC}"
        printf '%s\n' "${missing_vars[@]}"
        echo ""
        echo "Please set these in your .env file or export them before running this script."
        exit 1
    fi
}

# Test MongoDB connection
test_mongodb_connection() {
    echo "Testing MongoDB connection..."
    
    # Create a simple Node.js script to test connection
    cat > /tmp/test-mongo.js << 'EOF'
const { MongoClient } = require('mongodb');

async function testConnection() {
    const client = new MongoClient(process.env.MONGODB_URL);
    try {
        await client.connect();
        await client.db('admin').command({ ping: 1 });
        console.log('✓ Successfully connected to MongoDB!');
        
        // Test database access
        const db = client.db(process.env.MONGODB_DB_NAME || 'drug_facts');
        const collections = await db.listCollections().toArray();
        console.log(`✓ Database '${db.databaseName}' accessible`);
        console.log(`  Collections: ${collections.map(c => c.name).join(', ') || 'none'}`);
        
        process.exit(0);
    } catch (error) {
        console.error('✗ MongoDB connection failed:', error.message);
        process.exit(1);
    } finally {
        await client.close();
    }
}

testConnection();
EOF

    # Run the test
    if node /tmp/test-mongo.js; then
        rm -f /tmp/test-mongo.js
        return 0
    else
        rm -f /tmp/test-mongo.js
        return 1
    fi
}

# Load environment variables from .env if it exists
if [ -f .env ]; then
    echo "Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check environment variables
check_env_vars

# Test MongoDB connection
if ! test_mongodb_connection; then
    echo -e "${RED}Failed to connect to MongoDB. Please check your MONGODB_URL.${NC}"
    exit 1
fi

echo ""
echo "Starting deployment..."
echo ""

# Pull latest changes (if in a git repository)
if [ -d .git ]; then
    echo "Pulling latest changes from git..."
    git pull origin main || true
fi

# Build and start services
echo "Building and starting services..."

# Determine which profiles to use
PROFILES=""
if [ "$WITH_NGINX" = "true" ]; then
    PROFILES="$PROFILES --profile with-nginx"
    echo "- Including Nginx reverse proxy"
fi

if [ "$WITH_REDIS" = "true" ]; then
    PROFILES="$PROFILES --profile with-redis"
    echo "- Including Redis cache"
fi

# Stop existing containers
echo ""
echo "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Build and start new containers
echo ""
echo "Building and starting new containers..."
docker-compose -f docker-compose.prod.yml $PROFILES up -d --build

# Wait for services to be healthy
echo ""
echo "Waiting for services to be healthy..."
sleep 10

# Check service status
echo ""
echo "Checking service status..."
docker-compose -f docker-compose.prod.yml ps

# Show logs for the main app
echo ""
echo "Recent application logs:"
docker-compose -f docker-compose.prod.yml logs --tail=20 drugfacts-app

echo ""
echo -e "${GREEN}==================================="
echo "Deployment completed successfully!"
echo "===================================${NC}"
echo ""
echo "Application URL: http://localhost:${PORT:-5005}"
echo ""
echo "To view logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "To stop: docker-compose -f docker-compose.prod.yml down"
echo ""

# Optional: Run data seeding if requested
if [ "$RUN_SEEDER" = "true" ]; then
    echo "Running data seeder..."
    if [ "$USE_AI_SEEDER" = "true" ]; then
        echo "Using AI-enhanced seeder..."
        docker-compose -f docker-compose.yml --profile ai-seeder run --rm ai-seeder
    else
        echo "Using basic seeder..."
        docker-compose -f docker-compose.yml --profile basic-seeder run --rm db-seeder
    fi
fi