const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from current directory

// Database setup
// Use /app/data in Docker, or current directory locally
const dataDir = process.env.NODE_ENV === 'production' ? '/app/data' : __dirname;
const dbPath = path.join(dataDir, 'giveaway.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Create giveaway_entries table
  db.run(`
    CREATE TABLE IF NOT EXISTS giveaway_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      telegram TEXT NOT NULL,
      xusername TEXT NOT NULL,
      wallet TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create giveaway_stats table
  db.run(`
    CREATE TABLE IF NOT EXISTS giveaway_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_entries INTEGER DEFAULT 0,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Initialize stats if not exists
  db.run(`
    INSERT OR IGNORE INTO giveaway_stats (id, total_entries) VALUES (1, 0)
  `);
});

// Routes

// Serve the HTML file at root
app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, 'breakpoint-giveaway.html');
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.send(`
      <h1>SNIPE Giveaway Backend</h1>
      <p>API is running! Place your breakpoint-giveaway.html file in this directory.</p>
      <p>API Endpoints:</p>
      <ul>
        <li>POST /api/giveaway/enter - Submit entry</li>
        <li>GET /api/giveaway/entries - Get all entries</li>
        <li>GET /api/giveaway/count - Get count</li>
        <li>GET /api/giveaway/export - Export CSV</li>
      </ul>
    `);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'SNIPE Giveaway API (Simple)' });
});

// Submit new entry
app.post('/api/giveaway/enter', (req, res) => {
  const { email, telegram, xusername, wallet } = req.body;

  // Validate required fields
  if (!email || !telegram || !xusername) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email, Telegram, and X username are required' 
    });
  }

  // Insert entry
  db.run(
    `INSERT INTO giveaway_entries (email, telegram, xusername, wallet) VALUES (?, ?, ?, ?)`,
    [email, telegram, xusername, wallet || null],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ 
            success: false, 
            error: 'Email already registered' 
          });
        }
        console.error('Database error:', err);
        return res.status(500).json({ 
          success: false, 
          error: 'Database error' 
        });
      }

      // Update stats
      db.run(
        `UPDATE giveaway_stats SET total_entries = total_entries + 1, last_updated = CURRENT_TIMESTAMP WHERE id = 1`
      );

      res.json({
        success: true,
        message: 'Entry submitted successfully',
        entry: {
          id: this.lastID,
          email,
          telegram,
          xusername,
          wallet
        }
      });
    }
  );
});

// Get all entries
app.get('/api/giveaway/entries', (req, res) => {
  db.all(
    `SELECT id, email, telegram, xusername, wallet, created_at FROM giveaway_entries ORDER BY created_at DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ 
          success: false, 
          error: 'Database error' 
        });
      }
      res.json({
        success: true,
        entries: rows,
        count: rows.length
      });
    }
  );
});

// Get entry count
app.get('/api/giveaway/count', (req, res) => {
  db.get(
    `SELECT COUNT(*) as count FROM giveaway_entries`,
    [],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ 
          success: false, 
          error: 'Database error' 
        });
      }
      res.json({
        success: true,
        count: row.count
      });
    }
  );
});

// Export entries as CSV
app.get('/api/giveaway/export', (req, res) => {
  db.all(
    `SELECT email, telegram, xusername, wallet, created_at FROM giveaway_entries ORDER BY created_at DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ 
          success: false, 
          error: 'Database error' 
        });
      }

      // Create CSV
      const csv = [
        'Email,Telegram,X Username,Wallet,Signup Date',
        ...rows.map(row => 
          `"${row.email}","${row.telegram}","${row.xusername}","${row.wallet || ''}","${row.created_at}"`
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="snipe_giveaway_entries.csv"');
      res.send(csv);
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 SNIPE Giveaway is running!

🌐 Open in browser: http://localhost:${PORT}

📌 What's available:
  • UI Form: http://localhost:${PORT}
  • API Server: http://localhost:${PORT}/api
  • Database: ${dbPath}

🔧 API Endpoints:
  • POST /api/giveaway/enter    - Submit new entry
  • GET  /api/giveaway/entries  - Get all entries
  • GET  /api/giveaway/count    - Get entry count
  • GET  /api/giveaway/export   - Download CSV
  • GET  /health                - Health check

✨ The UI form is now served directly from the backend!
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.close((err) => {
    if (err) console.error('Error closing database:', err);
    process.exit(0);
  });
});
