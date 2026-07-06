const express = require('express');
const router = express.Router();
const {
  createOrder, getMyOrders, getMyOrderById, getShopOrders,
  updateOrderStatus, getAllOrders, getOrderStats,
} = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Customer routes
router.post('/', authenticate, authorize('CUSTOMER'), createOrder);
router.get('/my', authenticate, authorize('CUSTOMER'), getMyOrders);
router.get('/my/:id', authenticate, authorize('CUSTOMER'), getMyOrderById);

// Shop owner routes
router.get('/shop', authenticate, authorize('SHOP_OWNER'), getShopOrders);
router.patch('/shop/:id/status', authenticate, authorize('SHOP_OWNER', 'ADMIN'), updateOrderStatus);

// Admin routes
router.get('/admin/all', authenticate, authorize('ADMIN'), getAllOrders);
router.get('/admin/stats', authenticate, authorize('ADMIN'), getOrderStats);

module.exports = router;
