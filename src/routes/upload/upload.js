const express = require("express");
const upload = require("../../middleware/upload");
const router = express.Router();

router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier uploadé" });
  }
  res.json({ fileUrl: (req.file).location });
});

module.exports = router;
