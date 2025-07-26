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

exports.deleteFile = async (req,res)=>{
      try{
        const userId = req.user.id;
        const fileId = req.params.id;
        const fileType = req.params.type;

        const deletestatus = await fileService.deleteFile(fileId, userId, fileType);

        successResponse(res,deletestatus, "File Deleted Successfully");


      } catch(err)
      {
        console.error(err.message);
        res.status(500).json({message:'Failed to Delete file and folder'});
      }
}

exports.downloadFile = async(req,res)=>{
    const {fileId} = req.params;
    const userId = req.user.id;

    try{

      const downloadMeta = await fileService.download(fileId, userId);

      successResponse(res, downloadMeta, "Presigned URL SEND");

    } catch(err){
      console.error(err.message);
      errorResponse(res,err.message);
    }
}


exports.viewFile = async(req,res)=>{
  const {fileId} = req.params;
  const userId = req.user.id;

  try{
    const viewMeta = await fileService.view(fileId, userId);
    successResponse(res, viewMeta, "Presigned URL for view sent");
  } catch(err){
    console.error(`Error in viewFile controller: ${err.message}`);
    errorResponse(res,err.message);
  }
}


/**
 * Handles fetching the contents (files and sub-folders) of a specific folder.
 * This will replace the logic you might have had in the default GET /api/files.
 * Expects folderId as a query parameter, e.g., /api/files?folderId=xyz
 * For root, folderId will be null/undefined in req.query.
 */
exports.getContents = async (req, res) => {
  const { folderId } = req.query; // Get folderId from query parameters
  const userId = req.user.id; // From auth middleware

  try {
    // If folderId is 'null' string (from frontend JS), convert to actual null for Prisma query
    const effectiveFolderId = folderId === 'null' ? null : folderId;

    // Use the getFolderContents service function (defined in folder_services.js)
    const contents = await folderService.getFolderContents(effectiveFolderId, userId);
    successResponse(res, contents, "Folder contents fetched successfully.");
  } catch (err) {
    console.error("Error in getContents (file_controller):", err);
    errorResponse(res, err.message || "Failed to fetch content.");
  }
};