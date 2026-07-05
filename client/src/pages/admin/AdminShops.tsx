import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, X, CheckCircle, XCircle, Trash2, Eye, Clock } from 'lucide-react';
import type { Shop, PaginationMeta } from '../../types';
import { shopsApi } from '../../api/shops';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface RegisterShopForm {
  ownerFirstName: string; ownerLastName: string; ownerEmail: string;
  ownerPassword: string; ownerPhone?: string;
  shopName: string; shopEmail?: string; shopPhone?: string;
  shopAddress?: string; shopCity?: string; shopCountry?: string; shopDescription?: string;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-50 text-green-600', SUSPENDED: 'bg-red-50 text-red-600', PENDING: 'bg-yellow-50 text-yellow-700',
};

export default function AdminShops() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RegisterShopForm>();

  const fetchShops = () => {
    setLoading(true);
    shopsApi.getAll({ page, limit: 15, search, ...(statusFilter && { status: statusFilter }) })
      .then(({ data }) => { setShops(data.shops); setMeta(data.meta); })
      .finally(() => setLoading(false));
  };

  const fetchPendingCount = () => {
    shopsApi.getAll({ page: 1, limit: 1, status: 'PENDING' })
      .then(({ data }) => setPendingCount(data.meta?.total || 0))
      .catch(() => {});
  };

  useEffect(() => { fetchShops(); }, [page, search, statusFilter]);
  useEffect(() => { fetchPendingCount(); }, []);

  const handleRegister = async (data: RegisterShopForm) => {
    setSubmitting(true);
    try {
      await shopsApi.register(data as unknown as Record<string, unknown>);
      toast.success('Shop registered successfully!');
      setShowModal(false);
      reset();
      fetchShops();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to register shop';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (shopId: string, status: string) => {
    try {
      await shopsApi.updateStatus(shopId, status);
      toast.success(`Shop ${status.toLowerCase()}`);
      fetchShops();
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async (shopId: string, name: string) => {
    if (!confirm(`Delete shop "${name}"? This cannot be undone.`)) return;
    try {
      await shopsApi.delete(shopId);
      toast.success('Shop deleted');
      fetchShops();
    } catch { toast.error('Failed to delete shop'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-800">Shops</h1>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-colors">
          <Plus size={16} /> Register Shop
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search shops..." className="flex-1 min-w-[180px] px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white">
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      {/* Pending approval banner */}
      {pendingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-4 flex items-center gap-3">
          <Clock size={20} className="text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-800">
            <strong>{pendingCount}</strong> shop{pendingCount !== 1 ? 's' : ''} pending approval.{' '}
            <button onClick={() => { setStatusFilter('PENDING'); setPage(1); }}
              className="text-yellow-700 font-semibold underline hover:no-underline">Review now</button>
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Shop', 'Owner', 'Products', 'Orders', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {shops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {shop.logo ? (
                          <img src={shop.logo} alt="" className="w-9 h-9 rounded-xl object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-500">{shop.name[0]}</div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{shop.name}</p>
                          <p className="text-xs text-gray-400">{shop.city || shop.country || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-800">{shop.owner?.firstName} {shop.owner?.lastName}</p>
                      <p className="text-xs text-gray-400">{shop.owner?.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{shop._count?.products || 0}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{shop._count?.orders || 0}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[shop.status]}`}>{shop.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <a href={`/shops/${shop.slug}`} target="_blank" rel="noreferrer"
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Eye size={15} /></a>
                        {shop.status !== 'ACTIVE' && (
                          <button onClick={() => handleStatusChange(shop.id, 'ACTIVE')}
                            className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Activate">
                            <CheckCircle size={15} />
                          </button>
                        )}
                        {shop.status !== 'SUSPENDED' && (
                          <button onClick={() => handleStatusChange(shop.id, 'SUSPENDED')}
                            className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title="Suspend">
                            <XCircle size={15} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(shop.id, shop.name)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && <div className="px-5 py-3 border-t border-gray-50"><Pagination meta={meta} onPageChange={setPage} /></div>}
        </div>
      )}

      {/* Register Shop Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Register New Shop</h2>
              <button onClick={() => { setShowModal(false); reset(); }} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(handleRegister)} className="p-6 space-y-5">
              <div>
                <h4 className="font-semibold text-gray-700 text-sm mb-3 uppercase tracking-wide">Owner Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'ownerFirstName' as const, label: 'First Name', req: true },
                    { name: 'ownerLastName' as const, label: 'Last Name', req: true },
                    { name: 'ownerEmail' as const, label: 'Email', req: true, type: 'email' },
                    { name: 'ownerPassword' as const, label: 'Password', req: true, type: 'password' },
                    { name: 'ownerPhone' as const, label: 'Phone', req: false },
                  ].map(({ name, label, req, type }) => (
                    <div key={name} className={name === 'ownerEmail' || name === 'ownerPassword' ? 'col-span-2 sm:col-span-1' : ''}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{label}{req && ' *'}</label>
                      <input type={type || 'text'} {...register(name, req ? { required: 'Required' } : {})}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400" />
                      {errors[name] && <p className="text-red-500 text-xs mt-0.5">{errors[name]?.message}</p>}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 text-sm mb-3 uppercase tracking-wide">Shop Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'shopName' as const, label: 'Shop Name', req: true, span: true },
                    { name: 'shopEmail' as const, label: 'Shop Email', req: false, type: 'email' },
                    { name: 'shopPhone' as const, label: 'Shop Phone', req: false },
                    { name: 'shopCity' as const, label: 'City', req: false },
                    { name: 'shopCountry' as const, label: 'Country', req: false },
                    { name: 'shopDescription' as const, label: 'Description', req: false, span: true, textarea: true },
                  ].map(({ name, label, req, type, span, textarea }) => (
                    <div key={name} className={span ? 'col-span-2' : ''}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{label}{req && ' *'}</label>
                      {textarea ? (
                        <textarea {...register(name)} rows={2}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 resize-none" />
                      ) : (
                        <input type={type || 'text'} {...register(name, req ? { required: 'Required' } : {})}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400" />
                      )}
                      {errors[name] && <p className="text-red-500 text-xs mt-0.5">{errors[name]?.message}</p>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <div className="col-span-2">
                  <p className="text-xs text-yellow-600 bg-yellow-50 rounded-lg px-3 py-2">
                    New shops are created with PENDING status and must be activated before the owner can log in.
                  </p>
                </div>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl text-sm transition-colors">
                  {submitting ? 'Registering...' : 'Register Shop'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); reset(); }}
                  className="px-5 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
