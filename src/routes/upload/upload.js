const express = require("express");
const upload = require("../../middleware/upload");
const router = express.Router();
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

require('dotenv').config();

router.post("/", upload.array("images"), (req, res) => {
  console.log("FICHIERS REÇUS :", req.files);

  if (!req.files || !req.files.length) {
    return res.status(400).json({ error: "Aucun fichier uploadé" });
  }
  const fileUrls = req.files.map(file => file.location);
  res.json({ fileUrls });
});

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});


router.get('/images', async (req, res) => {
  const bucket = process.env.S3_BUCKET_NAME;
  const prefix = "uploads/";
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    });
    const data = await s3.send(command);
    const images = data.Contents
      .filter(obj => {
        const key = obj.Key.toLowerCase();
        return key.endsWith('.jpg') || key.endsWith('.jpeg') || key.endsWith('.png');
      }).map(obj => ({
        url: `https://${bucket}.s3.amazonaws.com/${obj.Key}`,
        name: obj.Key.replace(prefix, '')
      }));
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
