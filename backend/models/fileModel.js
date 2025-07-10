function insertFile(filename, s3key, userid) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO files(filename, s3key, userid) VALUES (?,?,?)`,
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
      else resolve(row);
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

function deleteFileById(id) {
  return new Promise((resolve, reject) => {
    db.delete("DELETE FROM files WHERE id = ?", [id], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
}

export { insertFile, getFiles, getFileById, deleteFileById };
