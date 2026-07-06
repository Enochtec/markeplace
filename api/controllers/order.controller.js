const prisma = require('../config/db');
const { generateOrderNumber, paginate, paginationMeta } = require('../utils/helpers');

// Customer: Create order
const createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod, notes } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order items are required' });
  }
  if (!shippingAddress) {
    return res.status(400).json({ message: 'Shipping address is required' });
  }

  // Fetch all products and validate
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    include: { shop: true },
  });

  if (products.length !== items.length) {
    return res.status(400).json({ message: 'One or more products are unavailable' });
  }

  // Group by shop
  const shopGroups = {};
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (product.stock < item.quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
    }
    if (!shopGroups[product.shopId]) shopGroups[product.shopId] = [];
    shopGroups[product.shopId].push({ ...item, product });
  }

  const createdOrders = [];

  // Create one order per shop
  for (const [shopId, shopItems] of Object.entries(shopGroups)) {
    const totalAmount = shopItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: req.user.id,
        shopId,
        totalAmount,
        shippingAddress,
        paymentMethod,
        notes,
        items: {
          create: shopItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.product.price,
          })),
        },
      },
      include: {
        items: { include: { product: { select: { name: true, images: { where: { isPrimary: true }, take: 1 } } } } },
        shop: { select: { name: true } },
      },
    });

    // Decrement stock
    for (const item of shopItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity }, soldCount: { increment: item.quantity } },
      });
    }

    // Update shop total sales
    await prisma.shop.update({
      where: { id: shopId },
      data: { totalSales: { increment: Math.round(totalAmount) } },
    });

    createdOrders.push(order);
  }

  // Clear cart items for ordered products
  await prisma.cart.deleteMany({
    where: { userId: req.user.id, productId: { in: productIds } },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId: req.user.id,
      title: 'Order Placed',
      message: `Your order has been placed successfully. Order number: ${createdOrders[0].orderNumber}`,
      type: 'ORDER',
    },
  });

  res.status(201).json({ message: 'Order placed successfully', orders: createdOrders });
};

// Customer: Get own orders
const getMyOrders = async (req, res) => {
  const { page, limit, status } = req.query;
  const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

  const where = {
    userId: req.user.id,
    ...(status && { status }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where, skip, take,
      orderBy: { createdAt: 'desc' },
      include: {
        shop: { select: { name: true, logo: true } },
        items: {
          include: {
            product: {
              select: { name: true, images: { where: { isPrimary: true }, take: 1 } },
            },
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({ orders, meta: paginationMeta(total, currentPage, currentLimit) });
};

// Customer: Get single order
const getMyOrderById = async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: {
      shop: { select: { name: true, logo: true, email: true, phone: true } },
      items: {
        include: {
          product: {
            select: { name: true, slug: true, images: { where: { isPrimary: true }, take: 1 } },
          },
        },
      },
    },
  });

  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ order });
};

// Shop Owner: Get shop orders
const getShopOrders = async (req, res) => {
  const shop = await prisma.shop.findUnique({ where: { ownerId: req.user.id } });
  if (!shop) return res.status(404).json({ message: 'Shop not found' });

  const { page, limit, status } = req.query;
  const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

  const where = { shopId: shop.id, ...(status && { status }) };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where, skip, take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        items: {
          include: {
            product: {
              select: { name: true, images: { where: { isPrimary: true }, take: 1 } },
            },
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({ orders, meta: paginationMeta(total, currentPage, currentLimit) });
};

// Shop Owner or Admin: Update order status
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid order status' });
  }

  const where = req.user.role === 'ADMIN'
    ? { id: req.params.id }
    : { id: req.params.id, shop: { ownerId: req.user.id } };

  const order = await prisma.order.findFirst({ where, include: { user: true } });
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const updated = await prisma.order.update({ where: { id: order.id }, data: { status } });

  // Notify customer
  await prisma.notification.create({
    data: {
      userId: order.userId,
      title: 'Order Update',
      message: `Your order #${order.orderNumber} status has been updated to ${status}`,
      type: 'ORDER',
    },
  });

  res.json({ message: 'Order status updated', order: updated });
};

// Admin: Get all orders
const getAllOrders = async (req, res) => {
  const { page, limit, status, shop } = req.query;
  const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

  const where = {
    ...(status && { status }),
    ...(shop && { shopId: shop }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where, skip, take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        shop: { select: { name: true } },
        items: { select: { quantity: true, price: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({ orders, meta: paginationMeta(total, currentPage, currentLimit) });
};

// Admin: Get order stats
const getOrderStats = async (req, res) => {
  const [total, pending, delivered, cancelled, revenue] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'DELIVERED' } }),
    prisma.order.count({ where: { status: 'CANCELLED' } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { not: 'CANCELLED' } } }),
  ]);

  res.json({ total, pending, delivered, cancelled, revenue: revenue._sum.totalAmount || 0 });
};

module.exports = {
  createOrder, getMyOrders, getMyOrderById, getShopOrders,
  updateOrderStatus, getAllOrders, getOrderStats,
};
