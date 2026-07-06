const jwt = require('jsonwebtoken');
const slugify = require('slugify');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const generateOrderNumber = () => {
  const prefix = 'MKT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const createSlug = (text, suffix = '') => {
  const base = slugify(text, { lower: true, strict: true, trim: true });
  return suffix ? `${base}-${suffix}` : base;
};

const paginate = (page = 1, limit = 12) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;
  return { skip, take: limitNum, page: pageNum, limit: limitNum };
};

const paginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

const sanitizeUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

module.exports = {
  generateToken,
  generateOrderNumber,
  createSlug,
  paginate,
  paginationMeta,
  sanitizeUser,
};
