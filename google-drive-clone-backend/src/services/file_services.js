const prisma = require('../config/db');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { deleteFromS3 } = require('./s3_utils'); // utility function to delete from S3

exports.saveFile = async (file, userId) => {
  return await prisma.file.create({
    data: {
      filename: file.originalname,
      key: file.key,
      userId,
    },
  });
};

exports.getFiles = async (userId) => {
  return await prisma.file.findMany({
    where: { userId },
    orderBy: { uploadedAt: 'desc' },
  });
};

exports.getFileById = async (fileId, userId) => {
  const file = await prisma.file.findFirst({
    where: { id: fileId, userId },
  });

  if (!file) throw new Error('File not found');

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: file.key,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 }); // 5 min
  return { ...file, presignedUrl: url };
};


exports.deleteFile = async (fileId, userId) => {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (!file) throw new Error('File not found');
  if (file.userId !== userId) throw new Error('Unauthorized');

  // Delete from S3
  await deleteFromS3(file.s3Key); // You must store s3Key in DB when uploading

  // Delete from DB
  await prisma.file.delete({
    where: { id: fileId },
  });

  return { message: 'File deleted' };
};
