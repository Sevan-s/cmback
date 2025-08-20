const express = require('express')

const router = express.Router();
const productController = require('../../conrtollers/giftCardController.js');
router.post("/", productController.CreateGiftCard);
router.get("/", productController.getAllGiftCard)
router.get("/:code", productController.GetGiftCardByCode);
router.delete("/:code", productController.DeleteGiftCardByCode);

module.exports = router;