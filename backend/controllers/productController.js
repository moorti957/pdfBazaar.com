import Product from "../models/Product.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all products
export const getProducts = async (req, res) => {
  try {
    console.log('📋 Fetching products from MongoDB...');
    
    const products = await Product.find().sort({ createdAt: -1 });
    console.log(`✅ Found ${products.length} products in MongoDB`);
    
    res.json({
      success: true,
      count: products.length,
      products: products,
      storage: 'mongodb'
    });
    
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// Get single product
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      product
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new product
export const createProduct = async (req, res) => {
  try {
    console.log('📦 Received new product request');
    console.log('Request body:', req.body);
    console.log('Uploaded files:', req.files);
    
    const { name, price, description, category, stock } = req.body;
    
    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }
    
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid price is required'
      });
    }
    
    // Create product object
    const productData = {
      name: name.trim(),
      price: parseFloat(price),
      description: description ? description.trim() : '',
      category: category || 'other',
      stock: parseInt(stock) || 0,
      sold: 0
    };
    
    // Handle uploaded files
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        productData.imageUrl = `/uploads/${req.files.image[0].filename}`;
        console.log('✅ Image saved:', productData.imageUrl);
      }
      
      if (req.files.pdf && req.files.pdf[0]) {
        productData.pdfUrl = `/uploads/${req.files.pdf[0].filename}`;
        console.log('✅ PDF saved:', productData.pdfUrl);
      }
    }
    
    console.log('💾 Saving to MongoDB Atlas...');
    const savedProduct = await Product.create(productData);
    console.log('✅ Saved to MongoDB:', savedProduct._id);
    
    res.status(201).json({
      success: true,
      message: 'Product added successfully!',
      product: savedProduct,
      storage: 'mongodb'
    });
    
  } catch (error) {
    console.error('❌ Error creating product:', error);
    
    // Clean up uploaded files if MongoDB save failed
    if (req.files) {
      const cleanupFiles = [];
      if (req.files.image) cleanupFiles.push(req.files.image[0]);
      if (req.files.pdf) cleanupFiles.push(req.files.pdf[0]);
      
      const uploadsDir = path.join(__dirname, '../uploads');
      cleanupFiles.forEach(file => {
        if (file && fs.existsSync(path.join(uploadsDir, file.filename))) {
          fs.unlinkSync(path.join(uploadsDir, file.filename));
          console.log('🧹 Cleaned up file:', file.filename);
        }
      });
    }
    
    if (error.name === 'MongoError' || error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      product
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Delete associated files
    const uploadsDir = path.join(__dirname, '../uploads');
    
    if (product.imageUrl) {
      const imagePath = path.join(uploadsDir, path.basename(product.imageUrl));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    if (product.pdfUrl) {
      const pdfPath = path.join(uploadsDir, path.basename(product.pdfUrl));
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }
    
    await product.deleteOne();
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get top products
export const getTopProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ sold: -1 })
      .limit(4)
      .select('name price stock sold createdAt imageUrl');
    
    res.json({
      success: true,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};