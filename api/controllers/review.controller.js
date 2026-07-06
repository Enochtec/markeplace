const prisma = require('../config/db');

// Get product reviews
const getProductReviews = async (req, res) => {
  const { productId } = req.params;
  const reviews = await prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
  });
  res.json({ reviews });
};

// Create review
const createReview = async (req, res) => {
  const { productId, rating, comment } = req.body;

  if (!productId || !rating) return res.status(400).json({ message: 'Product ID and rating are required' });
  if (rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });

  // Check if user purchased the product
  const ordered = await prisma.orderItem.findFirst({
    where: { productId, order: { userId: req.user.id, status: 'DELIVERED' } },
  });
  if (!ordered) return res.status(403).json({ message: 'You can only review products you have purchased' });

  // Check for existing review
  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId: req.user.id, productId } },
  });
  if (existing) return res.status(409).json({ message: 'You have already reviewed this product' });

  const review = await prisma.review.create({
    data: { rating: parseInt(rating), comment, userId: req.user.id, productId },
    include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
  });

  // Update product rating
  const stats = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: { rating: stats._avg.rating || 0, reviewCount: stats._count.rating },
  });

  res.status(201).json({ message: 'Review submitted successfully', review });
};

// Delete review (admin or own)
const deleteReview = async (req, res) => {
  const where = req.user.role === 'ADMIN'
    ? { id: req.params.id }
    : { id: req.params.id, userId: req.user.id };

  const review = await prisma.review.findFirst({ where });
  if (!review) return res.status(404).json({ message: 'Review not found' });

  await prisma.review.delete({ where: { id: review.id } });

  // Recalculate product rating
  const stats = await prisma.review.aggregate({
    where: { productId: review.productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.product.update({
    where: { id: review.productId },
    data: { rating: stats._avg.rating || 0, reviewCount: stats._count.rating },
  });

  res.json({ message: 'Review deleted successfully' });
};

module.exports = { getProductReviews, createReview, deleteReview };
