const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./data/db.sqlite");

db.seralize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUIE,
    password TEXT)`);

  db.run(`CREATE TABLE IF NOT EXISTS filies (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   filename TEXT,
   s3_key TEXT,
   user_id INTEGER,
   uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP 
   FOREGIN KEY (user_id) REFERENCES users(id))`);
});

module.exports = db;
