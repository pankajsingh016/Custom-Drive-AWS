const {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// const s3 = new S3Client({ region: process.env.AWS_REGION });
const s3 = require("../config/aws");

exports.deleteFromS3 = async (key) => {
  if (!process.env.AWS_BUCKET_NAME) {
    throw new Error("AWS_BUCKET_NAME environment variable is not set.");
  }
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  try {
    await s3.send(command);
    console.log(`Successfully deleted object ${key} from S3 bucket.`);
  } catch (error) {
    console.error(`Error deleting S3 object ${key}:`, error);
    throw error;
  }
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

// New function for generating a pre-signed URL
exports.getPresignedUrl = async (key,disposition='attachment',mimetype=null, expiresIn = 3600 ) => {
  // expiresIn in seconds (default 1 hour)
  if (!process.env.AWS_BUCKET_NAME) {
    throw new Error("AWS_BUCKET_NAME environment variable is not set.");
  }


  const filename = key.split('/').pop();

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: `${disposition}; filename="${filename}"`,
    ...(mimetype && { ResponseContentType: mimetype })
  });

  try {
    const url = await getSignedUrl(s3, command, { expiresIn });
    console.log(`Generated pre-signed URL for ${key} with disposition: ${disposition}`);
    return url;
  } catch (error) {
    console.log("ERROR IN s3 utils");
    console.error(`Error generating pre-signed URL for ${key}:`, error);
    throw error;
  }
};
