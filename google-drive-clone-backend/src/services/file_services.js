const prisma = require('../config/db');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

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