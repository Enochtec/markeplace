import { useEffect, useState } from 'react';
import { Search, Star, Trash2 } from 'lucide-react';
import type { Product, PaginationMeta } from '../../types';
import { productsApi } from '../../api/products';
import { formatPrice } from '../../utils/format';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchProducts = () => {
    setLoading(true);
    productsApi.getAllAdmin({ page, limit: 15, search })
      .then(({ data }) => { setProducts(data.products); setMeta(data.meta); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const handleToggleFeatured = async (id: string, name: string) => {
    try {
      await productsApi.toggleFeatured(id);
      toast.success(`"${name}" featured status toggled`);
      fetchProducts();
    } catch { toast.error('Failed to toggle featured'); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete product "${name}"?`)) return;
    try { await productsApi.delete(id); toast.success('Product deleted'); fetchProducts(); }
    catch { toast.error('Failed to delete product'); }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-800">All Products</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Product', 'Shop', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => {
                  const img = (product as unknown as { images?: { url: string }[] }).images?.[0];
                  const category = (product as unknown as { category?: { name: string } }).category;
                  const shop = (product as unknown as { shop?: { name: string } }).shop;
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            {img && <img src={img.url} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <p className="text-sm font-semibold text-gray-800 line-clamp-1 max-w-[160px]">{product.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{shop?.name || '—'}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{category?.name || '—'}</td>
                      <td className="px-5 py-4 text-sm font-bold text-gray-900">{formatPrice(product.price)}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{product.stock}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${product.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {product.isFeatured && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 w-fit flex items-center gap-1">
                              <Star size={10} className="fill-orange-500" /> Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleToggleFeatured(product.id, product.name)}
                            title={product.isFeatured ? 'Unfeature' : 'Feature'}
                            className={`p-1.5 rounded-lg transition-colors ${product.isFeatured ? 'text-orange-500 bg-orange-50 hover:bg-orange-100' : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'}`}>
                            <Star size={15} className={product.isFeatured ? 'fill-orange-500' : ''} />
                          </button>
                          <button onClick={() => handleDelete(product.id, product.name)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {meta && <div className="px-5 py-3 border-t border-gray-50"><Pagination meta={meta} onPageChange={setPage} /></div>}
        </div>
      )}
    </div>
  );
}
