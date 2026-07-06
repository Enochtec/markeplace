const prisma = require('../config/db');

const productInclude = {
  select: {
    id: true, name: true, slug: true, price: true, comparePrice: true, stock: true, rating: true,
    images: { where: { isPrimary: true }, take: 1 },
    shop: { select: { id: true, name: true, slug: true } },
    category: { select: { name: true } },
  },
};

// Get wishlist
const getWishlist = async (req, res) => {
  const items = await prisma.wishlist.findMany({
    where: { userId: req.user.id },
    include: { product: productInclude },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ items });
};

// Add to wishlist
const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ message: 'Product ID is required' });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId: req.user.id, productId } },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    return res.json({ message: 'Removed from wishlist', action: 'removed' });
  }

  const item = await prisma.wishlist.create({
    data: { userId: req.user.id, productId },
    include: { product: productInclude },
  });

  res.status(201).json({ message: 'Added to wishlist', item, action: 'added' });
};

// Remove from wishlist
const removeFromWishlist = async (req, res) => {
  const item = await prisma.wishlist.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!item) return res.status(404).json({ message: 'Wishlist item not found' });

  await prisma.wishlist.delete({ where: { id: req.params.id } });
  res.json({ message: 'Removed from wishlist' });
};

// Check if product is in wishlist
const checkWishlist = async (req, res) => {
  const item = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId: req.user.id, productId: req.params.productId } },
  });
  res.json({ isWishlisted: !!item });
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist, checkWishlist };
