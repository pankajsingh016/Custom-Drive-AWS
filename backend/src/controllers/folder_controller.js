// src/controllers/folder_controller.js
const folderService = require('../services/folder_services');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Handles the creation of a new folder.
 * Expects { name, parentId } in req.body.
 */
exports.createFolder = async (req, res) => {
  const { name, parentId } = req.body; // parentId can be null for root folders
  const userId = req.user.id; // From auth middleware

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return errorResponse(res, "Folder name is required and must be a non-empty string.", 400);
  }

  try {
    const newFolder = await folderService.createFolder(name.trim(), userId, parentId);
    successResponse(res, newFolder, "Folder created successfully");
  } catch (err) {
    console.error("Error in createFolder controller:", err);
    errorResponse(res, err.message || "Failed to create folder.");
  }
};

/**
 * Handles fetching the contents (files and sub-folders) of a specific folder.
 * Expects folderId as a query parameter, e.g., /api/folders/contents?folderId=xyz
 * For root, folderId will be null/undefined.
 */
exports.getFolderContents = async (req, res) => {
  const { folderId } = req.query; // Get folderId from query parameters
  const userId = req.user.id; // From auth middleware

  try {
    // If folderId is 'null' string, convert to actual null for Prisma query
    const effectiveFolderId = folderId === 'null' ? null : folderId;

    const contents = await folderService.getFolderContents(effectiveFolderId, userId);
    successResponse(res, contents, "Folder contents fetched successfully.");
  } catch (err) {
    console.error("Error in getFolderContents controller:", err);
    errorResponse(res, err.message || "Failed to fetch folder contents.");
  }
};