const prisma = require('../config/db');
const { createSlug, paginate, paginationMeta } = require('../utils/helpers');
const { deleteImage } = require('../config/cloudinary');

const productSelect = {
  id: true, name: true, slug: true, description: true, price: true, comparePrice: true,
  sku: true, stock: true, isActive: true, isFeatured: true, rating: true, reviewCount: true,
  soldCount: true, tags: true, createdAt: true,
  images: { orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }] },
  category: { select: { id: true, name: true, slug: true } },
  shop: { select: { id: true, name: true, slug: true, logo: true } },
};

// Public: Get all products with filters
const getProducts = async (req, res) => {
  const { page, limit, search, category, shop, minPrice, maxPrice, sort, featured } = req.query;
  const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

  const where = {
    isActive: true,
    shop: { status: 'ACTIVE' },
    ...(featured === 'true' && { isFeatured: true }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
      ],
    }),
    ...(category && {
      OR: [{ categoryId: category }, { category: { slug: category } }],
    }),
    ...(shop && {
      OR: [{ shopId: shop }, { shop: { slug: shop } }],
    }),
    ...((minPrice || maxPrice) && {
      price: {
        ...(minPrice && { gte: parseFloat(minPrice) }),
        ...(maxPrice && { lte: parseFloat(maxPrice) }),
      },
    }),
  };

  const orderBy = {
    newest: { createdAt: 'desc' },
    oldest: { createdAt: 'asc' },
    price_asc: { price: 'asc' },
    price_desc: { price: 'desc' },
    rating: { rating: 'desc' },
    popular: { soldCount: 'desc' },
  }[sort] || { createdAt: 'desc' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take, orderBy, select: productSelect }),
    prisma.product.count({ where }),
  ]);

  res.json({ products, meta: paginationMeta(total, currentPage, currentLimit) });
};

// Public: Get single product
const getProductById = async (req, res) => {
  const { id } = req.params;
  const product = await prisma.product.findFirst({
    where: { OR: [{ id }, { slug: id }], isActive: true },
    include: {
      images: { orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }] },
      category: true,
      shop: { select: { id: true, name: true, slug: true, logo: true, rating: true } },
      reviews: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
      },
    },
  });

  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ product });
};

// Public: Get featured products
const getFeaturedProducts = async (req, res) => {
  const { limit = 8 } = req.query;
  const products = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true, shop: { status: 'ACTIVE' } },
    take: parseInt(limit),
    orderBy: { soldCount: 'desc' },
    select: productSelect,
  });
  res.json({ products });
};

// Public: Get latest products
const getLatestProducts = async (req, res) => {
  const { limit = 12 } = req.query;
  const products = await prisma.product.findMany({
    where: { isActive: true, shop: { status: 'ACTIVE' } },
    take: parseInt(limit),
    orderBy: { createdAt: 'desc' },
    select: productSelect,
  });
  res.json({ products });
};

