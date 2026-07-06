const express = require('express');
const router = express.Router();
const {
  getProducts, getProductById, getFeaturedProducts, getLatestProducts,
  getMyProducts, getAllProducts, createProduct, updateProduct, deleteProduct,
  deleteProductImage, toggleFeatured,
} = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { uploadProduct } = require('../config/cloudinary');

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/latest', getLatestProducts);
router.get('/:id', getProductById);

// Shop owner routes
router.get('/shop/mine', authenticate, authorize('SHOP_OWNER'), getMyProducts);
router.post('/', authenticate, authorize('SHOP_OWNER'), uploadProduct.array('images', 5), createProduct);
router.put('/:id', authenticate, authorize('SHOP_OWNER', 'ADMIN'), uploadProduct.array('images', 5), updateProduct);
router.delete('/:id', authenticate, authorize('SHOP_OWNER', 'ADMIN'), deleteProduct);
router.delete('/images/:imageId', authenticate, authorize('SHOP_OWNER'), deleteProductImage);

// Admin routes
router.get('/admin/all', authenticate, authorize('ADMIN'), getAllProducts);
router.patch('/admin/:id/featured', authenticate, authorize('ADMIN'), toggleFeatured);

module.exports = router;
