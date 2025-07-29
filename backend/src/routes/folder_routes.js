// src/routes/folder_routes.js
const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folder_controller');
const { verifyToken } = require('../middlewares/auth');
const { verify } = require('jsonwebtoken');

// Route to create a new folder
router.post('/create', verifyToken, folderController.createFolder);

// NEW Route to get folder contents (files and sub-folders)
router.get('/contents', verifyToken, folderController.getFolderContents);

module.exports = router;