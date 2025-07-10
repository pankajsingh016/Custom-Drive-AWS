const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer');
const controller = require('../controllers/fileController');
const {verifyToken} = require('../middlewares/auth');


router.post('/upload',verifyToken, upload.single('file'),controller.uploadFile);
router.get('/files',verifyToken, controller.listFiles);
router.delete('/files/:id',verifyToken, controller.deleteFile);

module.exports = router;