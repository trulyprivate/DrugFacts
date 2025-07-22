# GitHub Secrets Setup Guide

This document lists all the GitHub secrets required for the CI/CD pipeline and deployment.

## Required Secrets for Production

### 🔐 MongoDB Secrets (REQUIRED)
- `MONGODB_URL`: Production MongoDB connection string
  - MongoDB Atlas format: `mongodb+srv://username:password@cluster.mongodb.net/drug_facts?retryWrites=true&w=majority`
  - Self-hosted format: `mongodb://username:password@host:27017/drug_facts?authSource=admin`
- `MONGODB_DB_NAME`: Database name (default: `drug_facts`)
- `MONGODB_COLLECTION_NAME`: Collection name (default: `drugs`)

### 🤖 AI Enhancement Secrets (OPTIONAL but recommended)
- `OPENAI_API_KEY`: OpenAI API key for AI therapeutic classification
  - Get from: https://platform.openai.com/api-keys
  - Required for: AI-enhanced drug classification features
- `OPENPIPE_API_KEY`: OpenPipe API key (optional optimization)
  - Get from: https://openpipe.ai/
  - Used for: Cost optimization and monitoring

### 🌐 Application Configuration
- `NEXT_PUBLIC_API_URL`: Public API URL (e.g., `https://drugfacts.wiki/api`)
- `NODE_ENV`: Set to `production`
- `PORT`: Application port (default: `5005`)

### 🚀 DigitalOcean Deployment (PRIMARY METHOD)
- `DIGITALOCEAN_ACCESS_TOKEN`: DigitalOcean API token for App Platform deployment
  - Required for automatic deployment
  - Create at: https://cloud.digitalocean.com/account/api/tokens

### 🐳 Docker Hub (Optional - for Docker registry)
- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub access token
  - Create at: https://hub.docker.com/settings/security

### 🔧 Direct Server Deployment (Alternative)
- `DEPLOY_HOST`: Server hostname or IP
- `DEPLOY_USER`: SSH username
- `DEPLOY_SSH_KEY`: Private SSH key for deployment

## How to Add Secrets

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact name listed above

## Environment-Specific Secrets

For multiple environments, create environments in GitHub:

1. Go to **Settings** → **Environments**
2. Create environments: `staging` and `production`
3. Add environment-specific secrets

## Example Values

```bash
# MongoDB Atlas connection string format
MONGODB_URL=mongodb+srv://drugfacts_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/drug_facts?retryWrites=true&w=majority

# Database configuration
MONGODB_DB_NAME=drug_facts
MONGODB_COLLECTION_NAME=drugs

# Application settings
NODE_ENV=production
PORT=5005
NEXT_PUBLIC_API_URL=https://drugfacts.wiki/api

# AI Features (if enabled)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENPIPE_API_KEY=opk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ENABLE_AI_CLASSIFICATION=true
```

## Priority Order for Setup

1. **Essential (Must have for basic operation):**
   - `MONGODB_URL`
   - `MONGODB_DB_NAME`
   - `DIGITALOCEAN_ACCESS_TOKEN` (for deployment)

2. **Recommended (For full features):**
   - `OPENAI_API_KEY` (for AI classification)
   - `NEXT_PUBLIC_API_URL`

3. **Optional (Based on deployment method):**
   - Docker Hub credentials
   - SSH deployment credentials
   - `OPENPIPE_API_KEY`

## DigitalOcean Setup

### Creating a DigitalOcean Access Token

1. Log in to your DigitalOcean account
2. Go to **API** → **Tokens/Keys**
3. Click **Generate New Token**
4. Give it a name (e.g., "GitHub Actions Deployment")
5. Select **Write** scope
6. Copy the token and add it as `DIGITALOCEAN_ACCESS_TOKEN` in GitHub Secrets

### DigitalOcean App Platform Features

The deployment will automatically:
- Create or update the App Platform application
- Configure environment variables from GitHub Secrets
- Set up health checks
- Deploy on every push to main branch
- Provide a public URL for your application

## Deployment Options

The pipeline supports multiple deployment methods:
1. **DigitalOcean App Platform** (Primary - automatic)
2. **Docker deployment** (Set repository variable `USE_DOCKER_DEPLOYMENT` to `true`)

## Security Best Practices

1. Use strong, unique passwords for MongoDB
2. Rotate API keys regularly
3. Use GitHub's environment protection rules for production
4. Never commit secrets to the repository
5. Use least-privilege access for deployment credentials
6. Enable 2FA on DigitalOcean account
7. Restrict DigitalOcean token permissions to minimum required