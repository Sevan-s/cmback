const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const multer = require("multer");
const multerS3 = require("multer-s3");
require("dotenv").config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const filename = `${Date.now()}-${file.originalname}`;
      console.log("[SHOP]", `uploads/shop/${filename}`);

      cb(null, `uploads/shop/${filename}`);
    },
  }),
});

const uploadTissus = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    metadata: (req, file, cb) => {
      console.log(file);
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      console.log("req : ", req.body)
      const subfolder = req.query.folder || "default";
      const filename = `${Date.now()}-${file.originalname}`;
      const fullPath = `uploads/tissus/${subfolder}/${filename}`;

      console.log("[TISSUS]", fullPath, subfolder);

      cb(null, fullPath);
    },
  }),
});

const uploadSangles = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    metadata: (req, file, cb) => {
      console.log(file);
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      console.log("req : ", req.body)
      const subfolder = req.query.folder || "default";
      const filename = `${Date.now()}-${file.originalname}`;
      const fullPath = `uploads/sangles/${filename}`;

      console.log("[Sangles]", fullPath, subfolder);

      cb(null, fullPath);
    },
  }),
});

const uploadEtiquettes = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    metadata: (req, file, cb) => {
      console.log(file);
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      console.log("req : ", req.body)
      const subfolder = req.query.folder || "default";
      const filename = `${Date.now()}-${file.originalname}`;
      const fullPath = `uploads/etiquettes/${filename}`;

      console.log("[Sangles]", fullPath, subfolder);

      cb(null, fullPath);
    },
  }),
});

module.exports = { upload, uploadTissus, uploadSangles, uploadEtiquettes };