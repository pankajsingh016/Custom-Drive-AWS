const {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
} = require('@aws-sdk/client-s3');
const { Upload } = require("@aws-sdk/lib-storage");

// const s3 = new S3Client({ region: process.env.AWS_REGION });
const { s3 } = require("../config/aws");

exports.deleteFromS3 = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME, // corrected to match upload bucket
    Key: key,
  });

  await s3.send(command);
};



exports.uploadFileToS3 = async (buffer, key, mimetype) => {
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    },
  });

  return await upload.done(); // this returns a promise that resolves when upload completes

};