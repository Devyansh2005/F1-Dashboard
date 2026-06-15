const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'f1_dashboard.db');

// Middleware
app.use(cors());
app.use(express.json());

// Serve static assets from public folder (e.g. driver images)
app.use(express.static(path.join(__dirname, '../public')));

// Connect to SQLite Database
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Failed to connect to F1 SQLite database:', err.message);
    process.exit(1);
  }
  console.log('Connected to F1 SQLite database successfully.');
});

// API Routes

// 1. Get all drivers (basic list)
app.get('/api/drivers', (req, res) => {
  const query = `
    SELECT driverId, permanentNumber, code, givenName, familyName, nationality, team, imageUrl
    FROM drivers
    ORDER BY familyName ASC
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(rows);
  });
});

// 2. Get detailed driver profile by driverId or code
app.get('/api/drivers/:id', (req, res) => {
  const driverIdentifier = req.params.id.toLowerCase();
  
  // Query matches either driverId (e.g., 'hamilton') or three-letter code (e.g., 'HAM')
  const query = `
    SELECT *
    FROM drivers
    WHERE LOWER(driverId) = ? OR LOWER(code) = ?
  `;
  db.get(query, [driverIdentifier, driverIdentifier], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Database query failed' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(row);
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`F1 Dashboard Backend Server running at http://localhost:${PORT}`);
  console.log(`Static assets served from: ${path.join(__dirname, '../public')}`);
});
