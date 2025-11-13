# 🔐 Data Backup Strategy for Railway

## Automated Daily Backups

### 1. GitHub Actions Backup (Recommended)

Create `.github/workflows/backup.yml`:

```yaml
name: Daily Backup

on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM UTC daily
  workflow_dispatch:  # Manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Create backup directory
        run: mkdir -p backups
        
      - name: Download giveaway data
        run: |
          DATE=$(date +%Y%m%d-%H%M%S)
          curl -o backups/entries-$DATE.csv \
            ${{ secrets.APP_URL }}/api/giveaway/export
            
      - name: Get entry count
        run: |
          curl ${{ secrets.APP_URL }}/api/giveaway/count \
            > backups/count-$(date +%Y%m%d).json
            
      - name: Upload to GitHub
        uses: actions/upload-artifact@v3
        with:
          name: backup-$(date +%Y%m%d)
          path: backups/
          retention-days: 30
          
      # Optional: Upload to S3/Google Drive
      - name: Upload to S3
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          aws s3 sync backups/ s3://your-bucket/snipe-backups/
```

### 2. Local Scheduled Backups

Add to your crontab:
```bash
# Every 6 hours
0 */6 * * * curl https://your-app.railway.app/api/giveaway/export > ~/snipe-backups/$(date +\%Y\%m\%d-\%H\%M\%S).csv
```

### 3. Railway CLI Backup

```bash
# Direct database backup via Railway CLI
railway run sqlite3 /app/data/giveaway.db .dump > backup-$(date +%Y%m%d).sql
```

## Monitoring & Alerts

### Add Health Checks

1. **UptimeRobot** (Free):
   - Monitor: `https://your-app.railway.app/health`
   - Alert on downtime
   - Check every 5 minutes

2. **Better Stack** (Free tier):
   - More detailed monitoring
   - Status page
   - Incident alerts

### Add to your app:

```javascript
// In server-simple.js, add detailed health check
app.get('/health', (req, res) => {
  db.get('SELECT COUNT(*) as count FROM giveaway_entries', (err, row) => {
    if (err) {
      return res.status(500).json({ 
        status: 'unhealthy', 
        error: 'Database error' 
      });
    }
    res.json({ 
      status: 'healthy',
      entries: row.count,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });
});
```

## Recovery Plan

### If Something Goes Wrong:

1. **Check Railway Dashboard**:
   - View logs: `railway logs`
   - Check volume status
   - Verify deployments

2. **Restore from Backup**:
   ```bash
   # If you have SQL backup
   railway run sqlite3 /app/data/giveaway.db < backup.sql
   
   # If you have CSV backup
   # Create import endpoint or use SQLite directly
   ```

3. **Export Before Major Changes**:
   ```bash
   # Always backup before updates
   curl https://your-app.railway.app/api/giveaway/export > pre-update-backup.csv
   ```

## Best Practices

1. **Regular Exports**: Download CSV weekly
2. **Test Restores**: Verify backups work
3. **Multiple Locations**: Store backups in 2+ places
4. **Monitor Health**: Set up alerts
5. **Document URLs**: Keep your export URL handy

## Quick Commands

```bash
# Check if app is healthy
curl https://your-app.railway.app/health

# Count entries
curl https://your-app.railway.app/api/giveaway/count

# Export all data
curl https://your-app.railway.app/api/giveaway/export > backup.csv

# View recent entries (add limit param)
curl https://your-app.railway.app/api/giveaway/entries
```
