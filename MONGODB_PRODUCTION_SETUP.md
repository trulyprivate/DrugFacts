# MongoDB Production Setup Guide

This guide provides instructions for setting up MongoDB for production deployment of the DrugFacts application.

## MongoDB Hosting Options

### 1. MongoDB Atlas (Recommended for Production)

MongoDB Atlas is the recommended solution for production deployments. It offers:
- Automated backups
- Built-in security features
- Global deployment options
- Automatic scaling
- Monitoring and alerts

#### Setup Steps:

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account or log in

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose your plan (M0 Free tier for testing, M10+ for production)
   - Select cloud provider (AWS, GCP, or Azure)
   - Choose region closest to your users
   - Name your cluster (e.g., "drugfacts-prod")

3. **Configure Network Access**
   - Go to Network Access → Add IP Address
   - For development: Add your current IP
   - For production: Add your server IPs or use VPC peering
   - For DigitalOcean: Add `0.0.0.0/0` (less secure) or specific droplet IPs

4. **Create Database User**
   - Go to Database Access → Add New Database User
   - Username: `drugfacts_user`
   - Password: Generate a strong password
   - User Privileges: Read and write to any database

5. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Select "Node.js" and version 4.1 or later
   - Copy the connection string

### 2. Self-Hosted MongoDB (Alternative)

For self-hosted MongoDB on a VPS or dedicated server:

```bash
# Install MongoDB on Ubuntu 22.04
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Enable authentication
sudo mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "STRONG_ADMIN_PASSWORD",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})

use drug_facts
db.createUser({
  user: "drugfacts_user",
  pwd: "STRONG_USER_PASSWORD",
  roles: [ { role: "readWrite", db: "drug_facts" } ]
})

# Enable auth in mongod.conf
sudo nano /etc/mongod.conf
# Add:
security:
  authorization: enabled

# Restart MongoDB
sudo systemctl restart mongod
```

## Connection String Formats

### MongoDB Atlas
```
mongodb+srv://drugfacts_user:PASSWORD@cluster0.xxxxx.mongodb.net/drug_facts?retryWrites=true&w=majority
```

### Self-Hosted MongoDB
```
mongodb://drugfacts_user:PASSWORD@your-server-ip:27017/drug_facts?authSource=admin
```

### Docker MongoDB (Development)
```
mongodb://mongodb:27017/drug_facts
```

## Environment Variables

### Production .env file
```bash
# MongoDB Configuration
MONGODB_URL=mongodb+srv://drugfacts_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/drug_facts?retryWrites=true&w=majority
MONGODB_DB_NAME=drug_facts
MONGODB_COLLECTION_NAME=drugs

# Application
NODE_ENV=production
PORT=5005

# AI Features (optional)
OPENAI_API_KEY=your_openai_key
OPENPIPE_API_KEY=your_openpipe_key
ENABLE_AI_CLASSIFICATION=true
```

## Docker Compose Production Configuration

### Option 1: External MongoDB (Atlas/Self-Hosted)

Update `docker-compose.yml`:

```yaml
services:
  drugfacts-app:
    environment:
      - NODE_ENV=production
      - PORT=5005
      - MONGODB_URL=${MONGODB_URL}  # From .env file
      - MONGODB_DB_NAME=${MONGODB_DB_NAME}
    # Remove mongodb service dependency
    depends_on: []
```

### Option 2: Dockerized MongoDB (Not recommended for production)

Keep the existing configuration but add:
- Volume persistence
- Authentication
- Backup strategy

## GitHub Secrets Configuration

Add these secrets to your GitHub repository:

1. **Go to GitHub Repository → Settings → Secrets and variables → Actions**

2. **Add the following secrets:**

   - `MONGODB_URL`: Your production MongoDB connection string
   - `MONGODB_DB_NAME`: `drug_facts`
   - `MONGODB_COLLECTION_NAME`: `drugs`
   - `OPENAI_API_KEY`: Your OpenAI API key (if using AI features)
   - `OPENPIPE_API_KEY`: Your OpenPipe API key (if using)

3. **For DigitalOcean Deployment:**
   - `DIGITALOCEAN_ACCESS_TOKEN`: Your DigitalOcean API token

## Security Best Practices

1. **Connection String Security**
   - Never commit connection strings to git
   - Use environment variables
   - Rotate passwords regularly

2. **Network Security**
   - Whitelist specific IPs in MongoDB Atlas
   - Use VPC peering for cloud deployments
   - Enable SSL/TLS for connections

3. **Authentication**
   - Use strong passwords (20+ characters)
   - Enable SCRAM-SHA-256 authentication
   - Create separate users for different environments

4. **Monitoring**
   - Set up alerts for failed authentication
   - Monitor connection counts
   - Track query performance

## Initial Data Seeding

### Using Basic Seeder
```bash
docker-compose --profile basic-seeder run db-seeder
```

### Using AI-Enhanced Seeder
```bash
# Ensure API keys are in .env
docker-compose --profile ai-seeder run ai-seeder
```

### Direct Import (Production)
```bash
# From your local machine with MongoDB tools installed
mongoimport --uri "$MONGODB_URL" \
  --collection drugs \
  --file data/drugs/Labels.json \
  --jsonArray
```

## Backup Strategy

### MongoDB Atlas
- Automated daily backups (included)
- Point-in-time recovery
- Cross-region backup replication

### Self-Hosted
```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri "$MONGODB_URL" --out "backup_$DATE"
tar -czf "drugfacts_backup_$DATE.tar.gz" "backup_$DATE"
rm -rf "backup_$DATE"

# Upload to S3 or other storage
aws s3 cp "drugfacts_backup_$DATE.tar.gz" s3://your-backup-bucket/
```

## Connection Testing

### Test from command line
```bash
# Install mongosh
curl -O https://downloads.mongodb.com/compass/mongosh-2.0.0-linux-x64.tgz
tar -zxvf mongosh-2.0.0-linux-x64.tgz
sudo cp mongosh-2.0.0-linux-x64/bin/mongosh /usr/local/bin/

# Test connection
mongosh "$MONGODB_URL" --eval "db.adminCommand('ping')"
```

### Test from application
```javascript
// test-connection.js
const { MongoClient } = require('mongodb');

async function testConnection() {
  const client = new MongoClient(process.env.MONGODB_URL);
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('Successfully connected to MongoDB!');
  } finally {
    await client.close();
  }
}

testConnection().catch(console.error);
```

## Troubleshooting

### Connection Issues
1. Check IP whitelist in MongoDB Atlas
2. Verify connection string format
3. Test with mongosh tool
4. Check firewall rules

### Authentication Failures
1. Verify username and password
2. Check user permissions
3. Ensure correct authSource

### Performance Issues
1. Create indexes for common queries
2. Monitor slow queries
3. Scale cluster if needed

## Next Steps

1. Set up monitoring and alerts
2. Configure automated backups
3. Implement connection pooling
4. Set up replica sets for high availability
5. Configure SSL/TLS certificates