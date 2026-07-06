const bcrypt = require('bcrypt');
const prisma = require('../config/db');
const { createSlug, paginate, paginationMeta } = require('../utils/helpers');
const { deleteImage } = require('../config/cloudinary');

// Admin: Register a new shop (creates user + shop)
const registerShop = async (req, res) => {
  const { ownerEmail, ownerPassword, ownerFirstName, ownerLastName, ownerPhone,
    shopName, shopEmail, shopPhone, shopAddress, shopCity, shopCountry, shopDescription } = req.body;

  if (!ownerEmail || !ownerPassword || !ownerFirstName || !ownerLastName || !shopName) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  const existingUser = await prisma.user.findUnique({ where: { email: ownerEmail } });
  if (existingUser) return res.status(409).json({ message: 'Email already registered' });

  const hashedPassword = await bcrypt.hash(ownerPassword, 12);
  const slug = createSlug(shopName, Date.now().toString(36));

  const user = await prisma.user.create({
    data: {
      email: ownerEmail,
      password: hashedPassword,
      firstName: ownerFirstName,
      lastName: ownerLastName,
      phone: ownerPhone,
      role: 'SHOP_OWNER',
      shop: {
        create: {
          name: shopName,
          slug,
          email: shopEmail || ownerEmail,
          phone: shopPhone,
          address: shopAddress,
          city: shopCity,
          country: shopCountry,
          description: shopDescription,
          status: 'PENDING',
        },
      },
    },
    include: { shop: true },
  });

  const { password: _, ...safeUser } = user;
  res.status(201).json({ message: 'Shop registered successfully', user: safeUser });
};

// Public: Get all active shops
const getShops = async (req, res) => {
  const { page, limit, search, status } = req.query;
  const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

  const isAdmin = req.user?.role === 'ADMIN';

  const where = {
    ...(!isAdmin && { status: 'ACTIVE' }),
    ...(isAdmin && status && { status }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [shops, total] = await Promise.all([
    prisma.shop.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { products: true, orders: true } },
      },
    }),
    prisma.shop.count({ where }),
  ]);

  res.json({ shops, meta: paginationMeta(total, currentPage, currentLimit) });
};

// Public: Get shop by ID or slug
const getShopById = async (req, res) => {
  const { id } = req.params;
  const shop = await prisma.shop.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      products: {
        where: { isActive: true },
        take: 12,
        orderBy: { createdAt: 'desc' },
        include: { images: { where: { isPrimary: true }, take: 1 }, category: true },
      },
      _count: { select: { products: true, orders: true } },
    },
  });

  if (!shop) return res.status(404).json({ message: 'Shop not found' });
  res.json({ shop });
};

// Shop Owner: Get own shop dashboard data
const getMyShop = async (req, res) => {
  const shop = await prisma.shop.findUnique({
    where: { ownerId: req.user.id },
    include: {
      _count: { select: { products: true, orders: true } },
    },
  });

  if (!shop) return res.status(404).json({ message: 'Shop not found' });

  const [totalRevenue, pendingOrders, recentOrders] = await Promise.all([
    prisma.order.aggregate({
      where: { shopId: shop.id, status: { not: 'CANCELLED' } },
      _sum: { totalAmount: true },
    }),
    prisma.order.count({ where: { shopId: shop.id, status: 'PENDING' } }),
    prisma.order.findMany({
      where: { shopId: shop.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    }),
  ]);

  res.json({
    shop,
    stats: {
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingOrders,
      totalProducts: shop._count.products,
      totalOrders: shop._count.orders,
    },
    recentOrders,
  });
};

// Shop Owner: Update shop profile
const updateShop = async (req, res) => {
  const shop = await prisma.shop.findUnique({ where: { ownerId: req.user.id } });
  if (!shop) return res.status(404).json({ message: 'Shop not found' });

  const { name, description, email, phone, address, city, country } = req.body;

  const data = {
    ...(name && { name }),
    ...(description !== undefined && { description }),
    ...(email && { email }),
    ...(phone !== undefined && { phone }),
    ...(address !== undefined && { address }),
    ...(city !== undefined && { city }),
    ...(country !== undefined && { country }),
  };

  if (req.files?.logo) {
    if (shop.logo) await deleteImage(shop.logo);
    data.logo = req.files.logo[0].path;
  }
  if (req.files?.banner) {
    if (shop.banner) await deleteImage(shop.banner);
    data.banner = req.files.banner[0].path;
  }

  const updated = await prisma.shop.update({ where: { id: shop.id }, data });
  res.json({ message: 'Shop updated successfully', shop: updated });
};

// Admin: Update shop status
const updateShopStatus = async (req, res) => {
  const { status } = req.body;
  if (!['ACTIVE', 'SUSPENDED', 'PENDING'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const shop = await prisma.shop.findUnique({ where: { id: req.params.id } });
  if (!shop) return res.status(404).json({ message: 'Shop not found' });

  const updated = await prisma.shop.update({ where: { id: req.params.id }, data: { status } });
  res.json({ message: `Shop ${status.toLowerCase()} successfully`, shop: updated });
};

// Admin: Delete shop
const deleteShop = async (req, res) => {
  const shop = await prisma.shop.findUnique({ where: { id: req.params.id } });
  if (!shop) return res.status(404).json({ message: 'Shop not found' });

  await prisma.shop.delete({ where: { id: req.params.id } });
  res.json({ message: 'Shop deleted successfully' });
};

// Public: Get popular/featured shops
const getPopularShops = async (req, res) => {
  const shops = await prisma.shop.findMany({
    where: { status: 'ACTIVE' },
    take: 8,
    orderBy: [{ totalSales: 'desc' }, { rating: 'desc' }],
    include: {
      _count: { select: { products: true } },
    },
  });
  res.json({ shops });
};

// Shop Owner: Get shop customers
const getShopCustomers = async (req, res) => {
  const shop = await prisma.shop.findUnique({ where: { ownerId: req.user.id } });
  if (!shop) return res.status(404).json({ message: 'Shop not found' });

  const { page, limit } = req.query;
  const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

  const orders = await prisma.order.findMany({
    where: { shopId: shop.id },
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const customerMap = new Map();
  for (const order of orders) {
    const uid = order.user.id;
    if (!customerMap.has(uid)) {
      customerMap.set(uid, { ...order.user, orderCount: 0, totalSpent: 0 });
    }
    customerMap.get(uid).orderCount++;
    customerMap.get(uid).totalSpent += order.totalAmount;
  }

  const customers = Array.from(customerMap.values());
  const total = customers.length;
  const paginated = customers.slice(skip, skip + take);

  res.json({ customers: paginated, meta: paginationMeta(total, currentPage, currentLimit) });
};

module.exports = {
  registerShop, getShops, getShopById, getMyShop, updateShop,
  updateShopStatus, deleteShop, getPopularShops, getShopCustomers,
};
