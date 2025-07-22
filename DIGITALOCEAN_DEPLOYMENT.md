# DigitalOcean Deployment Guide

This guide explains how to deploy the DrugFacts application to DigitalOcean App Platform.

## Architecture Overview

The application consists of two separate deployments:
1. **Frontend** - Next.js static site
2. **Backend** - NestJS API server with MongoDB

## Prerequisites

1. DigitalOcean account with App Platform access
2. MongoDB database (can use DigitalOcean Managed Database)
3. GitHub repository connected to DigitalOcean

## Deployment Steps

### 1. Deploy the Backend API

1. Create a new app in DigitalOcean App Platform
2. Use the configuration from `.do/app-backend.yaml`
3. Set the following environment variables:
   - `MONGODB_URL` - Your MongoDB connection string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/drug_facts?retryWrites=true&w=majority`)
   
4. Deploy and wait for the health check to pass at `/health`

### 2. Deploy the Frontend

1. Create another app in DigitalOcean App Platform
2. Use the configuration from `.do/app-frontend.yaml`
3. Update the `NEXT_PUBLIC_API_URL` in the config to point to your backend URL
4. Deploy as a static site

### 3. Configure CORS

Ensure the backend allows CORS from your frontend domain by setting:
```
CORS_ORIGINS=https://your-frontend-app.ondigitalocean.app,https://drugfacts.wiki
```

## Local Development vs Production

### Local Development
```bash
# Uses docker-compose with all services
docker-compose up -d
```

### Production
- Frontend: Static site on DigitalOcean App Platform
- Backend: Node.js service on DigitalOcean App Platform
- Database: DigitalOcean Managed MongoDB or external MongoDB

## Troubleshooting

### Build Error: "Route has an invalid export"

This error occurs when trying to build with API routes that don't exist. The solution:
1. Ensure `next.config.js` has `output: 'export'` for static export
2. Use separate deployments for frontend and backend
3. Frontend connects to backend via `NEXT_PUBLIC_API_URL`

### NPM Dependency Conflicts

The backend uses `@nestjs/cache-manager` v2.3.0 which has peer dependency conflicts with NestJS v11. Solutions:
1. Use `npm ci --legacy-peer-deps` in build commands
2. Add `.npmrc` file with `legacy-peer-deps=true`
3. The deployment configs already include this fix

### Build Dependencies Missing

If you get errors about missing modules like `autoprefixer`:
1. Ensure build dependencies are in `dependencies` not `devDependencies`
2. Use `npm ci` before build commands to install all dependencies
3. The deployment configs now include `npm ci` in build commands

### MongoDB Connection Issues

1. Ensure MongoDB URL includes authentication
2. Whitelist DigitalOcean App Platform IPs in MongoDB
3. Use connection string with `?retryWrites=true&w=majority`

### CORS Errors

1. Backend must explicitly allow frontend origin
2. Check `CORS_ORIGINS` environment variable
3. Ensure proper headers are set in NestJS

## Environment Variables

### Frontend (.do/app-frontend.yaml)
```yaml
envs:
  - key: NEXT_PUBLIC_API_URL
    value: https://your-backend-app.ondigitalocean.app/api
    scope: BUILD_TIME
```

### Backend (.do/app-backend.yaml)
```yaml
envs:
  - key: MONGODB_URL
    value: ${MONGODB_URL}
    scope: RUN_TIME
    type: SECRET
  - key: CORS_ORIGINS
    value: "https://your-frontend-app.ondigitalocean.app"
    scope: RUN_TIME
```

## Cost Optimization

- Frontend: Use Basic ($5/mo) static site
- Backend: Use Basic XXS ($5/mo) for API
- Database: Consider external MongoDB Atlas free tier

Total minimum cost: ~$10/month

## Monitoring

1. Set up alerts for health check failures
2. Monitor API response times
3. Track MongoDB connection pool metrics
4. Use DigitalOcean insights for traffic analysis

## Scaling

When traffic increases:
1. Increase backend instance size
2. Add more backend instances with load balancing
3. Use MongoDB connection pooling
4. Consider CDN for frontend static assets