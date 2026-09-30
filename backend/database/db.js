const path = require("path");
const os = require("os");
const Database = require("better-sqlite3");

const dbPath = process.env.VERCEL
  ? path.join(os.tmpdir(), "rescuewave.db")
  : "rescuewave.db";

const db = new Database(dbPath);

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