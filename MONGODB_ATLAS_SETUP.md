# MongoDB Atlas Setup Guide

This guide explains how to set up MongoDB Atlas for the DrugFacts application.

## Why MongoDB Atlas?

- **Free Tier**: 512MB storage for development/small projects
- **Fully Managed**: Automatic backups, monitoring, and security patches
- **Global Distribution**: Deploy clusters in multiple regions
- **Built-in Security**: Network isolation, encryption at rest, and role-based access

## Setup Steps

### 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Verify your email

### 2. Create a Cluster

1. Click "Build a Cluster"
2. Choose **FREE Shared** tier (M0)
3. Select a cloud provider and region closest to your DigitalOcean deployment
4. Name your cluster (e.g., `drugfacts-cluster`)
5. Click "Create Cluster"

### 3. Configure Database Access

1. Go to **Database Access** in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Set username and password (save these!)
5. Under "Database User Privileges", select "Read and write to any database"
6. Click "Add User"

### 4. Configure Network Access

1. Go to **Network Access** in the left sidebar
2. Click "Add IP Address"
3. For production, add DigitalOcean App Platform IPs:
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for initial setup
   - Later, restrict to specific IPs for better security
4. Click "Confirm"

### 5. Get Connection String

1. Go to **Clusters** and click "Connect"
2. Choose "Connect your application"
3. Select "Node.js" and version "4.1 or later"
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/?retryWrites=true&w=majority
   ```

### 6. Configure for DrugFacts

Replace the placeholders in your connection string:
- `<username>`: Your database username
- `<password>`: Your database password
- `<cluster-name>`: Your cluster name

Add the database name:
```
mongodb+srv://drugfacts_user:your_password@drugfacts-cluster.xxxxx.mongodb.net/drug_facts?retryWrites=true&w=majority
```

### 7. Set Environment Variable in DigitalOcean

1. Go to your DigitalOcean App Platform dashboard
2. Select your app
3. Go to Settings → Environment Variables
4. Add:
   - Key: `MONGODB_ATLAS_URL`
   - Value: Your complete connection string
   - Type: Secret
5. Save and redeploy

## Database Initialization

### Create Collections and Indexes

Once connected, the application will automatically create:
- `drugs` collection with indexes on slug, name, and therapeutic class
- `therapeutic_classes` collection
- `manufacturers` collection

### Seed Initial Data

Use the database seeder to populate initial drug data:

1. **Local Seeding** (before deployment):
   ```bash
   export MONGODB_URL="your-atlas-connection-string"
   docker-compose --profile basic-seeder run --rm db-seeder
   ```

2. **Or Manual Import**:
   - Use MongoDB Compass or Atlas UI
   - Import `data/drugs/Labels.json`

## Security Best Practices

### 1. IP Whitelisting

After initial setup, restrict network access:
1. Get DigitalOcean App Platform outbound IPs
2. Remove "Allow from Anywhere"
3. Add only specific IPs

### 2. Database User Permissions

Create a dedicated user with minimal permissions:
```javascript
db.createUser({
  user: "drugfacts_app",
  pwd: "secure_password",
  roles: [
    { role: "readWrite", db: "drug_facts" }
  ]
})
```

### 3. Connection String Security

- Never commit connection strings to Git
- Use environment variables
- Enable "Require TLS/SSL" in Atlas

## Monitoring and Alerts

### Atlas Monitoring

1. Go to **Monitoring** tab in Atlas
2. Monitor:
   - Connection count
   - Operation execution time
   - Database size
   - Network traffic

### Set Up Alerts

1. Go to **Alerts** in Atlas
2. Create alerts for:
   - High connection count
   - Slow queries
   - Disk usage > 80%

## Backup Strategy

### Automatic Backups

M0 (free) tier includes:
- Daily snapshots
- 2-day retention

### Manual Backups

For important data:
```bash
mongodump --uri="your-atlas-connection-string" --out=backup/
```

## Troubleshooting

### Connection Issues

1. **Authentication Failed**:
   - Verify username/password
   - Check user exists in Database Access
   - Ensure password is URL-encoded if it contains special characters

2. **Network Timeout**:
   - Check IP whitelist in Network Access
   - Verify cluster is not paused
   - Try connecting from allowed IP

3. **SSL/TLS Errors**:
   - Ensure connection string includes `?ssl=true`
   - Update MongoDB driver if needed

### Performance Issues

1. **Slow Queries**:
   - Check indexes are created
   - Use Atlas Performance Advisor
   - Review slow query log

2. **Connection Limits**:
   - M0 tier has 500 connection limit
   - Implement connection pooling
   - Monitor active connections

## Migration from Local MongoDB

If migrating from local MongoDB:

```bash
# Export from local
mongodump --uri="mongodb://localhost:27017/drug_facts" --out=dump/

# Import to Atlas
mongorestore --uri="your-atlas-connection-string" dump/
```

## Cost Considerations

### Free Tier (M0) Limitations:
- 512MB storage
- Shared RAM/CPU
- No dedicated resources
- 500 connections max

### When to Upgrade:
- Storage > 400MB
- Need better performance
- Require advanced features
- Need dedicated resources

### Next Tier (M10):
- ~$57/month
- 2GB RAM
- Dedicated resources
- Better performance