// src/config/multer.js
const multer = require('multer');
const multerS3 = require('multer-s3'); // Keep this for single file uploads if you use it separately
const s3 = require('../config/aws');
require('dotenv').config();

// --- Multer storage for single file uploads (using multer-s3) ---
// This is for your existing `uploadFile` endpoint
const s3Storage = multerS3({
  s3,
  bucket: process.env.AWS_BUCKET_NAME,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const userId = req.user.id;
    // If a folderId is passed in the request body (for files uploaded into a specific folder)
    const folderId = req.body.folderId || 'root'; // Default to 'root' if no folderId
    cb(null, `uploads/${userId}/${folderId}/${Date.now()}-${file.originalname}`);
  },
});
exports.uploadSingleFile = multer({ storage: s3Storage });

// --- Multer storage for folder uploads (using memoryStorage for processing) ---
// This is for your new `uploadFolderContents` endpoint
const memoryStorage = multer.memoryStorage(); // Stores file in memory as a Buffer

exports.uploadFolderContents = multer({ storage: memoryStorage });