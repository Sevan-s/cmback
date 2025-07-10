const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true },
    maintenance: { type: String, required: true },
    stock: { type: Number, default: 0 },
    category: { type: String },
    subCategory: {type: String},
    imageUrls: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
    options: { type: [String], default: [] },
    fabrics: {type: [String], default: []},
    associateProduct: { type: String, default: "" }
});

module.exports = mongoose.model('Product', productSchema);