#!/bin/bash

# Simple backup script for SNIPE Giveaway data

echo "🔄 Backing up SNIPE Giveaway data..."

# Create backup directory
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Method 1: Export via API (if server is running)
if curl -s http://localhost:3000/health > /dev/null; then
    echo "📥 Exporting via API..."
    curl -s http://localhost:3000/api/giveaway/export > "$BACKUP_DIR/entries.csv"
    curl -s http://localhost:3000/api/giveaway/entries > "$BACKUP_DIR/entries.json"
    echo "✅ API export complete"
fi

# Method 2: Direct database copy
if [ -f "data/giveaway.db" ]; then
    echo "💾 Copying database file..."
    cp data/giveaway.db "$BACKUP_DIR/giveaway.db"
    
    # Also create SQL dump
    if command -v sqlite3 &> /dev/null; then
        sqlite3 data/giveaway.db .dump > "$BACKUP_DIR/giveaway.sql"
        
        # Generate statistics
        echo "📊 Generating statistics..."
        sqlite3 data/giveaway.db <<EOF > "$BACKUP_DIR/statistics.txt"
.mode column
.headers on
SELECT 'Total Entries' as Metric, COUNT(*) as Value FROM giveaway_entries
UNION ALL
SELECT 'Unique Emails', COUNT(DISTINCT email) FROM giveaway_entries
UNION ALL
SELECT 'With Wallet', COUNT(*) FROM giveaway_entries WHERE wallet IS NOT NULL
UNION ALL
SELECT 'Last Entry', MAX(created_at) FROM giveaway_entries;

SELECT '---' as '---';

SELECT DATE(created_at) as Date, COUNT(*) as Signups 
FROM giveaway_entries 
GROUP BY DATE(created_at) 
ORDER BY Date DESC 
LIMIT 7;
EOF
    fi
    echo "✅ Database backup complete"
fi

echo ""
echo "✅ Backup completed in: $BACKUP_DIR"
echo ""
ls -la "$BACKUP_DIR"

# Optional: Upload to cloud storage
# aws s3 cp "$BACKUP_DIR" "s3://your-bucket/snipe-backups/$BACKUP_DIR" --recursive
# gsutil cp -r "$BACKUP_DIR" "gs://your-bucket/snipe-backups/"
