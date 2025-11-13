const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from current directory

// PostgreSQL connection
// Railway provides DATABASE_URL automatically when you add PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
async function initializeDatabase() {
  try {
    // Create giveaway_entries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS giveaway_entries (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        telegram VARCHAR(255) NOT NULL,
        xusername VARCHAR(255) NOT NULL,
        wallet VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create giveaway_stats table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS giveaway_stats (
        id SERIAL PRIMARY KEY,
        total_entries INTEGER DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Initialize stats if not exists
    const statsResult = await pool.query('SELECT * FROM giveaway_stats WHERE id = 1');
    if (statsResult.rows.length === 0) {
      await pool.query('INSERT INTO giveaway_stats (id, total_entries) VALUES (1, 0)');
    }

    console.log('✅ Database initialized successfully');
  } catch (err) {
    console.error('❌ Database initialization error:', err);
    throw err;
  }
}

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

// Health check with database status
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM giveaway_entries');
    const count = result.rows[0].count;
    
    res.json({ 
      status: 'healthy',
      service: 'SNIPE Giveaway API (PostgreSQL)',
      database: 'connected',
      entries: parseInt(count),
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'unhealthy', 
      service: 'SNIPE Giveaway API (PostgreSQL)',
      database: 'error',
      error: err.message 
    });
  }
});

// Submit new entry
app.post('/api/giveaway/enter', async (req, res) => {
  const { email, telegram, xusername, wallet } = req.body;

  // Validate required fields
  if (!email || !telegram || !xusername) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email, Telegram, and X username are required' 
    });
  }

  const client = await pool.connect();
  try {
    // Start transaction
    await client.query('BEGIN');

    // Insert entry
    const insertResult = await client.query(
      `INSERT INTO giveaway_entries (email, telegram, xusername, wallet) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, telegram, xusername, wallet`,
      [email, telegram, xusername, wallet || null]
    );

    // Update stats
    await client.query(
      `UPDATE giveaway_stats 
       SET total_entries = total_entries + 1, 
           last_updated = CURRENT_TIMESTAMP 
       WHERE id = 1`
    );

    // Commit transaction
    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Entry submitted successfully',
      entry: insertResult.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    
    if (err.code === '23505') { // Unique constraint violation
      return res.status(409).json({ 
        success: false, 
        error: 'Email already registered' 
      });
    }
    
    console.error('Database error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Database error' 
    });
  } finally {
    client.release();
  }
});

// Get all entries
app.get('/api/giveaway/entries', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, telegram, xusername, wallet, created_at 
       FROM giveaway_entries 
       ORDER BY created_at DESC`
    );
    
    res.json({
      success: true,
      entries: result.rows,
      count: result.rows.length
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Database error' 
    });
  }
});

// Get entry count
app.get('/api/giveaway/count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM giveaway_entries');
    
    res.json({
      success: true,
      count: parseInt(result.rows[0].count)
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Database error' 
    });
  }
});

// Export entries as CSV
app.get('/api/giveaway/export', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT email, telegram, xusername, wallet, created_at 
       FROM giveaway_entries 
       ORDER BY created_at DESC`
    );

    // Create CSV
    const csv = [
      'Email,Telegram,X Username,Wallet,Signup Date',
      ...result.rows.map(row => 
        `"${row.email}","${row.telegram}","${row.xusername}","${row.wallet || ''}","${row.created_at}"`
      )
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="snipe_giveaway_entries.csv"');
    res.send(csv);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Database error' 
    });
  }
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL database');
    
    // Initialize database
    await initializeDatabase();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`
🚀 SNIPE Giveaway is running!

🌐 Open in browser: http://localhost:${PORT}

📌 What's available:
  • UI Form: http://localhost:${PORT}
  • API Server: http://localhost:${PORT}/api
  • Database: PostgreSQL (Railway)

🔧 API Endpoints:
  • POST /api/giveaway/enter    - Submit new entry
  • GET  /api/giveaway/entries  - Get all entries
  • GET  /api/giveaway/count    - Get entry count
  • GET  /api/giveaway/export   - Download CSV
  • GET  /health                - Health check

✨ Data persists in Railway PostgreSQL!
      `);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await pool.end();
  process.exit(0);
});

// Start the server
startServer();
