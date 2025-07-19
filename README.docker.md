# Docker Deployment Guide for drugfacts.wiki

This guide covers deploying drugfacts.wiki using Docker and Docker Compose.

## Quick Start

### Development Environment

```bash
# Start development environment
./scripts/dev.sh

# Or manually:
docker-compose -f docker-compose.dev.yml up -d
```

### Production Deployment

```bash
# Deploy to production
./scripts/deploy.sh

# Or manually:
docker-compose up -d
```

## Services

### drugfacts-app
- **Port**: 3000 (production), 5000 (development)
- **Health Check**: `/api/health`
- **Dependencies**: PostgreSQL, Redis

### PostgreSQL Database
- **Port**: 5432
- **Database**: `drugfacts`
- **User**: `drugfacts_user`

### Redis Cache
- **Port**: 6379
- **Usage**: Session storage and caching

### Nginx Reverse Proxy
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Features**: Rate limiting, gzip compression, SSL termination

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
# Edit .env with your configuration
```

### SSL Certificates

For HTTPS in production:

1. Place SSL certificates in `nginx/ssl/`:
   - `drugfacts.wiki.crt`
   - `drugfacts.wiki.key`

2. Uncomment HTTPS server block in `nginx/nginx.conf`

## Docker Commands

### Build and Start Services

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### Development Commands

```bash
# Start dev environment
docker-compose -f docker-compose.dev.yml up -d

# Access application shell
docker-compose exec drugfacts-app sh

# View application logs
docker-compose logs -f drugfacts-app
```

### Database Commands

```bash
# Access PostgreSQL
docker-compose exec db psql -U drugfacts_user -d drugfacts

# Backup database
docker-compose exec db pg_dump -U drugfacts_user drugfacts > backup.sql

# Restore database
docker-compose exec -T db psql -U drugfacts_user -d drugfacts < backup.sql
```

### Maintenance Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Update images and restart
docker-compose pull
docker-compose up -d

# Clean up unused Docker resources
docker system prune -a
```

## Health Monitoring

### Health Check Endpoints

- Application: `http://localhost:3000/api/health`
- Database: Check with `docker-compose exec db pg_isready`
- Redis: Check with `docker-compose exec redis redis-cli ping`

### Monitoring Services

```bash
# Check all service health
docker-compose ps

# View resource usage
docker stats

# Check logs for errors
docker-compose logs --tail=50 drugfacts-app
```

## Production Considerations

### Security

1. Change default passwords in `docker-compose.yml`
2. Use environment files for secrets
3. Configure firewall rules
4. Enable SSL/TLS
5. Regular security updates

### Performance

1. Configure resource limits in compose file
2. Enable gzip compression (already configured in nginx)
3. Set up log rotation
4. Monitor disk space and memory usage

### Backup Strategy

1. Database backups: Use `pg_dump` daily
2. Volume backups: Back up Docker volumes
3. Configuration backups: Store compose files and configs in version control

## Troubleshooting

### Common Issues

**Application won't start:**
```bash
docker-compose logs drugfacts-app
```

**Database connection issues:**
```bash
docker-compose logs db
docker-compose exec db pg_isready -U drugfacts_user
```

**Network connectivity:**
```bash
docker network ls
docker-compose exec drugfacts-app ping db
```

### Reset Everything

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## Scaling

To scale the application:

```bash
# Scale web application
docker-compose up -d --scale drugfacts-app=3

# Use nginx load balancing (update nginx.conf)
```

## Support

For issues with the Docker deployment, check:
1. Docker logs: `docker-compose logs`
2. Service health: `docker-compose ps`
3. Resource usage: `docker stats`
4. Application health: `curl http://localhost:3000/api/health`