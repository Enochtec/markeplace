import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';
import type { Banner } from '../../types';
import { bannersApi } from '../../api/banners';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface BannerForm { title: string; subtitle?: string; link?: string; sortOrder?: number; isActive: boolean; }

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<BannerForm>({ defaultValues: { isActive: true } });

  const fetchBanners = () => {
    setLoading(true);
    bannersApi.getAllAdmin()
      .then(({ data }) => setBanners(data.banners))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBanners(); }, []);

  const openAdd = () => { setEditing(null); reset({ isActive: true }); setImageFile(null); setShowModal(true); };
  const openEdit = (b: Banner) => {
    setEditing(b);
    setValue('title', b.title);
    setValue('subtitle', b.subtitle || '');
    setValue('link', b.link || '');
    setValue('sortOrder', b.sortOrder);
    setValue('isActive', b.isActive);
    setImageFile(null);
    setShowModal(true);
  };

  const onSubmit = async (data: BannerForm) => {
    if (!editing && !imageFile) return toast.error('Please upload a banner image');
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== '') fd.append(k, String(v)); });
      if (imageFile) fd.append('image', imageFile);
      if (editing) {
        await bannersApi.update(editing.id, fd);
        toast.success('Banner updated');
      } else {
        await bannersApi.create(fd);
        toast.success('Banner created');
      }
      setShowModal(false);
      fetchBanners();
    } catch { toast.error('Failed to save banner'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete banner "${title}"?`)) return;
    try { await bannersApi.delete(id); toast.success('Deleted'); fetchBanners(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Banners</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-colors">
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {loading ? <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow">
              <div className="relative h-40 bg-gray-100">
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                {!banner.isActive && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-white text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">Inactive</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-gray-800 text-sm">{banner.title}</h4>
                {banner.subtitle && <p className="text-xs text-gray-500 mt-0.5">{banner.subtitle}</p>}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400">Sort: {banner.sortOrder}</span>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(banner)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(banner.id, banner.title)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {banners.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-400">
              <p>No banners yet. Add your first banner!</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">{editing ? 'Edit Banner' : 'Add Banner'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                <input {...register('title', { required: 'Required' })} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subtitle</label>
                <input {...register('subtitle')} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Link URL</label>
                <input {...register('link')} placeholder="https://..." className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort Order</label>
                  <input type="number" {...register('sortOrder')} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('isActive')} className="accent-orange-500 w-4 h-4" />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Banner Image {!editing && '*'}</label>
                <label className="flex flex-col items-center justify-center gap-2 h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
                  <Upload size={20} className="text-gray-400" />
                  <span className="text-xs text-gray-500">{imageFile ? imageFile.name : 'Click to upload image'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl text-sm">
                  {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
