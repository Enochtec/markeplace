const prisma = require('../config/db');
const { createSlug } = require('../utils/helpers');
const { deleteImage } = require('../config/cloudinary');

// Public: Get all active categories
const getCategories = async (req, res) => {
  const { parentOnly } = req.query;

  const where = {
    isActive: true,
    ...(parentOnly === 'true' && { parentId: null }),
  };

  const categories = await prisma.category.findMany({
    where,
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: {
      children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      _count: { select: { products: true } },
    },
  });

  res.json({ categories });
};

// Admin: Get all categories (including inactive)
const getAllCategories = async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { products: true } },
    },
  });
  res.json({ categories });
};

// Public: Get category by ID or slug
const getCategoryById = async (req, res) => {
  const { id } = req.params;
  const category = await prisma.category.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      children: { where: { isActive: true } },
      _count: { select: { products: true } },
    },
  });

  if (!category) return res.status(404).json({ message: 'Category not found' });
  res.json({ category });
};

// Admin: Create category
const createCategory = async (req, res) => {
  const { name, description, parentId, icon, sortOrder } = req.body;

  if (!name) return res.status(400).json({ message: 'Category name is required' });

  const slug = createSlug(name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  const finalSlug = existing ? createSlug(name, Date.now().toString(36)) : slug;

  const category = await prisma.category.create({
    data: {
      name,
      slug: finalSlug,
      description,
      icon,
      sortOrder: sortOrder ? parseInt(sortOrder) : 0,
      ...(parentId && { parentId }),
      ...(req.file && { image: req.file.path }),
    },
  });

  res.status(201).json({ message: 'Category created successfully', category });
};

// Admin: Update category
const updateCategory = async (req, res) => {
  const { name, description, parentId, icon, isActive, sortOrder } = req.body;

  const category = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!category) return res.status(404).json({ message: 'Category not found' });

  let newSlug = category.slug;
  if (name && name !== category.name) {
    const slug = createSlug(name);
    const existing = await prisma.category.findFirst({ where: { slug, id: { not: category.id } } });
    newSlug = existing ? createSlug(name, Date.now().toString(36)) : slug;
  }

  const data = {
    ...(name && { name, slug: newSlug }),
    ...(description !== undefined && { description }),
    ...(icon !== undefined && { icon }),
    ...(isActive !== undefined && { isActive: isActive === 'true' || isActive === true }),
    ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder) }),
    ...(parentId !== undefined && { parentId: parentId || null }),
    ...(req.file && { image: req.file.path }),
  };

  if (req.file && category.image) {
    await deleteImage(category.image);
  }

  const updated = await prisma.category.update({ where: { id: req.params.id }, data });
  res.json({ message: 'Category updated successfully', category: updated });
};

// Admin: Delete category
const deleteCategory = async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { products: true } } },
  });

  if (!category) return res.status(404).json({ message: 'Category not found' });
  if (category._count.products > 0) {
    return res.status(400).json({ message: 'Cannot delete category with products. Move products first.' });
  }

  if (category.image) await deleteImage(category.image);
  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ message: 'Category deleted successfully' });
};

module.exports = { getCategories, getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
