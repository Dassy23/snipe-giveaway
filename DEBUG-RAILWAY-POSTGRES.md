# 🔍 Debug Railway PostgreSQL Connection

## Check These Things on Railway:

### 1. Is PostgreSQL Service Added?
- Go to your Railway project
- You should see TWO services:
  - Your app (snipe-giveaway)
  - PostgreSQL database

### 2. Are They Connected?
- Click on your app service
- Go to "Variables" tab
- You should see `DATABASE_URL` listed
- It should start with: `postgresql://`

### 3. Check Logs
Look for these messages in your app's logs:

```
🔍 DATABASE_URL exists: true
🔍 NODE_ENV: production
🔄 Testing database connection...
✅ Connected to PostgreSQL database at: [timestamp]
```

If you see:
- `DATABASE_URL exists: false` → Variables not connected
- Connection error → Database not reachable

## Quick Fixes:

### If DATABASE_URL is Missing:
1. Click your app service → Variables
2. Click "Add Reference"
3. Select your PostgreSQL → DATABASE_URL
4. Redeploy

### If Still Not Working:
1. **Delete both services**
2. **Deploy fresh:**
   ```bash
   # First, add PostgreSQL to Railway
   railway add postgresql
   
   # Then deploy your app
   railway up
   ```

### Manual Variable Setup (Last Resort):
1. Click PostgreSQL service → Variables
2. Copy the DATABASE_URL value
3. Click your app service → Variables
4. Add new variable: DATABASE_URL = [paste value]

## Test Connection Directly:

Use Railway CLI:
```bash
railway run node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
pool.query('SELECT NOW()', (err, res) => {
  console.log(err ? 'Error: ' + err.message : 'Connected: ' + res.rows[0].now);
  pool.end();
});
"
```

## Common Issues:

1. **Two separate Railway projects** - Make sure DB and app are in SAME project
2. **Variable not referenced** - Must link DATABASE_URL between services
3. **SSL required** - Railway PostgreSQL requires SSL (we handle this)

The updated code has better error messages - check your logs!
