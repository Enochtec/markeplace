const express = require('express');
const router = express.Router();
const {
  registerShop, getShops, getShopById, getMyShop, updateShop,
  updateShopStatus, deleteShop, getPopularShops, getShopCustomers,
} = require('../controllers/shop.controller');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth.middleware');
const { uploadShop } = require('../config/cloudinary');

// Public routes
router.get('/', optionalAuth, getShops);
router.get('/popular', getPopularShops);
router.get('/:id', getShopById);

// Shop owner routes
router.get('/owner/dashboard', authenticate, authorize('SHOP_OWNER'), getMyShop);
router.put('/owner/profile', authenticate, authorize('SHOP_OWNER'),
  uploadShop.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]),
  updateShop
);
router.get('/owner/customers', authenticate, authorize('SHOP_OWNER'), getShopCustomers);

// Admin routes
router.post('/admin/register', authenticate, authorize('ADMIN'), registerShop);
router.patch('/admin/:id/status', authenticate, authorize('ADMIN'), updateShopStatus);
router.delete('/admin/:id', authenticate, authorize('ADMIN'), deleteShop);

module.exports = router;
