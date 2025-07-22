# DrugFacts API Deployment Guide

This guide covers various deployment options for the DrugFacts NestJS API, from simple single-server deployments to scalable cloud architectures.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Preparation](#environment-preparation)
3. [Deployment Options](#deployment-options)
   - [Docker Deployment](#docker-deployment)
   - [PM2 Deployment](#pm2-deployment)
   - [Kubernetes Deployment](#kubernetes-deployment)
   - [Cloud Platform Deployments](#cloud-platform-deployments)
4. [Production Considerations](#production-considerations)
5. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

Before deploying, ensure you have:

- Node.js 18+ installed (for non-Docker deployments)
- MongoDB instance (local or cloud)
- Redis instance (optional but recommended)
- SSL certificates (for HTTPS)
- Domain name (for production)

## Environment Preparation

### 1. Create Production Environment File

```bash
cp .env.example .env.production
```

Edit `.env.production`:

```env
# Production Configuration
NODE_ENV=production
PORT=3001

# MongoDB (use connection string with auth)
MONGODB_URL=mongodb://username:password@host:27017/drug_facts?authSource=admin
MONGODB_DB_NAME=drug_facts

# Redis (use password-protected instance)
REDIS_HOST=redis.example.com
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# CORS (add your frontend domains)
CORS_ORIGINS=https://drugfacts.example.com,https://www.drugfacts.example.com

# Rate Limiting (adjust for production load)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Cache TTL (optimize for your use case)
CACHE_TTL_MEMORY=300
CACHE_TTL_REDIS=3600
```

### 2. Build the Application

```bash
npm run build
```

This creates optimized production files in the `dist/` directory.

## Deployment Options

### Docker Deployment

#### 1. Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => res.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

#### 2. Build Docker Image

```bash
docker build -t drugfacts-api:latest .
```

#### 3. Run with Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  api:
    image: drugfacts-api:latest
    container_name: drugfacts-api
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - mongodb
      - redis
    networks:
      - drugfacts-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  mongodb:
    image: mongo:6
    container_name: drugfacts-mongodb
    restart: unless-stopped
    volumes:
      - mongo-data:/data/db
      - ./scripts/mongo-init.js:/docker-entrypoint-initdb.d/init.js:ro
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=${MONGODB_PASSWORD}
      - MONGO_INITDB_DATABASE=drug_facts
    networks:
      - drugfacts-network

  redis:
    image: redis:7-alpine
    container_name: drugfacts-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    networks:
      - drugfacts-network

  nginx:
    image: nginx:alpine
    container_name: drugfacts-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - nginx-cache:/var/cache/nginx
    depends_on:
      - api
    networks:
      - drugfacts-network

volumes:
  mongo-data:
  redis-data:
  nginx-cache:

networks:
  drugfacts-network:
    driver: bridge
```

#### 4. Nginx Configuration

Create `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:3001;
        keepalive 64;
    }

    # Cache configuration
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    server {
        listen 80;
        server_name drugfacts.example.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name drugfacts.example.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        location /api {
            limit_req zone=api_limit burst=20 nodelay;
            
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;

            # Cache GET requests
            proxy_cache api_cache;
            proxy_cache_valid 200 5m;
            proxy_cache_valid 404 1m;
            proxy_cache_use_stale error timeout invalid_header updating;
            add_header X-Cache-Status $upstream_cache_status;
        }

        location /health {
            proxy_pass http://api/health;
            access_log off;
        }
    }
}
```

#### 5. Deploy with Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### PM2 Deployment

PM2 is a production process manager for Node.js applications.

#### 1. Install PM2

```bash
npm install -g pm2
```

#### 2. Create PM2 Ecosystem File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'drugfacts-api',
    script: './dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    max_memory_restart: '1G',
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    listen_timeout: 10000,
    kill_timeout: 5000
  }]
};
```

#### 3. Start with PM2

```bash
# Load environment variables
export $(cat .env.production | xargs)

# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

#### 4. PM2 Commands

```bash
# View logs
pm2 logs drugfacts-api

# Monitor
pm2 monit

# Reload with zero downtime
pm2 reload drugfacts-api

# View status
pm2 status

# Stop
pm2 stop drugfacts-api
```

### Kubernetes Deployment

#### 1. Create Kubernetes Manifests

Create `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: drugfacts-api
  labels:
    app: drugfacts-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: drugfacts-api
  template:
    metadata:
      labels:
        app: drugfacts-api
    spec:
      containers:
      - name: api
        image: drugfacts-api:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URL
          valueFrom:
            secretKeyRef:
              name: drugfacts-secrets
              key: mongodb-url
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: drugfacts-secrets
              key: redis-password
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health/liveness
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/readiness
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: drugfacts-api-service
spec:
  selector:
    app: drugfacts-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3001
  type: LoadBalancer
```

Create `k8s/configmap.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: drugfacts-config
data:
  PORT: "3001"
  CACHE_TTL_MEMORY: "300"
  CACHE_TTL_REDIS: "3600"
  RATE_LIMIT_WINDOW_MS: "900000"
  RATE_LIMIT_MAX_REQUESTS: "100"
```

Create `k8s/hpa.yaml`:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: drugfacts-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: drugfacts-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

#### 2. Deploy to Kubernetes

```bash
# Create namespace
kubectl create namespace drugfacts

# Create secrets
kubectl create secret generic drugfacts-secrets \
  --from-literal=mongodb-url='mongodb://...' \
  --from-literal=redis-password='...' \
  -n drugfacts

# Apply manifests
kubectl apply -f k8s/ -n drugfacts

# Check deployment
kubectl get pods -n drugfacts
kubectl get svc -n drugfacts
```

### Cloud Platform Deployments

#### AWS Elastic Beanstalk

1. Install EB CLI:
```bash
pip install awsebcli
```

2. Initialize EB:
```bash
eb init -p node.js-18 drugfacts-api
```

3. Create environment:
```bash
eb create drugfacts-production --scale 3
```

4. Deploy:
```bash
eb deploy
```

#### Google Cloud Run

1. Build container:
```bash
gcloud builds submit --tag gcr.io/PROJECT-ID/drugfacts-api
```

2. Deploy:
```bash
gcloud run deploy drugfacts-api \
  --image gcr.io/PROJECT-ID/drugfacts-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

#### Azure App Service

1. Create web app:
```bash
az webapp create \
  --resource-group drugfacts-rg \
  --plan drugfacts-plan \
  --name drugfacts-api \
  --runtime "NODE:18-lts"
```

2. Deploy:
```bash
az webapp deployment source config-zip \
  --resource-group drugfacts-rg \
  --name drugfacts-api \
  --src drugfacts-api.zip
```

## Production Considerations

### 1. Database Optimization

```javascript
// MongoDB connection with production settings
MongooseModule.forRootAsync({
  useFactory: async (configService: ConfigService) => ({
    uri: configService.get<string>('database.uri'),
    dbName: configService.get<string>('database.name'),
    maxPoolSize: 50,
    minPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    compressors: ['zlib'],
    retryWrites: true,
    w: 'majority',
  }),
})
```

### 2. Security Hardening

- Use environment variables for all secrets
- Enable HTTPS everywhere
- Implement API key authentication
- Use WAF (Web Application Firewall)
- Regular security audits
- Dependency scanning

### 3. Performance Optimization

- Enable gzip compression
- Implement CDN for static assets
- Use database indexes
- Enable query result caching
- Optimize Docker images
- Use connection pooling

### 4. Backup Strategy

```bash
# MongoDB backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URL" --out="/backup/mongo-$DATE"

# Retain last 7 days
find /backup -name "mongo-*" -mtime +7 -exec rm -rf {} \;
```

### 5. Zero-Downtime Deployment

```bash
# Blue-Green deployment with PM2
pm2 start ecosystem.config.js --name drugfacts-api-blue
pm2 reload drugfacts-api-blue --name drugfacts-api-green
pm2 delete drugfacts-api-blue
```

## Monitoring and Maintenance

### 1. Health Monitoring

Set up monitoring with tools like:
- Prometheus + Grafana
- DataDog
- New Relic
- CloudWatch (AWS)

### 2. Log Management

Configure centralized logging:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk
- CloudWatch Logs
- Google Cloud Logging

### 3. Alerts

Set up alerts for:
- High error rates (>1%)
- Response time degradation (>500ms)
- Memory usage (>80%)
- CPU usage (>70%)
- Database connection failures
- Cache hit rate drops

### 4. Maintenance Tasks

Weekly:
- Review error logs
- Check disk usage
- Verify backups

Monthly:
- Update dependencies
- Review security alerts
- Performance analysis
- Cost optimization

### 5. Scaling Strategy

Horizontal scaling triggers:
- CPU > 70% for 5 minutes
- Memory > 80% for 5 minutes
- Request queue > 100
- Response time > 1 second

## Rollback Procedure

If deployment fails:

1. **Docker**:
```bash
docker-compose down
docker-compose up -d --scale api=0
docker tag drugfacts-api:previous drugfacts-api:latest
docker-compose up -d
```

2. **PM2**:
```bash
pm2 reload drugfacts-api --rollback
```

3. **Kubernetes**:
```bash
kubectl rollout undo deployment/drugfacts-api -n drugfacts
```

## Troubleshooting Deployment

### Common Issues

1. **Port Already in Use**
```bash
lsof -ti:3001 | xargs kill -9
```

2. **MongoDB Connection Failed**
- Check connection string
- Verify network access
- Check authentication

3. **Out of Memory**
- Increase container limits
- Check for memory leaks
- Optimize caching

4. **SSL Certificate Issues**
- Verify certificate chain
- Check expiration date
- Ensure proper file permissions

## Conclusion

This deployment guide covers various options from simple to complex deployments. Choose the approach that best fits your infrastructure and scaling needs. Always test deployments in a staging environment before production.