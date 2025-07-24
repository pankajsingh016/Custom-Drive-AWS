// === file_services.js ===
const prisma = require('../config/db');
const { GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { deleteFromS3, uploadFileToS3 } = require('../utils/s3_utils');
const s3 = require('../config/aws');

//upload a single file
exports.saveFile = async (file, userId, folderId = null) => {
  try {
    if (!file || !file.buffer || !file.originalname || !file.mimetype) {
      throw new Error("Invalid file object");
    }

    const s3Key = `${userId}/${Date.now()}-${file.originalname}`;

    return await prisma.file.create({
      data: {
        filename: file.originalname,
        key: s3Key,
        url: fileUrl,
        type: 'file',
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
exports.uploadFolderFiles = async (userId, uploadedFiles, parentFolderId = null) => {
  const uploadResults = [];

  // Helper: create nested folders
  const folderMap = {}; // path -> folder ID

  for (const file of uploadedFiles) {
    const fullPath = file.originalname; // e.g., 'FolderA/SubA/file.txt'
    const pathParts = fullPath.split('/');
    const fileName = pathParts.pop();

    let currentParentId = parentFolderId;
    let currentPath = '';

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
        type: 'file',
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

// Get presigned URL for a file
exports.getFileById = async (fileId, userId) => {
  const file = await prisma.file.findFirst({ where: { id: fileId, userId } });
  if (!file) throw new Error('File not found');
  if (file.type === 'folder') return file;

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: file.key,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 300 });
  return { ...file, presignedUrl: url };
};

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
      await deleteFile(folder.id, userId, 'folder');
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