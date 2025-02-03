const Product = require('../models/product');

exports.CreateProduct = async (req, res) => {
    try {
        const { name, price, description, shortDescription, maintenance, stock, category, imageUrl } = req.body;
        const existingProduct = await Product.findOne({name});

        if (existingProduct) {
            return res.status(400).json({error: 'product name already exist'});
        }
        const newProduct = new Product({ name, price, description, shortDescription, maintenance, stock, category, imageUrl });
        await newProduct.save();
        res.status(201).json({ Product: newProduct })
    } catch (error) {
        res.status(500).json({ error: 'Error creating product', details: error });
        console.log('error: ', error)
    }
}

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({ products })
    } catch (error) {
        res.status(500).json({ error: 'error getting all products', details: error })
    }
}

exports.getProductsById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'product not found' });
        }
        res.status(200).json({ product })
    } catch (error) {
        res.status(500).json({ error: 'error getting product by id', details: error })
    }
}

exports.delProductById = async (req, res) => {
    try {
        const product = await Product.deleteOne({ _id: req.params.id });
        if (!product) {
            return res.status(404).json({ error: 'product not found' });

        }
        res.status(200).json({ message: 'Product deleted successfully' });

    } catch (error) {
        res.status(500).json({ error: 'error deleting product', details: error })
    }
}

exports.putProductById = async (req, res) => {
    try {
        const { name, price, description, shortDescription, maintenance, stock, category, imageUrl } = req.body;
        const productId = req.params.id;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const existingProduct = await Product.findOne({name});

        if (existingProduct) {
            return res.status(400).json({error: 'product name already exist'});
        }
        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;
        product.shortDescription = shortDescription || product.shortDescription;
        product.maintenance = maintenance || product.maintenance;
        product.stock = stock || product.stock;
        product.category = category || product.category;
        product.imageUrl = imageUrl || product.imageUrl;

        await product.save();
        res.status(200).json({ Product: product });
    } catch (error) {
        res.status(500).json({ error: 'Error updating product', details: error });
        console.log('error: ', error);
    }
}