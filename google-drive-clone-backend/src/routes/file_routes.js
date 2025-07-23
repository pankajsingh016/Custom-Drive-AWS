const express = require('express');
const router = express.Router();
const fileController = require('../controllers/file_controller');
const upload = require('../middlewares/upload');
const { verifyToken } = require('../middlewares/auth');

router.post('/upload', verifyToken, upload.single('file'), fileController.uploadFile);
router.get('/', verifyToken, fileController.getAllFiles);
router.get('/presigned/:id', verifyToken, fileController.getFilePresignedUrl);

module.exports = router;
