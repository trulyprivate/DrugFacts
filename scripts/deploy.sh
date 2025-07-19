#!/bin/bash

# Deployment script for drugfacts.wiki

set -e

echo "🏥 Starting drugfacts.wiki deployment..."

# Build and start the application
echo "📦 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if the application is healthy
echo "🔍 Checking application health..."
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Application is healthy and running!"
    echo "🌐 drugfacts.wiki is available at: http://localhost:3000"
else
    echo "❌ Application health check failed"
    echo "📋 Checking logs..."
    docker-compose logs drugfacts-app
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🔧 Useful commands:"
echo "  View logs:        docker-compose logs -f"
echo "  Stop services:    docker-compose down"
echo "  Restart:          docker-compose restart"
echo "  Update:           docker-compose pull && docker-compose up -d"