const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// The SQLite file lives in server/data/ (gitignored). Keeping it outside src/
// matters because `node --watch-path=src` would otherwise restart the server
// on every database write.
const DATA_DIR = path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'parking.sqlite'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS garages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    location_label TEXT
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    garage_id INTEGER NOT NULL REFERENCES garages(id),
    event_type TEXT NOT NULL CHECK (event_type IN ('entry', 'exit')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  CREATE INDEX IF NOT EXISTS idx_events_garage_id ON events(garage_id);

  CREATE TABLE IF NOT EXISTS occupancy_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    garage_id INTEGER NOT NULL REFERENCES garages(id),
    occupancy INTEGER NOT NULL,
    recorded_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_snapshots_garage_id ON occupancy_snapshots(garage_id);
  CREATE INDEX IF NOT EXISTS idx_snapshots_recorded_at ON occupancy_snapshots(recorded_at);
`);

module.exports = db;
