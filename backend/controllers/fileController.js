import s3 from "../config/aws.js";
import {PutObjectCommand, DeleteObjectCommand} from '@aws-sdk/client-s3';
import {insertFile, getFiles, getFileById, deleteFileById } from "../models/fileModel.js"
import dotenv from 'dotenv';
dotenv.config();

//------------------------------------------------------------- upload a file to s3 bucket
async function uploadFile(req, res) {
  const file = req.file;
  const s3Key = `${Date.now()}_${file.originalname}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: s3Key,
    Body: file.buffer,
  };

  try {
    await s3.send(new PutObjectCommand(params));
    const id = await insertFile(file.originalname, s3Key, req.user.id);
    res.json({
      id,
      filename: file.originalname,
      s3_key: s3Key,
      url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
///--------------------------------------------------------------- list all the files from s3 bucket
async function listFiles(req, res) {
  try {
    const files = await getFiles(req.user.id);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
//------------------------------------------------------------------- delete a file from s3 bucket
async function deleteFile(req, res) {
  const id = req.params.id;
  try {
    const file = await getFileById(id, req.user.id);
    if (!file) return res.status(404).json({ error: "File not found" });
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      key: file.s3_key,
    };
    await s3.send(new DeleteObjectCommand(params));
    await deleteFileById(id);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export {uploadFile, listFiles, deleteFile};
