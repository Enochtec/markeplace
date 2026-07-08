import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, Headphones, BadgePercent, ChevronRight, ArrowRight, ShoppingBag, ImageIcon } from 'lucide-react';
import type { Product, Category, Shop, Banner } from '../../types';
import { productsApi } from '../../api/products';
import { categoriesApi } from '../../api/categories';
import { shopsApi } from '../../api/shops';
import { bannersApi } from '../../api/banners';
import ProductCard from '../../components/common/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TRUST_ITEMS = [
  { icon: Truck,        title: 'Free Delivery',   desc: 'On orders over $50' },
  { icon: ShieldCheck,  title: 'Secure Payments', desc: '256-bit SSL encryption' },
  { icon: Headphones,   title: '24/7 Support',    desc: 'Always here to help' },
  { icon: BadgePercent, title: 'Best Prices',     desc: 'Price match guarantee' },
];

function SectionHeader({ title, to }: { title: string; to: string }) {
  return (
    <div className="flex items-center justify-between mb-4 pb-2.5 border-b-2 border-gray-200">
      <div className="flex items-center gap-2.5">
        <span className="w-1 h-5 bg-orange-500 rounded-sm flex-shrink-0" />
        <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">{title}</h2>
      </div>
      <Link to={to} className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors">
        See All <ChevronRight size={13} />
      </Link>
    </div>
  );
}

function CountdownBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="w-9 h-9 bg-gray-900 text-white text-base font-bold rounded flex items-center justify-center leading-none">
        {value}
      </span>
      <span className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-wide">{label}</span>
    </div>
  );
}

