import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['skincare', 'haircare', 'makeup', 'fragrance', 'wellness', 'other']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  status: {
    type: String,
    enum: ['In Stock', 'Out of stock', 'Low stock'],
    default: 'In Stock'
  },
  imageUrl: {
    type: String
  },
  pdfUrl: {
    type: String
  },
  sold: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
productSchema.pre('save', function () {
  this.updatedAt = Date.now();

  if (this.stock === 0) {
    this.status = 'Out of stock';
  } else if (this.stock <= 10) {
    this.status = 'Low stock';
  } else {
    this.status = 'In Stock';
  }
});

const Product = mongoose.model('Product', productSchema);
export default Product;