const express = require('express');
const router = express.Router();
const Color = require('../../models/colors');

router.get('/', async (req, res) => {
  try {
    const colors = await Color.find();
    res.json(colors);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des couleurs' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const newColor = new Color({ name });
    await newColor.save();
    res.status(201).json(newColor);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la création de la couleur' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Color.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression de la couleur' });
  }
});

module.exports = router;