export default function Home() {
  const [banners, setBanners]             = useState<Banner[]>([]);
  const [featuredProducts, setFeatured]   = useState<Product[]>([]);
  const [latestProducts, setLatest]       = useState<Product[]>([]);
  const [categories, setCategories]       = useState<Category[]>([]);
  const [popularShops, setPopularShops]   = useState<Shop[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading]             = useState(true);
  const [timeLeft, setTimeLeft]           = useState({ h: '00', m: '00', s: '00' });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(); end.setHours(23, 59, 59, 999);
      const diff = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
      setTimeLeft({
        h: String(Math.floor(diff / 3600)).padStart(2, '0'),
        m: String(Math.floor((diff % 3600) / 60)).padStart(2, '0'),
        s: String(diff % 60).padStart(2, '0'),
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 8000);
    Promise.allSettled([
      bannersApi.get(),
      productsApi.getFeatured(8),
      productsApi.getLatest(8),
      categoriesApi.getAll({ parentOnly: true }),
      shopsApi.getPopular(),
    ]).then(([bannersRes, featuredRes, latestRes, catsRes, shopsRes]) => {
      if (bannersRes.status === 'fulfilled') setBanners(bannersRes.value.data.banners);
      if (featuredRes.status === 'fulfilled') setFeatured(featuredRes.value.data.products);
      if (latestRes.status === 'fulfilled')   setLatest(latestRes.value.data.products);
      if (catsRes.status === 'fulfilled')     setCategories(catsRes.value.data.categories);
      if (shopsRes.status === 'fulfilled')    setPopularShops(shopsRes.value.data.shops);
    }).finally(() => { setLoading(false); clearTimeout(timeout); });
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setCurrentBanner(p => (p + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners]);

  if (loading) return <LoadingSpinner fullScreen />;

  const heroBanner  = banners[currentBanner];
  const flashDeals  = [...featuredProducts, ...latestProducts].filter(p => p.comparePrice && p.comparePrice > p.price).slice(0, 4);

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* ── HERO BANNER ── */}
      <div className="bg-white mb-2">
        {heroBanner ? (
          <div className="relative h-[220px] sm:h-[320px] md:h-[420px] overflow-hidden">
            <img src={heroBanner.image} alt={heroBanner.title}
              className="w-full h-full object-cover" loading="eager" />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center">
              <div className="page-container w-full">
                <div className="max-w-lg">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
                    {heroBanner.title}
                  </h1>
                  {heroBanner.subtitle && (
                    <p className="text-white/80 mt-2 text-sm md:text-base max-w-sm">{heroBanner.subtitle}</p>
                  )}
                  <Link to={heroBanner.link || '/products'}
                    className="inline-flex items-center gap-2 mt-5 btn-primary !px-6 !py-2.5">
                    Shop Now <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
            {banners.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {banners.map((_, i) => (
                  <button key={i} onClick={() => setCurrentBanner(i)}
                    className={`h-1.5 rounded-full transition-all ${i === currentBanner ? 'w-6 bg-orange-400' : 'w-1.5 bg-white/50'}`} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-[220px] sm:h-[300px] md:h-[380px] overflow-hidden bg-gray-900">
            <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1920&q=80"
              alt="Shop Now" className="w-full h-full object-cover opacity-40" loading="eager" />
            <div className="absolute inset-0 flex items-center">
              <div className="page-container w-full">
                <div className="max-w-md">
                  <p className="text-orange-400 text-sm font-semibold uppercase tracking-wider mb-2">New Arrivals Every Day</p>
                  <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
                    Discover<br />Thousands of Products
                  </h1>
                  <p className="text-gray-300 mt-3 text-sm max-w-xs">
                    From verified sellers. Unbeatable prices, fast delivery, easy returns.
                  </p>
                  <div className="flex gap-3 mt-6">
                    <Link to="/products" className="btn-primary !px-6 !py-2.5">
                      <ShoppingBag size={16} /> Start Shopping
                    </Link>
                    <Link to="/products?featured=true"
                      className="inline-flex items-center gap-2 px-6 py-2.5 border border-white/30 hover:border-white/60 text-white text-sm font-medium transition-colors">
                      View Deals
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── TRUST BAR ── */}
      <div className="bg-white border-y border-gray-200 mb-3">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
            {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 px-4 py-4">
                <Icon size={22} className="text-orange-500 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container space-y-4 pb-8">

        {/* ── FLASH DEALS ── */}
        {flashDeals.length > 0 && (
          <div className="bg-white border border-gray-200 p-5">
            <div className="flex items-center gap-4 mb-4 pb-2.5 border-b-2 border-gray-200">
              <div className="flex items-center gap-2.5">
                <span className="w-1 h-5 bg-red-500 rounded-sm flex-shrink-0" />
                <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">Flash Deals</h2>
              </div>
              <div className="flex items-center gap-1.5 ml-1">
                <span className="text-xs text-gray-500 font-medium">Ends in</span>
                <CountdownBox value={timeLeft.h} label="hrs" />
                <span className="text-gray-400 font-bold text-sm leading-none mb-3">:</span>
                <CountdownBox value={timeLeft.m} label="min" />
                <span className="text-gray-400 font-bold text-sm leading-none mb-3">:</span>
                <CountdownBox value={timeLeft.s} label="sec" />
              </div>
              <Link to="/products?featured=true" className="ml-auto flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                See All <ChevronRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {flashDeals.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

        {/* ── CATEGORIES ── */}
        {categories.length > 0 && (
          <div className="bg-white border border-gray-200 p-5">
            <SectionHeader title="Shop by Category" to="/products" />
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {categories.slice(0, 8).map(cat => (
                <Link key={cat.id} to={`/products?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-2 p-2 hover:bg-gray-50 rounded transition-colors">
                  <div className="w-14 h-14 border border-gray-200 rounded overflow-hidden bg-gray-50 flex-shrink-0">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={20} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-gray-700 group-hover:text-orange-500 text-center line-clamp-1 transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── FEATURED PRODUCTS ── */}
        {featuredProducts.length > 0 && (
          <div className="bg-white border border-gray-200 p-5">
            <SectionHeader title="Featured Products" to="/products?featured=true" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {featuredProducts.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

        {/* ── PROMO BANNERS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative h-40 overflow-hidden bg-gray-900">
            <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"
              alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" loading="lazy" />
            <div className="relative h-full flex flex-col justify-between p-5">
              <p className="text-orange-300 text-xs font-bold uppercase tracking-wider">Limited Offer</p>
              <div>
                <h3 className="text-xl font-bold text-white leading-tight">New Electronics<br />Up to 30% Off</h3>
                <Link to="/products?category=electronics"
                  className="inline-flex items-center gap-1.5 mt-2.5 text-sm font-semibold text-white hover:text-orange-300 transition-colors">
                  Shop Now <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
          <div className="relative h-40 overflow-hidden bg-orange-600">
            <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"
              alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" loading="lazy" />
            <div className="relative h-full flex flex-col justify-between p-5">
              <p className="text-orange-100 text-xs font-bold uppercase tracking-wider">Flash Sale</p>
              <div>
                <h3 className="text-xl font-bold text-white leading-tight">Fashion Deals<br />Buy 2 Get 1 Free</h3>
                <Link to="/products?category=fashion"
                  className="inline-flex items-center gap-1.5 mt-2.5 text-sm font-semibold text-white hover:text-orange-100 transition-colors">
                  Shop Now <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── NEW ARRIVALS ── */}
        {latestProducts.length > 0 && (
          <div className="bg-white border border-gray-200 p-5">
            <SectionHeader title="New Arrivals" to="/products" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {latestProducts.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

        {/* ── POPULAR SHOPS ── */}
        {popularShops.length > 0 && (
          <div className="bg-white border border-gray-200 p-5">
            <SectionHeader title="Popular Shops" to="/products" />
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {popularShops.slice(0, 6).map(shop => (
                <Link key={shop.id} to={`/products?shop=${shop.slug}`}
                  className="group flex flex-col items-center gap-2 p-3 border border-gray-200 hover:border-orange-300 bg-white rounded transition-colors">
                  <div className="w-14 h-14 border border-gray-200 rounded overflow-hidden bg-gray-50">
                    {shop.logo ? (
                      <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={18} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-900 line-clamp-1 group-hover:text-orange-500 transition-colors">{shop.name}</p>
                    <p className="text-[10px] text-gray-400">{shop._count?.products || 0} products</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── NEWSLETTER ── */}
        <div className="bg-gray-900 p-8 text-center">
          <h2 className="text-lg font-bold text-white mb-1.5">Stay Updated with Latest Deals</h2>
          <p className="text-gray-400 text-sm mb-5">Get exclusive offers and new arrivals delivered to your inbox</p>
          <form className="max-w-md mx-auto flex gap-2" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="Enter your email address"
              className="flex-1 px-4 py-2.5 text-sm bg-white border-0 rounded focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <button type="submit" className="btn-primary flex-shrink-0 !px-5">Subscribe</button>
          </form>
        </div>

        {/* ── SELLER CTA ── */}
        <div className="bg-white border border-gray-200 p-6 flex flex-col md:flex-row items-center justify-between gap-5">
          <div>
            <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">For Sellers</p>
            <h2 className="text-lg font-bold text-gray-900">Ready to grow your business?</h2>
            <p className="text-sm text-gray-500 mt-1 max-w-md">
              Join 500+ sellers on Markethub. Set up your shop in minutes and reach thousands of customers.
            </p>
          </div>
          <Link to="/contact" className="btn-primary flex-shrink-0 whitespace-nowrap">
            Start Selling Today <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </div>
  );
}
