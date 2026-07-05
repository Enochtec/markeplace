import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, X, Tag } from 'lucide-react';
import type { Category } from '../../types';
import { categoriesApi } from '../../api/categories';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface CatForm { name: string; description?: string; parentId?: string; sortOrder?: number; isActive: boolean; }

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CatForm>({ defaultValues: { isActive: true } });

  const fetchCategories = () => {
    setLoading(true);
    categoriesApi.getAllAdmin()
      .then(({ data }) => setCategories(data.categories))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => { setEditing(null); reset({ isActive: true }); setIconFile(null); setShowModal(true); };
  const openEdit = (cat: Category) => {
    setEditing(cat);
    setValue('name', cat.name);
    setValue('description', cat.description || '');
    setValue('parentId', cat.parentId || '');
    setValue('sortOrder', cat.sortOrder);
    setValue('isActive', cat.isActive);
    setIconFile(null);
    setShowModal(true);
  };

  const onSubmit = async (data: CatForm) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== '') fd.append(k, String(v)); });
      if (iconFile) fd.append('icon', iconFile);
      if (editing) {
        await categoriesApi.update(editing.id, fd);
        toast.success('Category updated');
      } else {
        await categoriesApi.create(fd);
        toast.success('Category created');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try { await categoriesApi.delete(id); toast.success('Category deleted'); fetchCategories(); }
    catch { toast.error('Failed to delete category'); }
  };

  const topLevel = categories.filter(c => !c.parentId);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Categories</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-colors">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {loading ? <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div> : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Category', 'Parent', 'Products', 'Sort', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                        {cat.image ? <img src={cat.image} alt="" className="w-full h-full object-cover rounded-lg" /> : <Tag size={14} className="text-orange-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{cat.name}</p>
                        <p className="text-xs text-gray-400">{cat.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {cat.parentId ? categories.find(c => c.id === cat.parentId)?.name || '—' : <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">Root</span>}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{cat._count?.products || 0}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{cat.sortOrder}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cat.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(cat)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">{editing ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                <input {...register('name', { required: 'Required' })} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea {...register('description')} rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Parent Category</label>
                <select {...register('parentId')} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white">
                  <option value="">None (Root Category)</option>
                  {topLevel.filter(c => c.id !== editing?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Image / Icon</label>
                <input type="file" accept="image/*" onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100" />
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
