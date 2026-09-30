const Database = require("better-sqlite3");

const db = new Database("rescuewave.db");

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS rover_status (
    id INTEGER PRIMARY KEY,
    disaster_type TEXT,
    location TEXT,
    rover_status TEXT,
    battery INTEGER,
    human_detected INTEGER,
    detection_range REAL,
    motion TEXT,
    camera_status TEXT
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    severity TEXT,
    message TEXT,
    timestamp TEXT
  );

  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    time TEXT,
    human_detected INTEGER,
    detection_range REAL,
    motion TEXT
  );
`);

module.exports = db;