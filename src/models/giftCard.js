const mongoose = require('mongoose');

const giftCardSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  price: { type: Number, required: true, min: 0 },
  redeemed: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true, index: true }, 
}, { timestamps: true });

module.exports = mongoose.model('GiftCard', giftCardSchema);