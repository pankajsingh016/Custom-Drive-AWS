import db from "../config/db.js";

// creating user and inserting it into the db
function createUser(email, hashedPassword) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (email, password) VALUES (?,?)`,
      [email, hashedPassword],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastId);
        }
      }
    );
  });
}

// Selecting user by email id will return a single user
function findByEmail(email) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE email = ? `, [email], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export { createUser, findByEmail };
