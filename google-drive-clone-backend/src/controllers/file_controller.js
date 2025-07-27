// === file_controller.js ===
const fileService = require("../services/file_services");

const folderService = require("../services/folder_services");
const { uploadSingleFile, uploadFolderContents } = require('../middlewares/upload');

const { successResponse, errorResponse } = require("../utils/response");

exports.uploadFile = async (req, res) => {
  // Multer middleware will be applied in the route definition
  try {
    const userId = req.user.id;
    const folderId = req.body.folderId || null; // folderId comes from form data

    if (!req.file) {
      return errorResponse(res, "No file provided for upload.", 400);
    }

    // fileService.saveFile will now use req.file.key provided by multer-s3
    const fileMeta = await fileService.saveFile(req.file, userId, folderId);
    successResponse(res, fileMeta, "File uploaded successfully.");
  } catch (err) {
    console.error("Error in uploadFile controller:", err);
    errorResponse(res, err.message || "Failed to upload file.");
  }
};


exports.uploadFolderContents = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentParentFolderId = req.body.currentFolderId || null;

    if (!req.files || req.files.length === 0) {
      return errorResponse(res, "No files provided for folder upload.", 400);
    }

    // --- NEW LOGIC: Map req.files to include webkitRelativePath from req.body ---
    const filesToProcess = req.files.map((file, index) => {
        const relativePathKey = `relativePath_${index}`; // Matches frontend key
        const webkitRelativePath = req.body[relativePathKey]; // Retrieve from req.body

        if (!webkitRelativePath) {
            // This should ideally not happen if frontend is correct
            console.warn(`Warning: ${relativePathKey} missing for file ${file.originalname}.`);
            // Fallback: If for some reason the path is missing, use original name as a last resort
            // or handle as an error, depending on desired robustness.
            // For now, let's make sure it's not undefined for the split operation.
        }

        return {
            ...file, // Keep existing Multer file properties
            webkitRelativePath: webkitRelativePath || file.originalname // Add the correct path here
        };
    });
    // --- END NEW LOGIC ---

    console.log(`Received ${filesToProcess.length} files for folder upload.`);
    // Add improved logging to confirm webkitRelativePath is now present
    filesToProcess.forEach((file, index) => {
        console.log(`Multer File ${index}: Name=${file.originalname}, webkitRelativePath=${file.webkitRelativePath}`);
    });


    const processedFiles = await fileService.processFolderUpload(
      filesToProcess, // Pass the modified array to the service
      userId,
      currentParentFolderId
    );

    successResponse(res, processedFiles, "Folder contents uploaded successfully!");
  } catch (err) {
    console.error("Error in uploadFolderContents controller:", err);
    errorResponse(res, err.message || "Failed to upload folder contents.");
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

exports.deleteFileFolder = async (req,res)=>{

      try{
        const userId = req.user.id;
        const fileId = req.params.itemId;
        const fileType = req.params.itemType;

        console.log(userId, fileId, fileType);

        const deletestatus = await fileService.deleteItem(fileId, userId, fileType);

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