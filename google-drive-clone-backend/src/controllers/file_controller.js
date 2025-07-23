const fileService = require('../services/file_services');
const { successResponse, errorResponse } = require('../utils/response');

exports.uploadFile = async (req, res) => {
  try {
    const fileMeta = await fileService.saveFile(req.file, req.user.id);
    successResponse(res, fileMeta, 'File uploaded');
  } catch (err) {
    errorResponse(res, err.message);
  }
};

exports.getAllFiles = async (req, res) => {
  try {
    const files = await fileService.getFiles(req.user.id);
    successResponse(res, files, 'Files retrieved');
  } catch (err) {
    errorResponse(res, err.message);
  }
};

exports.getFilePresignedUrl = async (req, res) => {
  try {
    const fileWithUrl = await fileService.getFileById(req.params.id, req.user.id);
    successResponse(res, fileWithUrl, 'Presigned URL generated');
  } catch (err) {
    errorResponse(res, err.message);
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const result = await fileService.deleteFile(req.params.id, req.user.id);
    successResponse(res, result, 'File deleted successfully');
  } catch (err) {
    errorResponse(res, err.message);
  }
};
