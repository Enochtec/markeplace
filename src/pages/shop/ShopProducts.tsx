import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Package, ToggleLeft, ToggleRight } from 'lucide-react';
import type { Product, PaginationMeta } from '../../types';
import { productsApi } from '../../api/products';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ShopProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchProducts = () => {
    setLoading(true);
    productsApi.getMine({ page, limit: 15, ...(search && { search }) })
      .then(({ data }) => { setProducts(data.products); setMeta(data.meta); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await productsApi.delete(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-800">My Products</h1>
        <Link to="/shop/products/add"
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-colors">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search products..."
          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Package size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">No products yet. <Link to="/shop/products/add" className="text-orange-500 hover:underline">Add your first product</Link></p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => {
                  const img = (product as unknown as { images?: { url: string }[] }).images?.[0];
                  const category = (product as unknown as { category?: { name: string } }).category;
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            {img ? <img src={img.url} alt="" className="w-full h-full object-cover" /> : <Package size={16} className="text-gray-300 m-auto" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 line-clamp-1 max-w-[180px]">{product.name}</p>
                            {product.sku && <p className="text-xs text-gray-400">SKU: {product.sku}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{category?.name || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-bold text-gray-900">${product.price.toFixed(2)}</span>
                        {product.comparePrice && <span className="text-xs text-gray-400 line-through ml-1">${product.comparePrice.toFixed(2)}</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-sm font-semibold ${product.stock <= 5 ? 'text-red-500' : 'text-gray-800'}`}>{product.stock}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${product.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                          {product.isActive ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Link to={`/shop/products/edit/${product.id}`}
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                            <Pencil size={15} />
                          </Link>
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
