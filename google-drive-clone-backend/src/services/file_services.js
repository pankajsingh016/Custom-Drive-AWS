// === file_services.js ===
const prisma = require("../config/db");
const { GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { deleteFromS3, uploadFileToS3 } = require("../utils/s3_utils");
const s3 = require("../config/aws");
const s3Utils = require('../utils/s3_utils');
const folderService = require('./folder_services');



//upload a single file
exports.saveFile = async (file, userId, folderId = null) => {
  try {
    // if (!file || !file.buffer || !file.originalname || !file.mimetype) {
    //   throw new Error("Invalid file object");
    // }

    const s3Key = file.key;

    console.log("file object", file);

    return await prisma.file.create({
      data: {
        filename: file.originalname,
        key: s3Key,
        type: "file",
        mimetype:file.mimetype,
        userId,
        uploadedAt: new Date(),
        folderId,
      },
    });
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error("File upload failed");
  }
};

// Fetch files and folders from a specific folder
exports.getAllFilesAndFolders = async (userId, folderId = null) => {
  const files = await prisma.file.findMany({
    where: { userId, folderId },
  });

  const folders = await prisma.folder.findMany({
    where: { userId, parentId: folderId },
  });

  return { files, folders };
};


// Helper function to handle S3 deletion safely
const safeDeleteFromS3 = async (key) => {
    if (key) {
        try {
            await deleteFromS3(key);
            console.log(`Successfully deleted S3 object: ${key}`);
        } catch (s3Error) {
            console.error(`Error deleting S3 object ${key}:`, s3Error);
            // Decide how to handle: re-throw to trigger transaction rollback, log, etc.
            // For now, we'll re-throw to make the transaction fail if S3 fails.
            throw s3Error;
        }
    }
};

async function deleteItemRecursiveInternal(itemId, userId, type, tx) {
    if (type === "folder") {
        const folder = await tx.folder.findUnique({ where: { id: itemId } });
        if (!folder) {
            throw new Error("Folder not found");
        }
        if (folder.userId !== userId) {
            throw new Error("Unauthorized: Cannot delete folder belonging to another user");
        }

        const subFolders = await tx.folder.findMany({
            where: { userId, parentId: itemId },
        });
        for (const subFolder of subFolders) {
            // Recursive call to the internal helper, passing the transaction 'tx'
            await deleteItemRecursiveInternal(subFolder.id, userId, "folder", tx);
        }

        const nestedFiles = await tx.file.findMany({
            where: { userId, folderId: itemId },
        });
        for (const nestedFile of nestedFiles) {
            await safeDeleteFromS3(nestedFile.key);
            await tx.file.delete({ where: { id: nestedFile.id } });
        }

        await tx.folder.delete({ where: { id: itemId } });

    } else if (type === "file") {
        const file = await tx.file.findUnique({ where: { id: itemId } });
        if (!file) {
            throw new Error("File not found");
        }
        if (file.userId !== userId) {
            throw new Error("Unauthorized: Cannot delete file belonging to another user");
        }

        await safeDeleteFromS3(file.key);
        await tx.file.delete({ where: { id: itemId } });

    } else {
        throw new Error("Invalid item type specified for deletion.");
    }
}

// Exported function, responsible for starting the transaction and calling the internal helper
exports.deleteItem = async (itemId, userId, type) => { // Renamed from deleteFile if this is the public API
    return prisma.$transaction(async (tx) => {
        await deleteItemRecursiveInternal(itemId, userId, type, tx); // Call the internal helper with 'tx'
        return { message: "Item deleted successfully." };
    });
};

exports.download = async(fileId, userId, )=>{

  try{
    console.log('Reached file_service.js');
    const file = await prisma.file.findUnique({
      where:{id:fileId, userId:userId}
    });

    console.log('find the file',file);

    if(!file){
       throw new Error("File not found");
    }
    if(!file.key){
      throw new Error("File has no s3 Key associated");
    }

    const presignedUrl = await s3Utils.getPresignedUrl(file.key, 'attachment');

    return { url: presignedUrl};


  } catch(error)
  {
    console.log(error);
    throw new Error("Download fail");
  }
}


exports.view = async(fileId, userId) =>{
  try{
    const file = await prisma.file.findUnique({
      where:{id:fileId, userId:userId }
    })

    if(!file){
      throw new Error("File not found or access denied");
    }

    if(!file.key){
      throw new Error("File has no s3 key associated");
    }

    const forceDownloadMimeTypes = [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/java-archive', // .jar files
      'application/vnd.microsoft.installer', // .msi files
      'application/x-msdownload', // .exe files
      'application/octet-stream' // Generic binary files
    ];
    let presignedUrl = null;
    if (file.mimetype && forceDownloadMimeTypes.includes(file.mimetype)) {
        presignedUrl = await s3Utils.getPresignedUrl(file.key, 'attachment', file.mimetype);
        console.log(`Force downloading ${file.filename} due to mimetype: ${file.mimetype}`);
    } else {
        console.log(`Attempting to view ${file.filename} (MIME: ${file.mimetype}) inline.`);
        presignedUrl = await s3Utils.getPresignedUrl(file.key, 'inline',file.mimetype);
    }


    return {url:presignedUrl, filename:file.filename};

  } catch(error){
    console.log(error);
    throw new Error("View file failed")
  }
}


// folder things
exports.processFolderUpload = async (files, userId, currentParentFolderId = null) => {
  const processedFiles = [];

  for (const file of files) {
    const { originalname, mimetype, buffer, webkitRelativePath } = file;

    // webkitRelativePath will be like 'myFolder/subFolder/file.txt'
    const pathParts = webkitRelativePath.split('/');
    const fileName = pathParts.pop(); // The actual file name
    const folderPath = pathParts.join('/'); // 'myFolder/subFolder' or '' if file is in root of uploaded folder

    let parentFolderIdForFile = currentParentFolderId; // Start with the folder where upload was initiated

    // Process folder path parts to create nested folders in DB
    if (folderPath) {
      const folderNames = folderPath.split('/');
      let currentDbParentId = currentParentFolderId;

      for (const folderName of folderNames) {
        // Check if this folder already exists under the currentDbParentId for this user
        let existingFolder = await prisma.folder.findFirst({
          where: {
            name: folderName,
            userId: userId,
            parentId: currentDbParentId,
          },
        });

        if (!existingFolder) {
          // If not, create it
          existingFolder = await folderService.createFolder(folderName, userId, currentDbParentId);
          console.log(`Created new sub-folder in DB: ${existingFolder.name} (ID: ${existingFolder.id})`);
        }
        currentDbParentId = existingFolder.id; // Set the newly created/found folder as the parent for the next iteration
      }
      parentFolderIdForFile = currentDbParentId; // The final parent for the current file
    }

    // Construct S3 Key: uploads/userId/folderId_of_actual_parent_in_DB/filename.ext
    // Or: uploads/userId/folderId_of_actual_parent_in_DB/subfolder1/subfolder2/filename.ext
    // We use the DB folder ID to ensure a unique and consistent path in S3
    const s3Key = `uploads/${userId}/${parentFolderIdForFile || 'root'}/${fileName}`; // 'root' for clarity if no parent

    try {
      // Upload the file to S3
      const s3FileUrl = await s3Utils.uploadFileToS3(buffer, s3Key, mimetype);
      console.log(`Uploaded file to S3: ${s3FileUrl}`);

      // Save file metadata to database
      const savedFile = await prisma.file.create({
        data: {
          filename: fileName,
          key: s3Key,
          type: "file",
          mimetype: mimetype,
          userId: userId,
          uploadedAt: new Date(),
          folderId: parentFolderIdForFile, // Link to the correct parent folder in DB
        },
      });
      processedFiles.push(savedFile);
    } catch (uploadError) {
      console.error(`Failed to upload or save metadata for file ${originalname} (path: ${webkitRelativePath}):`, uploadError);
      // Decide if you want to rethrow or just log and continue for other files
      // For a folder upload, it's often better to log and continue, then report overall success/failure.
    }
  }
  return processedFiles;
};