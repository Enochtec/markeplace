const prisma = require('../config/db');

const productInclude = {
  select: {
    id: true, name: true, slug: true, price: true, comparePrice: true, stock: true,
    images: { where: { isPrimary: true }, take: 1 },
    shop: { select: { id: true, name: true, slug: true } },
  },
};

// Get cart
const getCart = async (req, res) => {
  const cartItems = await prisma.cart.findMany({
    where: { userId: req.user.id },
    include: { product: productInclude },
    orderBy: { createdAt: 'asc' },
  });

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  res.json({ cartItems, total, itemCount });
};

// Add to cart
const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) return res.status(400).json({ message: 'Product ID is required' });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) return res.status(404).json({ message: 'Product not found' });
  if (product.stock < 1) return res.status(400).json({ message: 'Product is out of stock' });

  const qty = Math.max(1, parseInt(quantity));
  if (product.stock < qty) return res.status(400).json({ message: 'Insufficient stock' });

  const cartItem = await prisma.cart.upsert({
    where: { userId_productId: { userId: req.user.id, productId } },
    update: { quantity: { increment: qty } },
    create: { userId: req.user.id, productId, quantity: qty },
    include: { product: productInclude },
  });

  res.json({ message: 'Added to cart', cartItem });
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const qty = parseInt(quantity);

  if (!qty || qty < 1) return res.status(400).json({ message: 'Invalid quantity' });

  const cartItem = await prisma.cart.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { product: { select: { stock: true } } },
  });

  if (!cartItem) return res.status(404).json({ message: 'Cart item not found' });
  if (cartItem.product.stock < qty) return res.status(400).json({ message: 'Insufficient stock' });

  const updated = await prisma.cart.update({
    where: { id: req.params.id },
    data: { quantity: qty },
    include: { product: productInclude },
  });

  res.json({ message: 'Cart updated', cartItem: updated });
};

// Remove cart item
const removeFromCart = async (req, res) => {
  const cartItem = await prisma.cart.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!cartItem) return res.status(404).json({ message: 'Cart item not found' });

  await prisma.cart.delete({ where: { id: req.params.id } });
  res.json({ message: 'Item removed from cart' });
};

// Clear cart
const clearCart = async (req, res) => {
  await prisma.cart.deleteMany({ where: { userId: req.user.id } });
  res.json({ message: 'Cart cleared' });
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
