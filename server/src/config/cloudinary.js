const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for product images
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'marketplace/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

// Storage for shop logos/banners
const shopStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'marketplace/shops',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit', quality: 'auto' }],
  },
});

// Storage for banners
const bannerStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'marketplace/banners',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 400, crop: 'fill', quality: 'auto' }],
  },
});

// Storage for avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'marketplace/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 200, height: 200, crop: 'fill', quality: 'auto' }],
  },
});

const uploadProduct = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadShop = multer({
  storage: shopStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadBanner = multer({
  storage: bannerStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
});

const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

module.exports = {
  cloudinary,
  uploadProduct,
  uploadShop,
  uploadBanner,
  uploadAvatar,
  deleteImage,
};
