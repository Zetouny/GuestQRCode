const Database = require("better-sqlite3");

const db = new Database("visitors.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS visitors (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid       TEXT NOT NULL UNIQUE,
    qr_data    TEXT NOT NULL,
    visited_at TEXT DEFAULT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

module.exports = {
  insertVisitor(uuid, qrData) {
    return db
      .prepare("INSERT OR IGNORE INTO visitors (uuid, qr_data) VALUES (?, ?)")
      .run(uuid, qrData);
  },

  getVisitor(uuid) {
    return db.prepare("SELECT * FROM visitors WHERE uuid = ?").get(uuid);
  },

  getAllVisitors() {
    return db
      .prepare(
        "SELECT id, uuid, visited_at, created_at FROM visitors ORDER BY id DESC",
      )
      .all();
  },

  getVisitedCount() {
    return db
      .prepare(
        "SELECT COUNT(*) AS count FROM visitors WHERE visited_at IS NOT NULL",
      )
      .get().count;
  },

  markVisited(uuid) {
    return db
      .prepare(
        "UPDATE visitors SET visited_at = datetime('now') WHERE uuid = ?",
      )
      .run(uuid);
  },
};
