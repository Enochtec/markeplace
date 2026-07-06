import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Camera, Store } from 'lucide-react';
import { shopsApi } from '../../api/shops';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface ShopForm {
  name: string;
  description?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export default function ShopProfile() {
  const [shop, setShop] = useState<{ name: string; description?: string; email: string; phone?: string; address?: string; city?: string; country?: string; logo?: string; banner?: string; status: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ShopForm>();

  const fetchShop = () => {
    shopsApi.getMyShop()
      .then(({ data }) => { setShop(data.shop); reset(data.shop); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchShop(); }, []);

  const onSubmit = async (data: ShopForm) => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v) formData.append(k, v); });
      await shopsApi.updateMyShop(formData);
      await fetchShop();
      toast.success('Shop profile updated!');
    } catch {
      toast.error('Failed to update shop');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !shop) return;
    const formData = new FormData();
    formData.append('logo', file);
    try {
      await shopsApi.updateMyShop(formData);
      await fetchShop();
      toast.success('Logo updated!');
    } catch { toast.error('Failed to update logo'); }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!shop) return <div className="text-center py-10 text-gray-400">Could not load shop</div>;

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-xl font-bold text-gray-800">Shop Profile</h1>

      {/* Logo */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Shop Identity</h3>
        <div className="flex items-center gap-5">
          <div className="relative">
            {shop.logo ? (
              <img src={shop.logo} alt="" className="w-20 h-20 rounded-2xl object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-500">
                <Store size={32} />
              </div>
            )}
            <label className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors">
              <Camera size={13} className="text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </label>
          </div>
          <div>
            <p className="font-semibold text-gray-800">{shop.name}</p>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${shop.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
              {shop.status}
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-800 mb-5">Shop Details</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Shop Name *</label>
              <input {...register('name', { required: 'Required' })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea {...register('description')} rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
                placeholder="Describe your shop..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
              <input type="email" {...register('email', { required: 'Required' })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input {...register('phone')} type="tel"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
              <input {...register('address')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
              <input {...register('city')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
              <input {...register('country')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="px-7 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl text-sm transition-colors">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
