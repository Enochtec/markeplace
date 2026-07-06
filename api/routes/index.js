const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/shops', require('./shop.routes'));
router.use('/categories', require('./category.routes'));
router.use('/products', require('./product.routes'));
router.use('/orders', require('./order.routes'));
router.use('/cart', require('./cart.routes'));
router.use('/wishlist', require('./wishlist.routes'));
router.use('/reviews', require('./review.routes'));
router.use('/banners', require('./banner.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/settings', require('./setting.routes'));

module.exports = router;
