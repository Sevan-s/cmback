const mongoose = require('mongoose');

const dimensionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const WhoSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  dimension: { type: String, required: true },
  composition: { type: String, required: true },
  shortDescription: { type: String, required: true },
  maintenance: { type: String, required: true },
  stock: { type: Number, default: 0 },
  category: { type: String },
  subCategory: { type: [String] },
  imageUrls: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  options: { type: [String], default: [] },
  fabrics: { type: [String], default: [] },
  fabricsQuantities: { type: Number, default: 1 },
  associateProduct: { type: [{ name: String, price: Number }], default: [] },
  who: { type: [WhoSchema], default: [] },
  lot: { type: [{ quantities: Number, price: Number }], default: [] },
  dimensions: { type: [dimensionSchema], default: [] },
});

module.exports = mongoose.model('Product', productSchema);