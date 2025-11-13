# SNIPE Giveaway - PostgreSQL Edition

Production-ready giveaway system with PostgreSQL database for reliable data persistence.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/deploy?template=https://github.com/yourusername/giveaway-backend)

## 🚀 One Command to Run Everything

```bash
docker-compose up
```

That's it! Visit http://localhost:3000

## 📁 Minimal Files

```
giveaway-backend/
├── breakpoint-giveaway.html  # UI form
├── server-postgres.js        # Backend server (PostgreSQL)
├── Dockerfile                # Docker config
├── docker-compose.yml        # Local development with PostgreSQL
└── RAILWAY-POSTGRES-SETUP.md # Railway deployment guide
```

## 🎯 Features

- **PostgreSQL Database** - Production-ready, reliable persistence
- **Auto Setup** - Database tables created automatically
- **100% Data Persistence** - Never lose entries on redeploy
- **Docker Compose** - Local development with real PostgreSQL

## 📡 Endpoints

- **UI**: http://localhost:3000
- **API**: http://localhost:3000/api
  - `POST /api/giveaway/enter` - Submit entry
  - `GET /api/giveaway/entries` - View all entries
  - `GET /api/giveaway/export` - Download CSV

## 🧪 Test the API

```bash
# Submit a test entry
curl -X POST http://localhost:3000/api/giveaway/enter \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "telegram": "@testuser",
    "xusername": "@testx"
  }'

# View all entries
curl http://localhost:3000/api/giveaway/entries | jq

# Export to CSV
curl http://localhost:3000/api/giveaway/export > entries.csv
```

## 💾 Database

PostgreSQL database with automatic persistence on Railway.

**Local Development:**
```bash
# Connect to local PostgreSQL
docker exec -it snipe-postgres psql -U snipe_user -d snipe_giveaway

# View entries
\dt  # List tables
SELECT * FROM giveaway_entries;
\q   # Exit
```

**Production (Railway):**
- Database automatically provisioned
- Access via Railway dashboard → PostgreSQL → Data tab

## 🛠️ Docker Commands

```bash
# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Rebuild after changes
docker-compose up --build

# Remove everything (including data)
docker-compose down -v
rm -rf data/
```

## 🔧 Development

To run without Docker:
```bash
npm install express@4.18.2 cors@2.8.5 sqlite3@5.1.6
node server-simple.js
```

## 🏃 Quick Deploy

1. Copy these 4 files to your server:
   - `breakpoint-giveaway.html`
   - `server-simple.js`
   - `Dockerfile`
   - `docker-compose.yml`

2. Run: `docker-compose up -d`

3. Done! Access at http://your-server:3000

## 🔒 Production Tips

- Add SSL/HTTPS with a reverse proxy (nginx, Caddy)
- Set up firewall rules
- Regular backups: `cp -r data/ backup-$(date +%Y%m%d)/`
- Monitor with: `docker-compose logs -f`

## 🌐 Railway Deployment

1. **Add PostgreSQL** to your Railway project (New → Database → PostgreSQL)
2. **Push this code** - Railway auto-detects and uses PostgreSQL
3. **Done!** Data persists automatically

See [RAILWAY-POSTGRES-SETUP.md](RAILWAY-POSTGRES-SETUP.md) for detailed instructions.

## 💾 Access Your Data

```bash
# Download all entries as CSV
curl https://your-app.railway.app/api/giveaway/export > entries.csv

# View entry count
curl https://your-app.railway.app/api/giveaway/count

# Check health
curl https://your-app.railway.app/api/giveaway/health
```

### Automated Backups
GitHub Actions automatically backs up your data daily. Check `.github/workflows/backup.yml`.

That's all! Super simple, fully containerized giveaway system. 🎉