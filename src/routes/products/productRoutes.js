const express = require('express')
const authenticateToken = require('../../middleware/auth');

const router = express.Router();
const productController = require('../../conrtollers/productController');

router.post('/', authenticateToken, productController.CreateProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductsById);
router.delete('/:id', authenticateToken, productController.delProductById);
router.put('/:id',authenticateToken, productController.putProductById);
module.exports = router;