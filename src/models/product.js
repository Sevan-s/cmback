const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true},
    price: { type: Number, required: true },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true },
    maintenance: { type: String, required: true },
    stock: { type: Number, default: 0 },
    category: { type: String},
    imageUrl: { type: String},
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);