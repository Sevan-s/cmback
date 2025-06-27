const express = require("express");
const { upload, uploadTissus } = require('./tonfichier');
const router = express.Router();
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

require('dotenv').config();

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

router.post("/", upload.array("images"), (req, res) => {
  console.log("FICHIERS REÇUS :", req.files);

  if (!req.files || !req.files.length) {
    return res.status(400).json({ error: "Aucun fichier uploadé" });
  }
  const fileUrls = req.files.map(file => file.location);
  res.json({ fileUrls });
});

router.post("/tissus", uploadTissus.array("images"), (req, res) => {
  console.log("FICHIERS REÇUS :", req.files);

  if (!req.files || !req.files.length) {
    return res.status(400).json({ error: "Aucun fichier uploadé" });
  }
  const fileUrls = req.files.map(file => file.location);
  res.json({ fileUrls });
});

router.get('/images/shop', async (req, res) => {
    const bucket = process.env.S3_BUCKET_NAME;
    const prefix = "uploads/shop";
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
      });
      const data = await s3.send(command);
      const images = data.Contents
        .filter(obj => {
          const key = obj.Key || '';
          const lowerKey = key.toLowerCase();
          return lowerKey.endsWith('.jpg') || lowerKey.endsWith('.jpeg') || lowerKey.endsWith('.png');
        }).map(obj => ({
          url: `https://${bucket}.s3.amazonaws.com/${obj.Key}`,
          name: obj.Key.replace(prefix, '')
        }));
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/images/tissus', async (req, res) => {
    const bucket = process.env.S3_BUCKET_NAME;
    const prefix = "uploads/tissus";
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
      });
      const data = await s3.send(command);
      const images = data.Contents
        .filter(obj => {
          const key = obj.Key || '';
          const lowerKey = key.toLowerCase();
          return lowerKey.endsWith('.jpg') || lowerKey.endsWith('.jpeg') || lowerKey.endsWith('.png');
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
