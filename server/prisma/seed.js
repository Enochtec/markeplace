const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPwd = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@markethub.com' },
    update: {},
    create: {
      email: 'admin@markethub.com',
      password: adminPwd,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
      isVerified: true,
    },
  });
  console.log('Admin created:', admin.email);

  // Create customer
  const custPwd = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: custPwd,
      firstName: 'John',
      lastName: 'Doe',
      role: 'CUSTOMER',
      isActive: true,
      isVerified: true,
    },
  });
  console.log('Customer created:', customer.email);

  // Create shop owners
  const ownerPwd = await bcrypt.hash('shop123', 10);
  const owner1 = await prisma.user.upsert({
    where: { email: 'seller1@example.com' },
    update: {},
    create: {
      email: 'seller1@example.com',
      password: ownerPwd,
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'SHOP_OWNER',
      isActive: true,
      isVerified: true,
    },
  });
  console.log('Shop owner 1 created:', owner1.email);

  const owner2 = await prisma.user.upsert({
    where: { email: 'seller2@example.com' },
    update: {},
    create: {
      email: 'seller2@example.com',
      password: ownerPwd,
      firstName: 'Mike',
      lastName: 'Johnson',
      role: 'SHOP_OWNER',
      isActive: true,
      isVerified: true,
    },
  });
  console.log('Shop owner 2 created:', owner2.email);

  // Create shops
  const shop = await prisma.shop.upsert({
    where: { slug: 'tech-hub-store' },
    update: {},
    create: {
      name: 'Tech Hub Store',
      slug: 'tech-hub-store',
      description: 'Your one-stop shop for the latest electronics and gadgets.',
      email: 'info@techhub.com',
      phone: '+1 (555) 123-4567',
      address: '123 Tech Street',
      city: 'San Francisco',
      country: 'USA',
      status: 'ACTIVE',
      ownerId: owner1.id,
    },
  });
  console.log('Shop created:', shop.name);

  const shop2 = await prisma.shop.upsert({
    where: { slug: 'fashion-forward' },
    update: {},
    create: {
      name: 'Fashion Forward',
      slug: 'fashion-forward',
      description: 'Trendy fashion and accessories for every style.',
      email: 'hello@fashionforward.com',
      phone: '+1 (555) 987-6543',
      address: '456 Style Ave',
      city: 'New York',
      country: 'USA',
      status: 'ACTIVE',
      ownerId: owner2.id,
    },
  });
  console.log('Shop 2 created:', shop2.name);

  // Create categories
  const cats = [
    { name: 'Electronics', slug: 'electronics', description: 'Latest gadgets & devices' },
    { name: 'Fashion', slug: 'fashion', description: 'Trendy clothing & accessories' },
    { name: 'Home & Garden', slug: 'home-garden', description: 'Home essentials & decor' },
    { name: 'Sports', slug: 'sports', description: 'Sports equipment & gear' },
    { name: 'Books', slug: 'books', description: 'Books & educational materials' },
  ];
  const createdCats = [];
  for (const cat of cats) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCats.push(c);
  }
  console.log('Categories created:', createdCats.length);

  // Create sample products
  const productData = [
    { name: 'Wireless Headphones', slug: 'wireless-headphones', description: 'Premium wireless headphones with noise cancellation.', price: 79.99, comparePrice: 129.99, stock: 50, isFeatured: true, tags: ['audio', 'wireless', 'headphones'] },
    { name: 'Smart Watch', slug: 'smart-watch', description: 'Feature-packed smartwatch with health tracking.', price: 199.99, comparePrice: 299.99, stock: 30, isFeatured: true, tags: ['wearable', 'fitness', 'smartwatch'] },
    { name: 'USB-C Hub', slug: 'usb-c-hub', description: '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader.', price: 34.99, stock: 100, isFeatured: false, tags: ['accessories', 'usb', 'hub'] },
    { name: 'Cotton T-Shirt', slug: 'cotton-t-shirt', description: 'Comfortable 100% organic cotton t-shirt.', price: 24.99, comparePrice: 34.99, stock: 200, isFeatured: true, tags: ['clothing', 'cotton', 'casual'] },
    { name: 'Denim Jacket', slug: 'denim-jacket', description: 'Classic denim jacket with a modern fit.', price: 89.99, stock: 45, isFeatured: true, tags: ['clothing', 'denim', 'jacket'] },
    { name: 'Running Shoes', slug: 'running-shoes', description: 'Lightweight running shoes with responsive cushioning.', price: 129.99, comparePrice: 169.99, stock: 60, isFeatured: true, tags: ['shoes', 'running', 'sports'] },
    { name: 'Yoga Mat', slug: 'yoga-mat', description: 'Non-slip yoga mat with carrying strap.', price: 29.99, stock: 80, isFeatured: false, tags: ['fitness', 'yoga', 'exercise'] },
    { name: 'Novel: The Last Chapter', slug: 'novel-last-chapter', description: 'A gripping bestseller about mystery and adventure.', price: 14.99, stock: 150, isFeatured: true, tags: ['books', 'fiction', 'bestseller'] },
    { name: 'Cookbook: Easy Meals', slug: 'cookbook-easy-meals', description: 'Quick and delicious recipes for busy weeknights.', price: 19.99, stock: 90, isFeatured: false, tags: ['books', 'cooking', 'recipes'] },
    { name: 'Plant Pot Set', slug: 'plant-pot-set', description: 'Set of 3 ceramic plant pots with drainage.', price: 39.99, stock: 70, isFeatured: true, tags: ['home', 'decor', 'plants'] },
    { name: 'Scented Candle', slug: 'scented-candle', description: 'Soy wax candle with vanilla and lavender scent.', price: 12.99, stock: 120, isFeatured: false, tags: ['home', 'candle', 'decor'] },
    { name: 'Bluetooth Speaker', slug: 'bluetooth-speaker', description: 'Portable waterproof Bluetooth speaker.', price: 49.99, comparePrice: 69.99, stock: 55, isFeatured: false, tags: ['audio', 'bluetooth', 'speaker'] },
  ];

  for (const p of productData) {
    const categorySlug = p.tags.includes('clothing') || p.tags.includes('shoes') ? 'fashion' :
      p.tags.includes('home') || p.tags.includes('candle') || p.tags.includes('plants') ? 'home-garden' :
      p.tags.includes('books') || p.tags.includes('cooking') ? 'books' :
      p.tags.includes('sports') || p.tags.includes('fitness') || p.tags.includes('yoga') ? 'sports' :
      'electronics';
    const cat = createdCats.find(c => c.slug === categorySlug);
    const shopId = Math.random() > 0.5 ? shop.id : shop2.id;

    if (!cat) continue;

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...p,
        categoryId: cat.id,
        shopId,
        images: {
          create: [{
            url: `https://placehold.co/400x400/e2e8f0/64748b?text=${encodeURIComponent(p.name)}`,
            isPrimary: true,
          }],
        },
      },
    });
  }
  console.log('Products created:', productData.length);

  // Create banners
  const bannerData = [
    { title: 'Summer Sale - Up to 50% Off', subtitle: 'Shop the best deals on electronics, fashion & more', link: '/products?category=electronics', sortOrder: 1 },
    { title: 'New Arrivals Every Week', subtitle: 'Discover fresh products from verified sellers', link: '/products', sortOrder: 2 },
    { title: 'Free Shipping on Orders $50+', subtitle: 'Shop with confidence with our fast delivery', link: '/products', sortOrder: 3 },
  ];

  for (const b of bannerData) {
    const existing = await prisma.banner.findFirst({ where: { title: b.title } });
    if (!existing) {
      await prisma.banner.create({
        data: {
          ...b,
          image: `https://placehold.co/1200x400/ea580c/ffffff?text=${encodeURIComponent(b.title)}`,
          isActive: true,
        },
      });
    }
  }
  console.log('Banners created:', bannerData.length);

  console.log('\n✅ Database seeded successfully!');
  console.log('   Admin: admin@markethub.com / admin123');
  console.log('   Customer: customer@example.com / customer123');
  console.log('   Shop Owner: seller@example.com / shop123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
