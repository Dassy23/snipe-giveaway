# 🔧 Fix Railway Persistence Issue

## The Problem
Railway volumes need to be explicitly created and attached. The configuration alone isn't enough.

## Solution Steps

### 1. Create the Volume in Railway Dashboard

1. Go to your Railway project dashboard
2. Click on your service (snipe-giveaway)
3. Go to the **"Settings"** tab
4. Scroll to **"Volumes"**
5. Click **"Add Volume"**
6. Configure:
   - Mount path: `/app/data`
   - Volume name: `data` (or any name)
   - Size: 1GB (default is fine)

### 2. Alternative: Use Railway CLI

```bash
# Install Railway CLI if not already
npm install -g @railway/cli

# Login and link project
railway login
railway link

# Create volume
railway volume add --mount /app/data

# Verify volume exists
railway volume list
```

### 3. Update Your Code (Already Done)

Your code is already set up correctly:
```javascript
const dataDir = process.env.NODE_ENV === 'production' ? '/app/data' : __dirname;
```

### 4. Verify Persistence

After creating the volume:

1. **Add test data**:
```bash
curl -X POST https://your-app.railway.app/api/giveaway/enter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@persistence.com","telegram":"@test","xusername":"@test"}'
```

2. **Check it saved**:
```bash
curl https://your-app.railway.app/api/giveaway/count
```

3. **Push a small update** (like changing a comment) and redeploy

4. **Verify data still exists**:
```bash
curl https://your-app.railway.app/api/giveaway/count
```

## Alternative Solutions

### Option A: PostgreSQL (Most Reliable)

Railway has native PostgreSQL support:

1. Add PostgreSQL service to your project
2. Update connection in your code
3. Data persists automatically

### Option B: External Storage

Use a cloud database:
- Supabase (free tier)
- PlanetScale (MySQL)
- Neon (PostgreSQL)

### Option C: File-based with Explicit Path

Update server to ensure directory exists:

```javascript
// Add this before creating database
const fs = require('fs');
const dataDir = process.env.NODE_ENV === 'production' ? '/app/data' : __dirname;

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
```

## Quick Debug Commands

```bash
# Check if volume is mounted
railway run ls -la /app/data

# Check database file exists
railway run ls -la /app/data/giveaway.db

# Direct database query
railway run sqlite3 /app/data/giveaway.db "SELECT COUNT(*) FROM giveaway_entries;"
```

## Most Common Fix

**90% of the time, the issue is the volume wasn't created in Railway dashboard.**

Go to: Your Project → Your Service → Settings → Volumes → Add Volume
