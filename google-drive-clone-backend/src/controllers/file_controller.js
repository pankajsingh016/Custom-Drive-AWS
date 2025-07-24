// === file_controller.js ===
const fileService = require("../services/file_services");
const { successResponse, errorResponse } = require("../utils/response");

exports.uploadFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const folderId = req.body.folderId || null;
    const fileMeta = await fileService.saveFile(req.file, userId, folderId);
    successResponse(res, fileMeta, "File uploaded");
  } catch (err) {
    console.log('something went wrong.');
    console.error(err);
    errorResponse(res, err.message);
  }
};

exports.uploadFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const uploadedFiles = req.files;
    const folderId = req.body.folderId || null;

    const uploadResults = await fileService.uploadFolderFiles(
      userId,
      uploadedFiles,
      folderId
    );

    res.status(200).json({ message: "Folder uploaded", files: uploadResults });
  } catch (err) {
    errorResponse(res, err.message);
  }
};

exports.getAllFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const folderId = req.query.folderId || null;

    const { files, folders } = await fileService.getAllFilesAndFolders(
      userId,
      folderId
    );

    res.status(200).json({ data: { files, folders } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve files and folders' });
  }
};

exports.getFilePresignedUrl = async (req, res) => {
  try {
    const fileWithUrl = await fileService.getFileById(
      req.params.id,
      req.user.id
    );
    successResponse(res, fileWithUrl, "Presigned URL generated");
  } catch (err) {
    errorResponse(res, err.message);
  }
};

exports.deleteFile = async (req, res) => {
  const { id, type } = req.params;
  const userId = req.user.id;

  try {
    const result = await fileService.deleteFile(id, userId, type);
    successResponse(res, result, "File/folder deleted successfully");
  } catch (err) {
    errorResponse(res, err.message || "Something went wrong");
  }
};
