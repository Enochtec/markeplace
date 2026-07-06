const prisma = require('../config/db');

// Get all settings (public for platform name/logo etc)
const getSettings = async (req, res) => {
  const { group } = req.query;
  const where = group ? { group } : {};

  const settings = await prisma.setting.findMany({ where, orderBy: { key: 'asc' } });
  const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});

  res.json({ settings: settingsMap, raw: settings });
};

// Admin: Upsert setting
const upsertSetting = async (req, res) => {
  const { key, value, group, label } = req.body;
  if (!key || value === undefined) return res.status(400).json({ message: 'key and value are required' });

  const setting = await prisma.setting.upsert({
    where: { key },
    update: { value, ...(group && { group }), ...(label && { label }) },
    create: { key, value, group: group || 'general', label },
  });

  res.json({ message: 'Setting saved', setting });
};

// Admin: Batch update settings
const updateSettings = async (req, res) => {
  const { settings } = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ message: 'Settings object is required' });
  }

  const updates = Object.entries(settings).map(([key, value]) =>
    prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    })
  );

  await Promise.all(updates);
  res.json({ message: 'Settings updated successfully' });
};

// Admin: Delete setting
const deleteSetting = async (req, res) => {
  const setting = await prisma.setting.findUnique({ where: { key: req.params.key } });
  if (!setting) return res.status(404).json({ message: 'Setting not found' });

  await prisma.setting.delete({ where: { key: req.params.key } });
  res.json({ message: 'Setting deleted' });
};

// Admin: Dashboard stats
const getDashboardStats = async (req, res) => {
  const [
    totalUsers, totalShops, totalProducts, totalOrders,
    totalRevenue, pendingOrders, activeShops, newUsersThisMonth,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.shop.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { not: 'CANCELLED' } } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.shop.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({
      where: {
        role: 'CUSTOMER',
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
  ]);

  // Monthly revenue for chart (last 6 months)
  const monthlyRevenue = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const revenue = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { createdAt: { gte: start, lte: end }, status: { not: 'CANCELLED' } },
    });

    monthlyRevenue.push({
      month: start.toLocaleString('default', { month: 'short' }),
      revenue: revenue._sum.totalAmount || 0,
    });
  }

  res.json({
    stats: {
      totalUsers, totalShops, totalProducts, totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingOrders, activeShops, newUsersThisMonth,
    },
    monthlyRevenue,
  });
};

module.exports = { getSettings, upsertSetting, updateSettings, deleteSetting, getDashboardStats };