// Shop Owner: Get own products
const getMyProducts = async (req, res) => {
  const shop = await prisma.shop.findUnique({ where: { ownerId: req.user.id } });
  if (!shop) return res.status(404).json({ message: 'Shop not found' });

  const { page, limit, search, isActive } = req.query;
  const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

  const where = {
    shopId: shop.id,
    ...(search && { name: { contains: search, mode: 'insensitive' } }),
    ...(isActive !== undefined && { isActive: isActive === 'true' }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where, skip, take,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({ products, meta: paginationMeta(total, currentPage, currentLimit) });
};

// Admin: Get all products
const getAllProducts = async (req, res) => {
  const { page, limit, search, shop, category, isActive } = req.query;
  const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

  const where = {
    ...(search && { name: { contains: search, mode: 'insensitive' } }),
    ...(shop && { shopId: shop }),
    ...(category && { categoryId: category }),
    ...(isActive !== undefined && { isActive: isActive === 'true' }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where, skip, take,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true } },
        shop: { select: { name: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({ products, meta: paginationMeta(total, currentPage, currentLimit) });
};

// Shop Owner: Create product
const createProduct = async (req, res) => {
  const shop = await prisma.shop.findUnique({ where: { ownerId: req.user.id } });
  if (!shop) return res.status(404).json({ message: 'Shop not found' });
  if (shop.status !== 'ACTIVE') return res.status(403).json({ message: 'Your shop is not active' });

  const { name, description, price, comparePrice, sku, stock, categoryId, isFeatured, tags } = req.body;

  if (!name || !description || !price || !categoryId) {
    return res.status(400).json({ message: 'Required fields missing' });
  }

  let slug = createSlug(name);
  const existingSlug = await prisma.product.findUnique({ where: { slug } });
  if (existingSlug) slug = createSlug(name, Date.now().toString(36));

  const parsedTags = tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [];

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : null,
      sku: sku || null,
      stock: parseInt(stock) || 0,
      categoryId,
      shopId: shop.id,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      tags: parsedTags,
    },
  });

  // Handle uploaded images
  if (req.files && req.files.length > 0) {
    const imageData = req.files.map((file, index) => ({
      url: file.path,
      publicId: file.filename,
      isPrimary: index === 0,
      productId: product.id,
    }));
    await prisma.productImage.createMany({ data: imageData });
  }

  const fullProduct = await prisma.product.findUnique({
    where: { id: product.id },
    include: { images: true, category: true },
  });

  res.status(201).json({ message: 'Product created successfully', product: fullProduct });
};

// Shop Owner: Update product
const updateProduct = async (req, res) => {
  const shop = await prisma.shop.findUnique({ where: { ownerId: req.user.id } });
  if (!shop) return res.status(404).json({ message: 'Shop not found' });

  const product = await prisma.product.findFirst({
    where: { id: req.params.id, shopId: shop.id },
    include: { images: true },
  });
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const { name, description, price, comparePrice, sku, stock, categoryId, isActive, isFeatured, tags } = req.body;

  let slug = product.slug;
  if (name && name !== product.name) {
    slug = createSlug(name);
    const existing = await prisma.product.findFirst({ where: { slug, id: { not: product.id } } });
    if (existing) slug = createSlug(name, Date.now().toString(36));
  }

  const parsedTags = tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : product.tags;

  const updated = await prisma.product.update({
    where: { id: product.id },
    data: {
      ...(name && { name, slug }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(comparePrice !== undefined && { comparePrice: comparePrice ? parseFloat(comparePrice) : null }),
      ...(sku !== undefined && { sku }),
      ...(stock !== undefined && { stock: parseInt(stock) }),
      ...(categoryId && { categoryId }),
      ...(isActive !== undefined && { isActive: isActive === 'true' || isActive === true }),
      ...(isFeatured !== undefined && { isFeatured: isFeatured === 'true' || isFeatured === true }),
      tags: parsedTags,
    },
    include: { images: true, category: true },
  });

  // Add new images if uploaded
  if (req.files && req.files.length > 0) {
    const hasImages = product.images.length > 0;
    const imageData = req.files.map((file, index) => ({
      url: file.path,
      publicId: file.filename,
      isPrimary: !hasImages && index === 0,
      productId: product.id,
    }));
    await prisma.productImage.createMany({ data: imageData });
  }

  res.json({ message: 'Product updated successfully', product: updated });
};

// Shop Owner or Admin: Delete product
const deleteProduct = async (req, res) => {
  const where = req.user.role === 'ADMIN'
    ? { id: req.params.id }
    : { id: req.params.id, shop: { ownerId: req.user.id } };

  const product = await prisma.product.findFirst({ where, include: { images: true } });
  if (!product) return res.status(404).json({ message: 'Product not found' });

  // Delete images from cloudinary
  for (const image of product.images) {
    if (image.publicId) await deleteImage(image.publicId);
  }

  await prisma.product.delete({ where: { id: product.id } });
  res.json({ message: 'Product deleted successfully' });
};

// Shop Owner: Delete a product image
const deleteProductImage = async (req, res) => {
  const shop = await prisma.shop.findUnique({ where: { ownerId: req.user.id } });
  const image = await prisma.productImage.findFirst({
    where: { id: req.params.imageId, product: { shopId: shop.id } },
  });
  if (!image) return res.status(404).json({ message: 'Image not found' });

  if (image.publicId) await deleteImage(image.publicId);
  await prisma.productImage.delete({ where: { id: image.id } });
  res.json({ message: 'Image deleted successfully' });
};

// Admin: Toggle product featured status
const toggleFeatured = async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const updated = await prisma.product.update({
    where: { id: req.params.id },
    data: { isFeatured: !product.isFeatured },
  });

  res.json({ message: `Product ${updated.isFeatured ? 'featured' : 'unfeatured'} successfully`, product: updated });
};

module.exports = {
  getProducts, getProductById, getFeaturedProducts, getLatestProducts,
  getMyProducts, getAllProducts, createProduct, updateProduct, deleteProduct,
  deleteProductImage, toggleFeatured,
};
