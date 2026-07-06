const express = require('express');
const router = express.Router();
const { getBanners, getAllBanners, createBanner, updateBanner, deleteBanner } = require('../controllers/banner.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { uploadBanner } = require('../config/cloudinary');

router.get('/', getBanners);
router.get('/admin/all', authenticate, authorize('ADMIN'), getAllBanners);
router.post('/', authenticate, authorize('ADMIN'), uploadBanner.single('image'), createBanner);
router.put('/:id', authenticate, authorize('ADMIN'), uploadBanner.single('image'), updateBanner);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteBanner);

module.exports = router;
