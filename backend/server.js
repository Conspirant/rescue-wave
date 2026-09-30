const express = require("express");
const cors = require("cors");

const roverData = require("./data/roverData");
const alertsData = require("./data/alerts");
const historyData = require("./data/history");
const location = require("./data/location");
const camera = require("./data/camera");

const db = require("./database/db");

const app = express();

app.use(cors());
app.use(express.json());

// ========================================
// INITIAL ROVER DATA
// ========================================

const existingRover = db
  .prepare("SELECT id FROM rover_status WHERE id = 1")
  .get();

if (!existingRover) {
  db.prepare(`
    INSERT INTO rover_status (
      id,
      disaster_type,
      location,
      rover_status,
      battery,
      human_detected,
      detection_range,
      motion,
      camera_status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    1,
    roverData.disasterType,
    roverData.location,
    roverData.roverStatus,
    roverData.battery,
    roverData.humanDetected ? 1 : 0,
    roverData.detectionRange,
    roverData.motion,
    roverData.cameraStatus
  );
}

// ========================================
// INITIAL ALERT DATA
// ========================================

const existingAlerts = db
  .prepare("SELECT COUNT(*) AS count FROM alerts")
  .get();

if (existingAlerts.count === 0) {
  const insertAlert = db.prepare(`
    INSERT INTO alerts (
      type,
      severity,
      message,
      timestamp
    )
    VALUES (?, ?, ?, ?)
  `);

  const insertManyAlerts = db.transaction((alerts) => {
    for (const alert of alerts) {
      insertAlert.run(
        alert.type,
        alert.severity,
        alert.message,
        alert.timestamp
      );
    }
  });

  insertManyAlerts(alertsData);
}

// ========================================
// INITIAL HISTORY DATA
// ========================================

const existingHistory = db
  .prepare("SELECT COUNT(*) AS count FROM history")
  .get();

if (existingHistory.count === 0) {
  const insertHistory = db.prepare(`
    INSERT INTO history (
      time,
      human_detected,
      detection_range,
      motion
    )
    VALUES (?, ?, ?, ?)
  `);

  const insertManyHistory = db.transaction((history) => {
    for (const entry of history) {
      insertHistory.run(
        entry.time,
        entry.humanDetected ? 1 : 0,
        entry.detectionRange,
        entry.motion
      );
    }
  });

  insertManyHistory(historyData);
}

// ========================================
// HOME
// ========================================

app.get("/", (req, res) => {
  res.json({
    message: "RescueWave backend is running!"
  });
});

// ========================================
// ROVER STATUS
// ========================================

app.get("/api/rover/status", (req, res) => {
  const data = db
    .prepare("SELECT * FROM rover_status WHERE id = 1")
    .get();

  res.json({
    disasterType: data.disaster_type,
    location: data.location,
    roverStatus: data.rover_status,
    battery: data.battery,
    humanDetected: Boolean(data.human_detected),
    detectionRange: data.detection_range,
    motion: data.motion,
    cameraStatus: data.camera_status
  });
});

// ========================================
// UPDATE ROVER
// ========================================

app.post("/api/rover/update", (req, res) => {
  const newData = req.body;

  const currentData = db
    .prepare("SELECT * FROM rover_status WHERE id = 1")
    .get();

  const updatedData = {
    disasterType:
      newData.disasterType ?? currentData.disaster_type,

    location:
      newData.location ?? currentData.location,

    roverStatus:
      newData.roverStatus ?? currentData.rover_status,

    battery:
      newData.battery ?? currentData.battery,

    humanDetected:
      newData.humanDetected ??
      Boolean(currentData.human_detected),

    detectionRange:
      newData.detectionRange ??
      currentData.detection_range,

    motion:
      newData.motion ?? currentData.motion,

    cameraStatus:
      newData.cameraStatus ?? currentData.camera_status
  };

  db.prepare(`
    UPDATE rover_status
    SET
      disaster_type = ?,
      location = ?,
      rover_status = ?,
      battery = ?,
      human_detected = ?,
      detection_range = ?,
      motion = ?,
      camera_status = ?
    WHERE id = 1
  `).run(
    updatedData.disasterType,
    updatedData.location,
    updatedData.roverStatus,
    updatedData.battery,
    updatedData.humanDetected ? 1 : 0,
    updatedData.detectionRange,
    updatedData.motion,
    updatedData.cameraStatus
  );

  res.json({
    message: "Rover data updated successfully",
    data: updatedData
  });
});

// ========================================
// ALERTS
// ========================================

app.get("/api/alerts", (req, res) => {
  const alerts = db
    .prepare(`
      SELECT
        id,
        type,
        severity,
        message,
        timestamp
      FROM alerts
      ORDER BY id DESC
    `)
    .all();

  res.json(alerts);
});

app.post("/api/alerts", (req, res) => {
  const newAlert = {
    type: req.body.type,
    severity: req.body.severity,
    message: req.body.message,
    timestamp: new Date().toISOString()
  };

  const result = db
    .prepare(`
      INSERT INTO alerts (
        type,
        severity,
        message,
        timestamp
      )
      VALUES (?, ?, ?, ?)
    `)
    .run(
      newAlert.type,
      newAlert.severity,
      newAlert.message,
      newAlert.timestamp
    );

  res.json({
    message: "Alert added successfully",
    alert: {
      id: result.lastInsertRowid,
      ...newAlert
    }
  });
});

// ========================================
// HISTORY
// ========================================

app.get("/api/rover/history", (req, res) => {
  const history = db
    .prepare(`
      SELECT
        id,
        time,
        human_detected,
        detection_range,
        motion
      FROM history
      ORDER BY id ASC
    `)
    .all();

  const formattedHistory = history.map((item) => ({
    id: item.id,
    time: item.time,
    humanDetected: Boolean(item.human_detected),
    detectionRange: item.detection_range,
    motion: item.motion
  }));

  res.json(formattedHistory);
});

app.post("/api/rover/history", (req, res) => {
  const newEntry = {
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    }),
    humanDetected: req.body.humanDetected ?? false,
    detectionRange: req.body.detectionRange ?? 0,
    motion: req.body.motion ?? "LOW"
  };

  const result = db
    .prepare(`
      INSERT INTO history (
        time,
        human_detected,
        detection_range,
        motion
      )
      VALUES (?, ?, ?, ?)
    `)
    .run(
      newEntry.time,
      newEntry.humanDetected ? 1 : 0,
      newEntry.detectionRange,
      newEntry.motion
    );

  res.json({
    message: "History entry added successfully",
    entry: {
      id: result.lastInsertRowid,
      ...newEntry
    }
  });
});

// ========================================
// LOCATION
// ========================================

app.get("/api/rover/location", (req, res) => {
  res.json(location);
});

// ========================================
// CAMERA
// ========================================

app.get("/api/rover/camera", (req, res) => {
  res.json(camera);
});

// ========================================
// DATABASE TEST
// ========================================

app.get("/api/database/test", (req, res) => {
  const result = db
    .prepare("SELECT 1 AS connected")
    .get();

  res.json({
    message: "SQLite database connected successfully",
    result: result
  });
});

// ========================================
// START SERVER
// ========================================

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `RescueWave backend running on http://localhost:${PORT}`
  );
});