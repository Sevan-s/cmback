const express = require("express");
const { upload, uploadTissus, uploadSangles, uploadEtiquettes } = require("../../middleware/upload");
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

  if (!req.files || !req.files.length) {
    return res.status(400).json({ error: "Aucun fichier uploadé" });
  }
  const fileUrls = req.files.map(file => file.location);
  res.json({ fileUrls });
});

router.post("/tissus", uploadTissus.array("images"), (req, res) => {


  if (!req.files || !req.files.length) {
    return res.status(400).json({ error: "Aucun fichier uploadé" });
  }
  const fileUrls = req.files.map(file => file.location);
  res.json({ fileUrls });
});

router.delete("/images/tissus", async (req, res) => {
  try {
    const bucket = process.env.S3_BUCKET_NAME;
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({ error: "Paramètre 'key' manquant" });
    }

    if (!key.startsWith("uploads/tissus/")) {
      return res.status(403).json({ error: "Suppression non autorisée" });
    }

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await s3.send(command);

    return res.json({ ok: true, deletedKey: key });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/sangles", uploadSangles.array("images"), (req, res) => {


  if (!req.files || !req.files.length) {
    return res.status(400).json({ error: "Aucun fichier uploadé" });
  }
  const fileUrls = req.files.map(file => file.location);
  res.json({ fileUrls });
});

router.post("/etiquettes", uploadEtiquettes.array("images"), (req, res) => {


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
    const folder = req.query.folder || "";
    const prefix = `uploads/tissus/${folder}`;
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
          id: obj.Key,
          url: `https://${bucket}.s3.amazonaws.com/${obj.Key}`,
          name: obj.Key.replace(prefix, '')
        }));
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

    router.get('/images/sangles', async (req, res) => {
    const bucket = process.env.S3_BUCKET_NAME;
    const folder = req.query.folder || "";
    const prefix = `uploads/sangles/${folder}`;
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
          id: obj.Key,
          url: `https://${bucket}.s3.amazonaws.com/${obj.Key}`,
          name: obj.Key.replace(prefix, '')
        }));
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

      router.get('/images/etiquettes', async (req, res) => {
    const bucket = process.env.S3_BUCKET_NAME;
    const folder = req.query.folder || "";
    const prefix = `uploads/etiquettes/${folder}`;
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
          id: obj.Key,
          url: `https://${bucket}.s3.amazonaws.com/${obj.Key}`,
          name: obj.Key.replace(prefix, '')
        }));
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  module.exports = router;
