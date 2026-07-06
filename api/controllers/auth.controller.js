const bcrypt = require('bcrypt');
const prisma = require('../config/db');
const { generateToken, sanitizeUser, createSlug } = require('../utils/helpers');

const register = async (req, res) => {
  const { email, password, firstName, lastName, phone, role, shopName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: 'All required fields must be provided' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ message: 'Email already registered' });

  const hashedPassword = await bcrypt.hash(password, 12);

  const userRole = role === 'SHOP_OWNER' ? 'SHOP_OWNER' : 'CUSTOMER';

  const userData = {
    email,
    password: hashedPassword,
    firstName,
    lastName,
    phone,
    role: userRole,
  };

  if (userRole === 'SHOP_OWNER') {
    if (!shopName) {
      return res.status(400).json({ message: 'Shop name is required when registering as a shop owner' });
    }
    const slug = createSlug(shopName, Date.now().toString(36));
    userData.shop = {
      create: {
        name: shopName,
        slug,
        email,
        status: 'PENDING',
      },
    };
  }

  const user = await prisma.user.create({
    data: userData,
    include: { shop: true },
  });

  const token = generateToken(user.id);
  const message = userRole === 'SHOP_OWNER'
    ? 'Shop owner account created. Your shop is pending admin approval.'
    : 'Account created successfully';
  res.status(201).json({ message, token, user: sanitizeUser(user) });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { shop: { select: { id: true, name: true, slug: true, status: true, logo: true } } },
  });

  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  if (!user.isActive) return res.status(403).json({ message: 'Account is suspended' });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = generateToken(user.id);
  res.json({ message: 'Login successful', token, user: sanitizeUser(user) });
};

const getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { shop: { select: { id: true, name: true, slug: true, status: true, logo: true } } },
  });
  res.json({ user: sanitizeUser(user) });
};

const updateProfile = async (req, res) => {
  const { firstName, lastName, phone } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(phone && { phone }),
      ...(req.file && { avatar: req.file.path }),
    },
  });

  res.json({ message: 'Profile updated successfully', user: sanitizeUser(user) });
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Both passwords are required' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) return res.status(400).json({ message: 'Current password is incorrect' });

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: req.user.id }, data: { password: hashedPassword } });

  res.json({ message: 'Password changed successfully' });
};

module.exports = { register, login, getMe, updateProfile, changePassword };
