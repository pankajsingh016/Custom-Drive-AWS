const express = require('express');
const router = express.Router();
const fileController = require('../controllers/file_controller');
const { verifyToken } = require('../middlewares/auth');
const { uploadSingleFile, uploadFolderContents } = require('../middlewares/upload'); // <-- Import multer configs


// Upload a single file to a specific folder (or root if none)
router.post('/file', verifyToken, uploadSingleFile.single('file'), fileController.uploadFile);

// Upload multiple files with folder structure (e.g., for folder uploads)
router.post('/folder', verifyToken, uploadFolderContents.array('files'), fileController.uploadFolderContents);

// Get all files & folders for the logged-in user, optionally within a folder
router.get('/', verifyToken, fileController.getAllFiles);

// Generate a pre-signed URL for a file (download or view)
router.get('/download/:fileId', verifyToken, fileController.downloadFile);

// Delete a file or folder by ID (recursive for folders)
router.delete('/:itemType/:itemId', verifyToken, fileController.deleteFileFolder);

router.get('/view/:fileId',verifyToken, fileController.viewFile);

module.exports = router;