import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import type { Product, Category, Shop, Banner } from '../../types';
import { productsApi } from '../../api/products';
import { categoriesApi } from '../../api/categories';
import { shopsApi } from '../../api/shops';
import { bannersApi } from '../../api/banners';
import ProductCard from '../../components/common/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function Home() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularShops, setPopularShops] = useState<Shop[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => setLoading(false), 8000);

    const fetchAll = async () => {
      try {
        const [bannersRes, featuredRes, latestRes, catsRes, shopsRes] = await Promise.allSettled([
          bannersApi.get(),
          productsApi.getFeatured(8),
          productsApi.getLatest(12),
          categoriesApi.getAll({ parentOnly: true }),
          shopsApi.getPopular(),
        ]);
        if (bannersRes.status === 'fulfilled') setBanners(bannersRes.value.data.banners);
        if (featuredRes.status === 'fulfilled') setFeaturedProducts(featuredRes.value.data.products);
        if (latestRes.status === 'fulfilled') setLatestProducts(latestRes.value.data.products);
        if (catsRes.status === 'fulfilled') setCategories(catsRes.value.data.categories);
        if (shopsRes.status === 'fulfilled') setPopularShops(shopsRes.value.data.shops);
      } catch {
        // handled by allSettled
      } finally {
        setLoading(false);
        clearTimeout(timeout);
      }
    };
    fetchAll();
    return () => { controller.abort(); clearTimeout(timeout); };
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setCurrentBanner((p) => (p + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners]);

  if (loading) return <LoadingSpinner fullScreen />;

  const heroBanner = banners[currentBanner];

  const trustItems = [
    { image: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=80&q=80', title: 'Free Delivery', desc: 'On orders over $50' },
    { image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=80&q=80', title: 'Secure Payment', desc: '100% protected' },
    { image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80', title: '24/7 Support', desc: 'Always here to help' },
    { image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=80&q=80', title: 'Top Rated', desc: '4.8 avg from 50K+ reviews' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1920&q=80)', backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center' }}>
      <div className="bg-white/70 backdrop-blur-xl">
      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        {heroBanner ? (
          <div className="relative h-72 md:h-[460px] lg:h-[520px]">
            <img src={heroBanner.image} alt={heroBanner.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center">
              <div className="page-container w-full">
                <div className="max-w-xl">
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
                    {heroBanner.title}
                  </h1>
                  {heroBanner.subtitle && (
                    <p className="text-white/70 mt-3 text-lg md:text-xl max-w-md">{heroBanner.subtitle}</p>
                  )}
                  <div className="flex gap-3 mt-8">
                    <Link to={heroBanner.link || '/products'} className="btn-primary text-sm !px-7 !py-3.5">
                      Shop Now <ArrowRight size={18} />
                    </Link>
                    <Link to="/products" className="inline-flex items-center px-7 py-3.5 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl backdrop-blur-sm transition-all duration-200 text-sm">
                      Browse All
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            {banners.length > 1 && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, i) => (
                  <button key={i} onClick={() => setCurrentBanner(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${i === currentBanner ? 'w-8 bg-orange-400' : 'w-2 bg-white/50 hover:bg-white/70'}`} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="relative py-20 md:py-28" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1920&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-gray-900/70" />
            <div className="page-container relative z-10 flex flex-col lg:flex-row items-center gap-10">
              <div className="flex-1 text-white">
                <span className="inline-block px-3 py-1 bg-white/15 rounded-full text-sm font-medium mb-5 backdrop-blur-sm">
                  New Arrivals Every Day
                </span>
                <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                  Shop Smart,<br />Save Big
                </h1>
                <p className="mt-4 text-white/70 text-lg max-w-md">
                  Discover thousands of products from verified sellers. Best prices, fast delivery.
                </p>
                <div className="flex gap-3 mt-8">
                  <Link to="/products" className="btn-primary text-sm !px-7 !py-3.5 !bg-white !text-orange-600 hover:!bg-orange-50">
                    <ShoppingBag size={18} /> Start Shopping
                  </Link>
                  <Link to="/products?featured=true" className="inline-flex items-center px-7 py-3.5 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl backdrop-blur-sm transition-all duration-200 text-sm">
                    View Deals
                  </Link>
                </div>
                <div className="flex gap-10 mt-10 text-white/80 text-sm">
                  <div><div className="text-2xl font-bold text-white">10K+</div><div>Products</div></div>
                  <div><div className="text-2xl font-bold text-white">500+</div><div>Shops</div></div>
                  <div><div className="text-2xl font-bold text-white">50K+</div><div>Customers</div></div>
                </div>
              </div>
              <div className="flex-1 hidden lg:flex justify-center">
                <div className="w-80 h-80 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <ShoppingBag size={120} className="text-white/40" />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Trust badges */}
      <div className="border-b border-gray-100 bg-white">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-5">
            {trustItems.map(({ image, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <img src={image} alt={title} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="page-container py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-heading">Shop by Category</h2>
              <p className="section-subtitle">Find what you're looking for</p>
            </div>
            <Link to="/products" className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1 transition-colors">
              See all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {categories.slice(0, 8).map((cat) => (
              <Link key={cat.id} to={`/products?category=${cat.slug}`}
                className="card-hover flex flex-col items-center gap-2 p-4">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-11 h-11 object-cover rounded-xl" />
                ) : (
                  <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center text-base font-bold text-orange-500">
                    {cat.name[0]}
                  </div>
                )}
                <span className="text-xs font-medium text-gray-700 text-center line-clamp-1 group-hover:text-orange-500 transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="page-container pb-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-heading">Featured Products</h2>
              <p className="section-subtitle">Hand-picked by our experts</p>
            </div>
            <Link to="/products?featured=true" className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1 transition-colors">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Shops */}
      {popularShops.length > 0 && (
        <section className="bg-white py-14">
          <div className="page-container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-heading">Popular Shops</h2>
                <p className="section-subtitle">Trusted sellers with great products</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {popularShops.slice(0, 8).map((shop) => (
                <Link key={shop.id} to={`/shops/${shop.slug}`}
                  className="card-hover flex flex-col items-center gap-3 p-6">
                  {shop.logo ? (
                    <img src={shop.logo} alt={shop.name} className="w-16 h-16 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-orange-500">
                      {shop.name[0]}
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{shop.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{shop._count?.products || 0} products</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Products */}
      {latestProducts.length > 0 && (
        <section className="page-container py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-heading">New Arrivals</h2>
              <p className="section-subtitle">Fresh from our sellers</p>
            </div>
            <Link to="/products" className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1 transition-colors">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {latestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative py-16" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1920&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-gray-900/70" />
        <div className="relative max-w-2xl mx-auto text-center text-white px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Ready to start selling?</h2>
          <p className="mt-3 text-white/80 text-lg">Join thousands of sellers on Markethub and reach millions of customers.</p>
          <Link to="/contact" className="btn-primary mt-8 text-sm !px-8 !py-4 !bg-white !text-orange-600 hover:!bg-orange-50">
            Become a Seller <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      </div>
    </div>
  );
}
