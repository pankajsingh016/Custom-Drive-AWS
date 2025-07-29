// src/services/folder_services.js
const prisma = require('../config/db');
const s3Utils = require('../utils/s3_utils'); // We might use this later for S3 folder markers

/**
 * Creates a new folder in the database.
 * Optionally creates an S3 "folder marker" object (a zero-byte file with a trailing slash).
 * @param {string} name The name of the new folder.
 * @param {string} userId The ID of the user creating the folder.
 * @param {string | null} parentId The ID of the parent folder, or null for a root folder.
 * @returns {Promise<Object>} The created folder object.
 */
exports.createFolder = async (name, userId, parentId = null) => {
  try {
    // 1. Check for duplicate name in the same parent folder for the same user
    const existingFolder = await prisma.folder.findFirst({
      where: {
        name: name,
        userId: userId,
        parentId: parentId,
      },
    });

    if (existingFolder) {
      throw new Error(`Folder with name '${name}' already exists in this location.`);
    }

    // 2. Create folder in the database
    const newFolder = await prisma.folder.create({
      data: {
        name,
        userId,
        parentId,
      },
    });

    // 3. Optional: Create a zero-byte S3 object as a "folder marker"
    // This is useful for making empty folders visible in the S3 console.
    // The key should represent the path: e.g., 'uploads/userId/folderId/' or 'uploads/userId/folderName/'
    // For simplicity, we'll use 'uploads/userId/folderId/' as it's unique
    const s3FolderKey = `uploads/${userId}/${newFolder.id}/`; // Using folder ID for S3 path

    try {
      await s3Utils.uploadFileToS3(Buffer.from(''), s3FolderKey, 'application/x-directory');
      console.log(`S3 folder marker created: ${s3FolderKey}`);
    } catch (s3Error) {
      console.warn(`Could not create S3 folder marker for ${s3FolderKey}. Folder will still exist in DB.`);
      console.warn(s3Error);
      // Don't rethrow, as DB creation is primary. S3 marker is for visibility.
    }

    return newFolder;
  } catch (error) {
    console.error("Error creating folder:", error);
    throw error;
  }
};


exports.getFolderContents = async (parentId, userId) => {
  try {
    // Fetch files directly within this parentId
    const files = await prisma.file.findMany({
      where: {
        userId: userId,
        folderId: parentId, // Files linked to this specific folder ID (or null for root)
      },
      orderBy: {
        filename: 'asc', // Order files alphabetically
      },
    });

    // Fetch sub-folders directly within this parentId
    const folders = await prisma.folder.findMany({
      where: {
        userId: userId,
        parentId: parentId, // Folders whose parent is this specific folder ID (or null for root)
      },
      orderBy: {
        name: 'asc', // Order folders alphabetically
      },
    });

    return { files, folders };
  } catch (error) {
    console.error(`Error fetching folder contents for parentId ${parentId}:`, error);
    throw new Error("Failed to fetch folder contents.");
  }
};