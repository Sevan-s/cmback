const express = require('express');
const router = express.Router();
const giftCardController = require('../../conrtollers/giftCardController.js');

router.post("/use/:code", giftCardController.UseGiftCardByCode);
router.post("/", giftCardController.CreateGiftCard);
router.get("/", giftCardController.getAllGiftCard);
router.get("/:code", giftCardController.GetGiftCardByCode);
router.delete("/:code", giftCardController.DeleteGiftCardByCode);

module.exports = router;