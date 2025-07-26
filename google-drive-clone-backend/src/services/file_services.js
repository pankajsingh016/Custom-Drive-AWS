// === file_services.js ===
const prisma = require("../config/db");
const { GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { deleteFromS3, uploadFileToS3 } = require("../utils/s3_utils");
const s3 = require("../config/aws");
const s3Utils = require('../utils/s3_utils');

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

// Upload folder with nested structure
exports.uploadFolderFiles = async (
  userId,
  uploadedFiles,
  parentFolderId = null
) => {
  const uploadResults = [];

  // Helper: create nested folders
  const folderMap = {}; // path -> folder ID

  for (const file of uploadedFiles) {
    const fullPath = file.originalname; // e.g., 'FolderA/SubA/file.txt'
    const pathParts = fullPath.split("/");
    const fileName = pathParts.pop();

    let currentParentId = parentFolderId;
    let currentPath = "";

    for (const part of pathParts) {
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!folderMap[currentPath]) {
        let existing = await prisma.folder.findFirst({
          where: { userId, name: part, parent: { id: currentParentId } },
        });

        if (!existing) {
          existing = await prisma.folder.create({
            data: { name: part, userId, parentId: currentParentId },
          });
        }

        folderMap[currentPath] = existing.id;
        currentParentId = existing.id;
      } else {
        currentParentId = folderMap[currentPath];
      }
    }

    // Upload the file
    const s3Key = `${userId}/${fullPath}`;
    const s3Response = await uploadFileToS3(file.buffer, s3Key, file.mimetype);

    const dbEntry = await prisma.file.create({
      data: {
        filename: fileName,
        key: s3Key,
        url: s3Response.Location,
        uploadedAt: new Date(),
        userId,
        folderId: currentParentId,
        type: "file",
      },
    });

    uploadResults.push(dbEntry);
  }

  return uploadResults;
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

exports.deleteFile = async (itemId, userId, type) => {
    // Wrap the entire operation in a Prisma transaction
    return prisma.$transaction(async (tx) => {
        if (type === "folder") {
            const folder = await tx.folder.findUnique({ where: { id: itemId } });
            if (!folder) {
                throw new Error("Folder not found");
            }
            if (folder.userId !== userId) {
                throw new Error("Unauthorized: Cannot delete folder belonging to another user");
            }

            // Recursively delete subfolders
            const subFolders = await tx.folder.findMany({
                where: { userId, parentId: itemId },
            });
            for (const subFolder of subFolders) {
                // IMPORTANT: Pass 'tx' to the recursive call if you want it to be part of the same transaction
                // This means you might need to modify deleteItem to accept an optional 'tx' parameter
                // For simplicity here, we'll assume deleteItem always starts a new transaction if tx is not passed,
                // or if it's designed to be called outside a transaction context.
                // A better approach for deep recursion within one transaction: have an internal helper.
                 await exports.deleteItem(subFolder.id, userId, "folder"); // Calling the exported function
            }

            // Delete files inside the folder
            const nestedFiles = await tx.file.findMany({
                where: { userId, folderId: itemId },
            });
            for (const nestedFile of nestedFiles) {
                await safeDeleteFromS3(nestedFile.key); // Delete from S3 first
                await tx.file.delete({ where: { id: nestedFile.id } }); // Then delete Prisma record
            }

            // Finally, delete the folder itself
            await tx.folder.delete({ where: { id: itemId } });

        } else if (type === "file") {
            const file = await tx.file.findUnique({ where: { id: itemId } });
            if (!file) {
                throw new Error("File not found");
            }
            if (file.userId !== userId) {
                throw new Error("Unauthorized: Cannot delete file belonging to another user");
            }

            await safeDeleteFromS3(file.key); // Delete from S3 first
            await tx.file.delete({ where: { id: itemId } }); // Then delete Prisma record

        } else {
            throw new Error("Invalid item type specified for deletion.");
        }

        return { message: "Item deleted successfully." };
    }); // End of prisma.$transaction
};


/*

// Delete file or folder
exports.deleteFile = async (fileId, userId, type) => {
  const file = await prisma.file.findUnique({ where: { id: fileId } });
  if (!file) throw new Error("File not found");
  if (file.userId !== userId) throw new Error("Unauthorized");

  if (type === "folder") {
    // Delete all subfolders
    const subFolders = await prisma.folder.findMany({
      where: { userId, parentId: fileId },
    });

    for (const folder of subFolders) {
      await deleteFile(folder.id, userId, "folder");
    }

    // Delete files inside the folder
    const nestedFiles = await prisma.file.findMany({
      where: { userId, folderId: fileId },
    });

    for (const nestedFile of nestedFiles) {
      if (nestedFile.key) {
        await deleteFromS3(nestedFile.key);
      }
      await prisma.file.delete({ where: { id: nestedFile.id } });
    }

    await prisma.folder.delete({ where: { id: fileId } });
  } else {
    if (file.key) await deleteFromS3(file.key);
    await prisma.file.delete({ where: { id: fileId } });
  }

  return { message: "File or folder deleted successfully." };
};
*/


// presigned URL logic for file services

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