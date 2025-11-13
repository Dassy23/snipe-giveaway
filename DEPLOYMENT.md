# 🚀 Easy Deployment Options for SNIPE Giveaway

## 1. Railway (Easiest - One Click)

### Deploy:
1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub"
4. Select your repo
5. Railway auto-detects Docker and deploys!

### Extract Data:
```bash
# SSH into container via Railway CLI
railway run sqlite3 /app/data/giveaway.db .dump > backup.sql

# Or use the API
curl https://your-app.railway.app/api/giveaway/export > entries.csv
```

**Cost:** ~$5/month or free tier available

---

## 2. Render (Free Tier Available)

### Deploy:
1. Create `render.yaml` in your project:
```yaml
services:
  - type: web
    name: snipe-giveaway
    env: docker
    dockerfilePath: ./Dockerfile
    disk:
      name: data
      mountPath: /app/data
      sizeGB: 1
```

2. Push to GitHub
3. Connect on [render.com](https://render.com)
4. It auto-deploys!

### Extract Data:
```bash
# Download via Render dashboard or API
curl https://your-app.onrender.com/api/giveaway/export > entries.csv
```

**Cost:** Free tier (spins down after 15 min inactivity)

---

## 3. Fly.io (Global, Fast)

### Deploy:
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Deploy
fly launch
fly deploy

# Create volume for data persistence
fly volumes create data --size 1
```

Update `fly.toml`:
```toml
[mounts]
  source="data"
  destination="/app/data"
```

### Extract Data:
```bash
# SSH into container
fly ssh console

# Inside container
sqlite3 /app/data/giveaway.db .dump > backup.sql

# Or from outside
fly ssh console -C "sqlite3 /app/data/giveaway.db .dump" > backup.sql
```

**Cost:** ~$2/month for small app

---

## 4. DigitalOcean App Platform

### Deploy:
1. Push to GitHub
2. Create app on [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
3. Select Docker as build type
4. Deploy!

### Extract Data:
```bash
# Use console in DO dashboard or API
curl https://your-app.ondigitalocean.app/api/giveaway/export > entries.csv
```

**Cost:** $5/month minimum

---

## 5. Any VPS (Most Control)

### Deploy:
```bash
# On any Ubuntu/Debian VPS
ssh your-server

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone your repo
git clone your-repo
cd giveaway-backend

# Run
docker-compose up -d
```

### Extract Data:
```bash
# Direct file access
scp user@your-server:~/giveaway-backend/data/giveaway.db ./local-backup.db

# Or use API
curl http://your-server:3000/api/giveaway/export > entries.csv
```

**Cost:** $5-10/month (Linode, Vultr, Hetzner)

---

## 📊 Data Extraction Methods

### Method 1: API Export (Easiest)
```bash
# Works on any deployment
curl https://your-deployed-app.com/api/giveaway/export > giveaway_entries.csv
```

### Method 2: Direct Database Download
```bash
# For VPS/SSH access
scp user@server:/path/to/data/giveaway.db ./backup.db

# View locally
sqlite3 backup.db "SELECT * FROM giveaway_entries;"
```

### Method 3: Scheduled Backups
Add this to your server:
```bash
# backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d)
curl https://your-app.com/api/giveaway/export > backup_$DATE.csv

# Cron job (daily at 2am)
0 2 * * * /home/user/backup.sh
```

### Method 4: Database Queries
```sql
-- Connect to SQLite
sqlite3 data/giveaway.db

-- Export as CSV
.mode csv
.output entries.csv
SELECT * FROM giveaway_entries;
.output stdout

-- Get statistics
SELECT COUNT(*) as total_entries FROM giveaway_entries;
SELECT DATE(created_at) as signup_date, COUNT(*) as daily_signups 
FROM giveaway_entries 
GROUP BY DATE(created_at);
```

---

## 🏆 Recommendation

**For easiest deployment + data access:**
1. **Railway** or **Render** for quick start
2. **Fly.io** for global distribution
3. **VPS** for full control

**For data extraction:**
- Use the built-in `/api/giveaway/export` endpoint
- Set up automated daily backups
- Download the SQLite file directly when needed

---

## 🔒 Security Tips

1. Add basic auth to admin endpoints:
```javascript
// In server-simple.js
app.get('/api/giveaway/export', (req, res) => {
  const auth = req.headers.authorization;
  if (auth !== 'Bearer YOUR-SECRET-TOKEN') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // ... rest of export code
});
```

2. Use environment variables:
```javascript
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'default-token';
```

3. Set in deployment platform:
- Railway: Add in dashboard
- Render: Environment section
- Fly.io: `fly secrets set ADMIN_TOKEN=your-secret`
