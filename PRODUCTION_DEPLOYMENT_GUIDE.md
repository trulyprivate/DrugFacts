# Production Deployment Guide

This guide provides step-by-step instructions for deploying DrugFacts to production.

## Prerequisites

1. **MongoDB Setup** (Choose one):
   - MongoDB Atlas account with cluster created (Recommended)
   - Self-hosted MongoDB instance
   - See [MONGODB_PRODUCTION_SETUP.md](./MONGODB_PRODUCTION_SETUP.md) for detailed setup

2. **GitHub Repository**:
   - Fork or clone the repository
   - Set up GitHub Secrets (see below)

3. **Deployment Target** (Choose one):
   - DigitalOcean account (for App Platform)
   - VPS/Server with Docker installed
   - Local server with Docker

## Step 1: MongoDB Setup

### Option A: MongoDB Atlas (Recommended)
1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a cluster (M0 free tier for testing, M10+ for production)
3. Set up network access (whitelist IPs)
4. Create database user
5. Get connection string

### Option B: Self-Hosted MongoDB
See [MONGODB_PRODUCTION_SETUP.md](./MONGODB_PRODUCTION_SETUP.md) for detailed instructions.

## Step 2: GitHub Secrets Configuration

Go to your GitHub repository → Settings → Secrets and variables → Actions

### Required Secrets:
```
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/drug_facts?retryWrites=true&w=majority
MONGODB_DB_NAME=drug_facts
MONGODB_COLLECTION_NAME=drugs
DIGITALOCEAN_ACCESS_TOKEN=your_do_token_here
```

### Optional Secrets (for AI features):
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
OPENPIPE_API_KEY=opk_xxxxxxxxxxxxx
ENABLE_AI_CLASSIFICATION=true
```

See [GITHUB_SECRETS.md](./GITHUB_SECRETS.md) for complete list.

## Step 3: Initial Data Import

### Option A: Using Docker (Recommended)

1. **Clone repository and set up environment:**
```bash
git clone https://github.com/yourusername/DrugFacts.git
cd DrugFacts

# Create .env file
cat > .env << EOF
MONGODB_URL=your_mongodb_connection_string
MONGODB_DB_NAME=drug_facts
OPENAI_API_KEY=your_openai_key  # Optional
EOF
```

2. **Run initial data import:**

Basic import (without AI):
```bash
docker-compose --profile basic-seeder run --rm db-seeder
```

AI-enhanced import:
```bash
docker-compose --profile ai-seeder run --rm ai-seeder
```

### Option B: Direct Import

```bash
# Install dependencies
pip install -r requirements.txt

# Basic import
python hardened_mongo_import.py \
  -j data/drugs/Labels.json \
  --mongo-uri "$MONGODB_URL" \
  --db-name drug_facts

# AI-enhanced import
python run_enhanced_import.py \
  --mongo-uri "$MONGODB_URL" \
  --db-name drug_facts
```

## Step 4: Deploy Application

### Option A: DigitalOcean App Platform (Recommended)

1. **Automatic deployment via GitHub Actions:**
   - Push to main branch
   - GitHub Actions will automatically deploy

2. **Manual deployment:**
   - Go to DigitalOcean App Platform
   - Create new app from GitHub
   - Configure environment variables
   - Deploy

### Option B: Docker Deployment on VPS

1. **Connect to your server:**
```bash
ssh user@your-server-ip
```

2. **Clone repository:**
```bash
git clone https://github.com/yourusername/DrugFacts.git
cd DrugFacts
```

3. **Create production .env file:**
```bash
nano .env
# Add your MongoDB URL and other secrets
```

4. **Run deployment script:**
```bash
./scripts/deploy-prod.sh
```

Or manually:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Option C: Docker Deployment with Nginx

For SSL/HTTPS support:
```bash
# With Nginx for SSL termination
docker-compose -f docker-compose.prod.yml --profile with-nginx up -d

# Configure SSL certificates in nginx/ssl/
```

## Step 5: Verify Deployment

1. **Check application health:**
```bash
curl http://your-domain:5005/api/health
```

2. **Check MongoDB connection:**
```bash
docker logs drugfacts-wiki | grep -i mongo
```

3. **View application logs:**
```bash
docker-compose -f docker-compose.prod.yml logs -f drugfacts-app
```

## Step 6: Configure Domain (Optional)

1. **Point domain to server:**
   - Add A record pointing to server IP
   - Or CNAME for DigitalOcean App Platform

2. **Configure SSL:**
   - Use Let's Encrypt with Nginx
   - Or DigitalOcean's managed SSL

## Monitoring and Maintenance

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f drugfacts-app
```

### Update Application
```bash
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```

### Backup MongoDB
```bash
# MongoDB Atlas: Automated backups included
# Self-hosted: Use mongodump
mongodump --uri "$MONGODB_URL" --out backup-$(date +%Y%m%d)
```

## Troubleshooting

### Connection Issues
1. Check MongoDB connection string
2. Verify IP whitelist in MongoDB Atlas
3. Check firewall rules
4. Test with: `mongosh "$MONGODB_URL"`

### Application Won't Start
1. Check logs: `docker logs drugfacts-wiki`
2. Verify environment variables
3. Check port availability
4. Ensure MongoDB is accessible

### Performance Issues
1. Check MongoDB indexes
2. Monitor memory usage
3. Enable Redis caching
4. Scale MongoDB cluster if needed

## Security Checklist

- [ ] Strong MongoDB passwords
- [ ] IP whitelist configured
- [ ] SSL/TLS enabled
- [ ] Environment variables secured
- [ ] Regular security updates
- [ ] Backup strategy in place
- [ ] Monitoring configured

## Next Steps

1. Set up monitoring (e.g., UptimeRobot, Datadog)
2. Configure automated backups
3. Set up CI/CD pipeline
4. Implement rate limiting
5. Configure CDN for static assets

## Support

For issues or questions:
1. Check logs first
2. Review troubleshooting guide
3. Create GitHub issue
4. Check MongoDB Atlas metrics