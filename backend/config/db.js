import sqlite3 from "sqlite3";

import path from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "data", "db.sqlite");

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT)`);

  db.run(`CREATE TABLE IF NOT EXISTS files (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   filename TEXT,
   s3_key TEXT,
   user_id INTEGER,
   uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
   FOREIGN KEY (user_id) REFERENCES users(id))`);
});

export default { db };
