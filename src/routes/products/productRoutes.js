const express = require('express')
const authenticateToken = require('../../middleware/auth');
const Product = require('../../models/product');

const router = express.Router();
const productController = require('../../conrtollers/productController');

router.post('/', authenticateToken, productController.CreateProduct);
router.get('/', productController.getAllProducts);
router.get('/slug/:slug', async (req, res) => {
  try {
    const prod = await Product.findOne({ slug: req.params.slug });
    if (!prod) return res.status(404).json({ message: 'Produit introuvable' });
    res.json(prod);
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur', details: e.message });
  }
});
router.get('/:id', productController.getProductsById);
router.delete('/:id', authenticateToken, productController.delProductById);
router.put('/:id',authenticateToken, productController.putProductById);


module.exports = router;