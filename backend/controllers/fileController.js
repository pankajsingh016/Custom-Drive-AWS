const s3 = require("../config/aws");
const File = require("../models/fileModel");

//-------------------------------------------------------------
async function uploadFile(req, res) {
  const file = req.file;
  const s3Key = `${Date.now()}_${file.originalname}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: s3Key,
    Body: file.buffer,
  };

  try {
    const data = await s3.upload(params).promise();
    const id = await File.insertFile(file.originalname, s3Key, req.user.id);
    res.json({
      id,
      filename: file.originalname,
      s3_key: s3Key,
      url: data.Location,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
///---------------------------------------------------------------
async function listFiles(req, res) {
  try {
    const files = await File.getfiles(req.user.id);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
//-------------------------------------------------------------------
async function deleteFile(req, res) {
  const id = req.params.id;
  try {
    const file = await File.getFileById(id, req.user.id);
    if (!file) return res.status(404).json({ error: "File not found" });
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      key: file.s3_key,
    };
    await s3.deleteObject(params).promise();
    await File.deleteFile(id);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {uploadFile, listFiles, deleteFile}
