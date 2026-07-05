const express = require('express');
const router = express.Router();
const {
  getCategories, getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory,
} = require('../controllers/category.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { uploadShop } = require('../config/cloudinary');

// Public
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin
router.get('/admin/all', authenticate, authorize('ADMIN'), getAllCategories);
router.post('/', authenticate, authorize('ADMIN'), uploadShop.single('image'), createCategory);
router.put('/:id', authenticate, authorize('ADMIN'), uploadShop.single('image'), updateCategory);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCategory);

module.exports = router;
