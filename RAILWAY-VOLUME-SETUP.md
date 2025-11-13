# 🚨 IMPORTANT: Railway Volume Setup Required!

Your data isn't persisting because Railway volumes must be **manually created** in the dashboard.

## ✅ Quick Fix (2 minutes)

### Step 1: Open Railway Dashboard
1. Go to your Railway project
2. Click on your **snipe-giveaway** service

### Step 2: Create Volume
1. Click **"Settings"** tab
2. Scroll down to **"Volumes"** section
3. Click **"Create Volume"** button
4. Set:
   - Mount Path: `/app/data`
   - Click **"Create"**

### Step 3: Redeploy
Railway will automatically redeploy with the volume attached.

## 📸 Visual Guide

```
Railway Dashboard
└── Your Project
    └── snipe-giveaway (click this)
        └── Settings tab
            └── Volumes section
                └── Create Volume button
                    └── Mount Path: /app/data
```

## 🧪 Test Persistence

1. **Add test entry:**
```bash
curl -X POST https://your-app.railway.app/api/giveaway/enter \
  -H "Content-Type: application/json" \
  -d '{"email":"persistence-test@example.com","telegram":"@test","xusername":"@test"}'
```

2. **Check count:**
```bash
curl https://your-app.railway.app/api/giveaway/count
# Should show: {"success":true,"count":1}
```

3. **Trigger redeploy** (push any small change)

4. **Verify data persisted:**
```bash
curl https://your-app.railway.app/api/giveaway/count
# Should still show: {"success":true,"count":1}
```

## ❓ Still Not Working?

Run these debug commands with Railway CLI:

```bash
# Check if volume is mounted
railway run df -h | grep /app/data

# List data directory
railway run ls -la /app/data/

# Check database directly
railway run sqlite3 /app/data/giveaway.db "SELECT COUNT(*) FROM giveaway_entries;"
```

## 💡 Alternative: Use Railway's PostgreSQL

If SQLite volumes continue to have issues:

1. Add PostgreSQL to your Railway project
2. It persists automatically (no volume setup needed)
3. We can update the code to use PostgreSQL

**The volume MUST be created in Railway Dashboard - the config files alone don't create it!**
