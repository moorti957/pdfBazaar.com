
import express from "express";
import upload from "../middleware/upload.js";
import { checkDBConnection } from "../middleware/dbCheck.js";
import { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getTopProducts 
} from "../controllers/productController.js";


const router = express.Router();

// Get all products
router.get('/', checkDBConnection, getProducts);

// Get top products
router.get('/top', checkDBConnection, getTopProducts);

// Get single product
router.get('/:id', checkDBConnection, getProduct);

// Create new product (with file upload)
router.post('/', 
  checkDBConnection, 
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
  ]), 
  createProduct
);

// Update product
router.put('/:id', checkDBConnection, updateProduct);

// Delete product
router.delete('/:id', checkDBConnection, deleteProduct);

export default router;