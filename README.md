# SNIPE Giveaway - Docker Edition

Ultra-simple giveaway system with UI and backend in one Docker container.

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
├── server-simple.js          # Backend server
├── Dockerfile                # Docker config
├── docker-compose.yml        # Easy run command
└── data/                     # Database storage (auto-created)
```

## 🎯 Features

- **Single Container** - Everything runs in one lightweight container
- **Auto Setup** - Dependencies installed automatically
- **Persistent Data** - Database saved in `./data` directory
- **Zero Config** - Just run and it works

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

SQLite database is stored in `./data/giveaway.db` and persists between container restarts.

```bash
# View entries directly
sqlite3 data/giveaway.db "SELECT * FROM giveaway_entries;"

# Reset database
rm -rf data/
```

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

## 🌐 Easy Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for one-click deployment to:
- Railway (easiest)
- Render (free tier)
- Fly.io (global)
- Any VPS

## 💾 Backup Your Data

```bash
# Quick backup
./backup.sh

# Or via API
curl http://localhost:3000/api/giveaway/export > entries.csv
```

That's all! Super simple, fully containerized giveaway system. 🎉