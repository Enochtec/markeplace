const express = require('express');
const router = express.Router();
const { getProductReviews, createReview, deleteReview } = require('../controllers/review.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/product/:productId', getProductReviews);
router.post('/', authenticate, createReview);
router.delete('/:id', authenticate, deleteReview);

module.exports = router;
