# Docker Deployment Guide for Static Next.js App

## Overview

The Docker configuration has been updated to serve the static Next.js export instead of running a Next.js production server.

## Key Changes Made

### 1. Updated Dockerfile
- **Build Stage**: Now runs `npm run build` which generates static files in `out/` directory
- **Runtime Stage**: Copies static files and `deploy.js` script instead of `dist/` directory
- **Port**: Changed from 3000 to 5000 to match Replit configuration
- **Command**: Now runs `node deploy.js` instead of `node dist/index.js`
- **Health Check**: Updated to check root endpoint instead of `/api/health`

### 2. Updated docker-compose.yml
- **Port Mapping**: Changed from `3000:3000` to `5000:5000`
- **Environment**: Updated PORT environment variable to 5000
- **Health Check**: Updated to check root endpoint on port 5000

### 3. Nginx Configuration
- **Created**: `nginx/nginx.conf` optimized for static file serving
- **Proxy**: Configured to proxy requests to the static server on port 5000
- **Caching**: Optimized static file caching for better performance
- **Security**: Added security headers and rate limiting

## Deployment Commands

### Build and Run with Docker Compose
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f drugfacts-app

# Stop services
docker-compose down
```

### Build Docker Image Only
```bash
# Build the image
docker build -t drugfacts-wiki .

# Run the container
docker run -p 5000:5000 drugfacts-wiki
```

## Architecture

```
[Nginx:80] -> [Static Server:5000] -> [Static Files in /out]
```

### Services:
- **drugfacts-app**: Static file server serving Next.js export
- **nginx**: Reverse proxy with caching and security headers
- **db**: PostgreSQL database (for future features)
- **redis**: Redis cache (for future features)

## Development

For development, use the existing development setup:
```bash
# Development with hot reload
docker-compose -f docker-compose.dev.yml up
```

## Verification

After deployment, verify the application is working:

1. **Direct Access**: `http://localhost:5000`
2. **Through Nginx**: `http://localhost:80`
3. **Health Check**: `curl http://localhost:5000`

## Environment Variables

- `NODE_ENV=production`
- `PORT=5000`
- Database variables (for future use)

## File Structure

```
├── Dockerfile              # Production build with static serving
├── docker-compose.yml      # Production services
├── docker-compose.dev.yml  # Development services
├── deploy.js              # Static file server
├── nginx/
│   └── nginx.conf         # Nginx configuration
└── out/                   # Generated static files (after build)
```

The application is now properly configured for static deployment in Docker with optimized performance and caching.