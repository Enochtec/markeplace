const bcrypt = require('bcrypt');
const prisma = require('../config/db');
const { paginate, paginationMeta, sanitizeUser } = require('../utils/helpers');

// Admin: Get all users
const getUsers = async (req, res) => {
  const { page, limit, search, role } = req.query;
  const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

  const where = {
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(role && { role }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, avatar: true, role: true, isActive: true,
        isVerified: true, createdAt: true,
        shop: { select: { id: true, name: true, status: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ users, meta: paginationMeta(total, currentPage, currentLimit) });
};

// Admin: Get single user
const getUserById = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: {
      shop: true,
      orders: { take: 5, orderBy: { createdAt: 'desc' } },
    },
  });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user: sanitizeUser(user) });
};

// Admin: Toggle user status
const toggleUserStatus = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'ADMIN') return res.status(403).json({ message: 'Cannot suspend an admin account' });

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive: !user.isActive },
  });

  res.json({
    message: `User ${updated.isActive ? 'activated' : 'suspended'} successfully`,
    user: sanitizeUser(updated),
  });
};

// Admin: Delete user
const deleteUser = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'ADMIN') return res.status(403).json({ message: 'Cannot delete an admin account' });

  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ message: 'User deleted successfully' });
};

// Admin: Get user stats
const getUserStats = async (req, res) => {
  const [total, customers, shopOwners, activeUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.user.count({ where: { role: 'SHOP_OWNER' } }),
    prisma.user.count({ where: { isActive: true } }),
  ]);

  res.json({ total, customers, shopOwners, activeUsers });
};

module.exports = { getUsers, getUserById, toggleUserStatus, deleteUser, getUserStats };
