const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../config/aws');
require('dotenv').config();

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      // cb(null, `uploads/${Date.now()}_${file.originalname}`);
       const userId = req.user.id;
      // This is the format that will be used in S3
      cb(null, `uploads/${userId}/${Date.now()}-${file.originalname}`);
    },
  }),
});

module.exports = upload;
