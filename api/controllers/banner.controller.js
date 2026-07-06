const prisma = require('../config/db');
const { deleteImage } = require('../config/cloudinary');

// Public: Get active banners
const getBanners = async (req, res) => {
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
  res.json({ banners });
};

// Admin: Get all banners
const getAllBanners = async (req, res) => {
  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
  res.json({ banners });
};

// Admin: Create banner
const createBanner = async (req, res) => {
  const { title, subtitle, link, isActive, sortOrder } = req.body;

  if (!title) return res.status(400).json({ message: 'Banner title is required' });
  if (!req.file) return res.status(400).json({ message: 'Banner image is required' });

  const banner = await prisma.banner.create({
    data: {
      title,
      subtitle,
      link,
      image: req.file.path,
      publicId: req.file.filename,
      isActive: isActive !== 'false',
      sortOrder: parseInt(sortOrder) || 0,
    },
  });

  res.status(201).json({ message: 'Banner created successfully', banner });
};

// Admin: Update banner
const updateBanner = async (req, res) => {
  const banner = await prisma.banner.findUnique({ where: { id: req.params.id } });
  if (!banner) return res.status(404).json({ message: 'Banner not found' });

  const { title, subtitle, link, isActive, sortOrder } = req.body;

  const data = {
    ...(title && { title }),
    ...(subtitle !== undefined && { subtitle }),
    ...(link !== undefined && { link }),
    ...(isActive !== undefined && { isActive: isActive === 'true' || isActive === true }),
    ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder) }),
  };

  if (req.file) {
    if (banner.publicId) await deleteImage(banner.publicId);
    data.image = req.file.path;
    data.publicId = req.file.filename;
  }

  const updated = await prisma.banner.update({ where: { id: req.params.id }, data });
  res.json({ message: 'Banner updated successfully', banner: updated });
};

// Admin: Delete banner
const deleteBanner = async (req, res) => {
  const banner = await prisma.banner.findUnique({ where: { id: req.params.id } });
  if (!banner) return res.status(404).json({ message: 'Banner not found' });

  if (banner.publicId) await deleteImage(banner.publicId);
  await prisma.banner.delete({ where: { id: req.params.id } });
  res.json({ message: 'Banner deleted successfully' });
};

module.exports = { getBanners, getAllBanners, createBanner, updateBanner, deleteBanner };
