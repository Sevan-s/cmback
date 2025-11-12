const mongoose = require('mongoose');

function slugify(str) {
  return str
    .toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

const WhoSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
}, { _id: false });

const dimensionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
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
  options: { type: [String], default: [] },
  fabrics: { type: [String], default: [] },
  fabricsQuantities: { type: Number, default: 1 },
  associateProduct: { type: [{ name: String, price: Number }], default: [] },
  who: { type: [WhoSchema], default: [] },
  lot: { type: [{ quantities: Number, price: Number }], default: [] },
  dimensions: { type: [dimensionSchema], default: [] },
}, { timestamps: true });

productSchema.pre('validate', async function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
  if (this.isModified('slug')) {
    const base = this.slug;
    let candidate = base;
    let i = 2;
    const Product = this.constructor;
    while (await Product.exists({ slug: candidate, _id: { $ne: this._id } })) {
      candidate = `${base}-${i++}`;
    }
    this.slug = candidate;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);