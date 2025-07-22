#!/bin/bash

# Development environment script for drugfacts.wiki

set -e

echo "🏥 Starting drugfacts.wiki development environment..."

# Start development services
echo "🛠️  Starting development services..."
docker-compose -f docker-compose.dev.yml up -d

echo "⏳ Waiting for services to be ready..."
sleep 15

echo "✅ Development environment ready!"
echo "🌐 drugfacts.wiki dev server: http://localhost:5005"
echo "🗄️  PostgreSQL database: localhost:5432"

echo ""
echo "📋 Development commands:"
echo "  View logs:        docker-compose -f docker-compose.dev.yml logs -f"
echo "  Stop services:    docker-compose -f docker-compose.dev.yml down"
echo "  Restart:          docker-compose -f docker-compose.dev.yml restart"
echo "  Shell access:     docker-compose -f docker-compose.dev.yml exec drugfacts-app sh"