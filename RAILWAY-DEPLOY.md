# 🚂 Deploy to Railway - Step by Step

## Prerequisites
- GitHub account
- Railway account (sign up at [railway.app](https://railway.app))

## Step 1: Push to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - SNIPE Giveaway"

# Create a new repo on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/snipe-giveaway.git
git push -u origin main
```

## Step 2: Deploy to Railway

### Option A: One-Click Deploy (After pushing to GitHub)
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account
5. Select your `snipe-giveaway` repository
6. Railway will auto-detect Docker and start deploying!

### Option B: Railway CLI
```bash
# Install Railway CLI
curl -fsSL https://railway.app/install.sh | sh

# Login
railway login

# Deploy
railway up
```

## Step 3: Your App is Live! 🎉

Railway will provide you a URL like:
```
https://snipe-giveaway-production.up.railway.app
```

Visit this URL to see your giveaway form!

## 📊 Getting Your Data

### Method 1: Download CSV Anytime
```bash
# Replace with your Railway URL
curl https://your-app.up.railway.app/api/giveaway/export > entries.csv
```

### Method 2: View All Entries (JSON)
```bash
curl https://your-app.up.railway.app/api/giveaway/entries | jq
```

### Method 3: Railway CLI Access
```bash
# Connect to your project
railway link

# Run commands in production
railway run sqlite3 /app/data/giveaway.db ".mode csv" ".output entries.csv" "SELECT * FROM giveaway_entries;" ".exit"
railway run cat entries.csv > local-entries.csv
```

### Method 4: Quick Stats
```bash
# Get entry count
curl https://your-app.up.railway.app/api/giveaway/count
```

## 🔧 Monitoring

### View Logs
```bash
railway logs

# Or in dashboard
# Go to your project → Deployments → View logs
```

### Check Health
```bash
curl https://your-app.up.railway.app/health
```

## 💾 Automated Backups

Add this GitHub Action to `.github/workflows/backup.yml`:

```yaml
name: Backup Giveaway Data

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  workflow_dispatch:  # Manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Download entries
        run: |
          curl -o entries-$(date +%Y%m%d).csv \
            https://your-app.up.railway.app/api/giveaway/export
            
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: giveaway-backup-$(date +%Y%m%d)
          path: entries-*.csv
```

## 🔒 Add Security (Optional)

To protect your export endpoint, add an environment variable in Railway:

1. Go to your project settings
2. Add variable: `ADMIN_TOKEN=your-secret-token-here`
3. Update `server-simple.js`:

```javascript
// Add to export endpoint
app.get('/api/giveaway/export', (req, res) => {
  const token = req.headers.authorization;
  if (process.env.ADMIN_TOKEN && token !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // ... rest of code
});
```

Then use:
```bash
curl -H "Authorization: Bearer your-secret-token-here" \
  https://your-app.up.railway.app/api/giveaway/export > entries.csv
```

## 📈 Railway Features

- **Auto-deploy** on every git push
- **Persistent volume** at `/app/data`
- **Custom domains** (add your own domain)
- **Metrics** in dashboard
- **Rollbacks** to previous versions

## 🚨 Troubleshooting

### If deployment fails:
1. Check logs in Railway dashboard
2. Ensure all files are committed to git
3. Try: `railway up --detach`

### If data isn't persisting:
1. Make sure volume is mounted at `/app/data`
2. Check: `railway run ls -la /app/data`

### Quick fixes:
```bash
# Restart
railway restart

# Redeploy
railway up

# Check status
railway status
```

---

That's it! Your giveaway is live on Railway. Share your URL and start collecting entries! 🚀
