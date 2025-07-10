function insertFile(filename, s3key, userid) {
  return new Promise((resolve, reject) => {
    db.run(
      `
           INSERT INTO files(filename, s3key, userid) VALUES (?,?,?)`,
      [filename, s3key, userid],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastId);
      }
    );
  });
}

function getFiles(userId) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM files WHERE user_id = ?`, [userId], (err, row) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function getFileById(id, userId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM files WHERE id = ? AND user_id = ? `,
      [id, userId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
}

module.exports = { insertFile, getFiles, getFileById };
