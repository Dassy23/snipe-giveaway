# 🐘 Railway PostgreSQL Setup

## Step 1: Add PostgreSQL to Your Railway Project

1. **Open your Railway project dashboard**
2. Click **"New"** → **"Database"** → **"PostgreSQL"**
3. Railway will create a PostgreSQL instance and automatically set `DATABASE_URL`

## Step 2: Connect Your App

Railway automatically injects the `DATABASE_URL` environment variable into your app. No manual configuration needed!

## Step 3: Deploy Updated Code

```bash
git add .
git commit -m "Switch to PostgreSQL for reliable persistence"
git push
```

Railway will automatically:
- Detect the changes
- Rebuild your app
- Connect to PostgreSQL using `DATABASE_URL`

## Step 4: Verify Everything Works

1. **Check health endpoint:**
   ```bash
   curl https://your-app.railway.app/health
   ```
   Should show: `"database": "connected"`

2. **Test data persistence:**
   ```bash
   # Add entry
   curl -X POST https://your-app.railway.app/api/giveaway/enter \
     -H "Content-Type: application/json" \
     -d '{"email":"test@postgres.com","telegram":"@test","xusername":"@test"}'
   
   # Check count
   curl https://your-app.railway.app/api/giveaway/count
   ```

## 🎯 Benefits

- **100% Data Persistence** - Never lose data again
- **Automatic Backups** - Railway handles it
- **No Volume Setup** - Just works
- **Better Performance** - PostgreSQL is production-ready
- **SQL Access** - Query your data directly if needed

## 🔧 Database Management

### View Data in Railway:
1. Click on your PostgreSQL service
2. Go to "Data" tab
3. Run SQL queries directly

### Useful Queries:
```sql
-- View all entries
SELECT * FROM giveaway_entries ORDER BY created_at DESC;

-- Count by day
SELECT DATE(created_at) as day, COUNT(*) as signups 
FROM giveaway_entries 
GROUP BY DATE(created_at);

-- Export data
COPY giveaway_entries TO '/tmp/entries.csv' CSV HEADER;
```

## 🚨 Important Note

Once deployed, your app will use PostgreSQL exclusively. The SQLite code is completely replaced.

That's it! Your data will now persist reliably through all deployments! 🎉
