import { FileRepository } from "../repositories/fileRepository.js";
import { S3Storage } from "../storage/s3Storage.js";

export const FileService = {
  async upload(file, userId) {
    const s3Key = `${Date.now()}_${file.originalname}`;
    const url = await S3Storage.upload({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      Body: file.buffer
    });
    const saved = await FileRepository.create(file.originalname, s3Key, userId);
    return { id: saved.id, filename: saved.filename, url };
  },

  list(userId) {
    return FileRepository.findAllByUser(userId);
  },

  async remove(id, userId) {
    const file = await FileRepository.findById(id);
    if (!file || file.userId !== userId) throw new Error("File not found");

    await S3Storage.remove({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: file.s3Key
    });

    await FileRepository.deleteById(id);
  }
};
