import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import type { Product, Category, PaginationMeta } from '../../types';
import { productsApi } from '../../api/products';
import { categoriesApi } from '../../api/categories';
import ProductCard from '../../components/common/ProductCard';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const featured = searchParams.get('featured') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  useEffect(() => {
    categoriesApi.getAll().then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await productsApi.getAll({ search, category, sort, featured, minPrice, maxPrice, page, limit: 16 });
        setProducts(data.products);
        setMeta(data.meta);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, category, sort, featured, minPrice, maxPrice, page]);

  const clearFilters = () => setSearchParams({});

  const activeFilters = [
    search && { key: 'search', label: `"${search}"` },
    category && { key: 'category', label: categories.find(c => c.slug === category)?.name || category },
    minPrice && { key: 'minPrice', label: `Min $${minPrice}` },
    maxPrice && { key: 'maxPrice', label: `Max $${maxPrice}` },
    featured && { key: 'featured', label: 'Featured' },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar filters */}
        <aside className={`lg:w-60 flex-shrink-0 ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Filters</h3>
              {activeFilters.length > 0 && (
                <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">Clear all</button>
              )}
            </div>

            {/* Categories */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Categories</p>
              <div className="space-y-1">
                <button onClick={() => updateParam('category', '')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${!category ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button key={cat.id} onClick={() => updateParam('category', cat.slug)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm flex items-center justify-between transition-colors ${category === cat.slug ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <span>{cat.name}</span>
                    <span className="text-xs text-gray-400">({cat._count?.products || 0})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Price Range</p>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={minPrice}
                  onChange={(e) => updateParam('minPrice', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400" />
                <input type="number" placeholder="Max" value={maxPrice}
                  onChange={(e) => updateParam('maxPrice', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400" />
              </div>
            </div>

            {/* Featured */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={featured === 'true'}
                  onChange={(e) => updateParam('featured', e.target.checked ? 'true' : '')}
                  className="accent-orange-500 w-4 h-4 rounded" />
                <span className="text-sm text-gray-700">Featured only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {search ? `Results for "${search}"` : category ? categories.find(c => c.slug === category)?.name || 'Products' : 'All Products'}
              </h1>
              {meta && <p className="text-sm text-gray-500 mt-0.5">{meta.total} products found</p>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setFiltersOpen(!filtersOpen)} className="lg:hidden flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">
                <SlidersHorizontal size={16} /> Filters
              </button>
              <select value={sort} onChange={(e) => updateParam('sort', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 bg-white">
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Active filter pills */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activeFilters.map((f) => (
                <span key={f.key} className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 text-xs font-medium rounded-full border border-orange-100">
                  {f.label}
                  <button onClick={() => updateParam(f.key, '')}><X size={12} /></button>
                </span>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
              <div className="text-5xl mb-4 text-gray-300">
                <SlidersHorizontal size={48} />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">No products found</h3>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search term</p>
              <button onClick={clearFilters} className="mt-4 px-5 py-2 bg-orange-500 text-white text-sm rounded-xl hover:bg-orange-600 transition-colors">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              {meta && <Pagination meta={meta} onPageChange={(p) => updateParam('page', String(p))} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
