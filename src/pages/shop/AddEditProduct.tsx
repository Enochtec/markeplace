import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Upload, X, ArrowLeft } from 'lucide-react';
import type { Category } from '../../types';
import { productsApi } from '../../api/products';
import { categoriesApi } from '../../api/categories';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface ProductForm {
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  sku?: string;
  stock: number;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  tags?: string;
}

export default function AddEditProduct() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: string; url: string; isPrimary: boolean }[]>([]);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(isEdit);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductForm>({
    defaultValues: { isActive: true, isFeatured: false, stock: 0 },
  });

  useEffect(() => {
    categoriesApi.getAll().then(({ data }) => setCategories(data.categories));
    if (isEdit) {
      productsApi.getById(id!)
        .then(({ data }) => {
          const p = data.product;
          reset({
            name: p.name, description: p.description, price: p.price,
            comparePrice: p.comparePrice || undefined, sku: p.sku || '',
            stock: p.stock, categoryId: p.categoryId, isActive: p.isActive,
            isFeatured: p.isFeatured, tags: p.tags?.join(', ') || '',
          });
          setExistingImages(p.images || []);
        })
        .finally(() => setInitLoading(false));
    }
  }, [id, isEdit, reset]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (selectedFiles.length + files.length > 5) return toast.error('Max 5 images');
    setSelectedFiles((prev) => [...prev, ...files]);
    setPreviewUrls((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeSelectedFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: string) => {
    try {
      await productsApi.deleteImage(imageId);
      setExistingImages((prev) => prev.filter((i) => i.id !== imageId));
      toast.success('Image removed');
    } catch {
      toast.error('Failed to remove image');
    }
  };

  const onSubmit = async (data: ProductForm) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') formData.append(k, String(v));
      });
      selectedFiles.forEach((file) => formData.append('images', file));

      if (isEdit) {
        await productsApi.update(id!, formData);
        toast.success('Product updated!');
      } else {
        await productsApi.create(formData);
        toast.success('Product created!');
      }
      navigate('/shop/products');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save product';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/shop/products')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Basic Information</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
            <input {...register('name', { required: 'Required' })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              placeholder="Enter product name" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
            <textarea {...register('description', { required: 'Required' })} rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
              placeholder="Describe your product..." />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
            <select {...register('categoryId', { required: 'Required' })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
          </div>
        </div>

        {/* Pricing & inventory */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Pricing & Inventory</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Price ($) *</label>
              <input type="number" step="0.01" min="0" {...register('price', { required: 'Required', min: { value: 0.01, message: 'Must be > 0' } })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Compare Price ($)</label>
              <input type="number" step="0.01" min="0" {...register('comparePrice')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                placeholder="Original price" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock *</label>
              <input type="number" min="0" {...register('stock', { required: 'Required', min: { value: 0, message: 'Must be ≥ 0' } })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU</label>
              <input {...register('sku')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                placeholder="Product SKU" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma-separated)</label>
            <input {...register('tags')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              placeholder="e.g. electronics, smartphone, android" />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isActive')} className="accent-orange-500 w-4 h-4" />
              <span className="text-sm text-gray-700">Active (visible to customers)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isFeatured')} className="accent-orange-500 w-4 h-4" />
              <span className="text-sm text-gray-700">Mark as featured</span>
            </label>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Product Images</h3>

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {existingImages.map((img) => (
                <div key={img.id} className="relative w-20 h-20">
                  <img src={img.url} alt="" className="w-full h-full object-cover rounded-xl" />
                  {img.isPrimary && <span className="absolute top-0.5 left-0.5 bg-orange-500 text-white text-xs px-1 rounded">Main</span>}
                  <button type="button" onClick={() => removeExistingImage(img.id)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New image previews */}
          {previewUrls.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {previewUrls.map((url, i) => (
                <div key={url} className="relative w-20 h-20">
                  <img src={url} alt="" className="w-full h-full object-cover rounded-xl" />
                  <button type="button" onClick={() => removeSelectedFile(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload area */}
          {selectedFiles.length + existingImages.length < 5 && (
            <label className="flex flex-col items-center justify-center gap-2 w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
              <Upload size={24} className="text-gray-400" />
              <span className="text-sm text-gray-500">Click to upload images (max 5)</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
            </label>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="flex-1 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold rounded-xl transition-colors">
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" onClick={() => navigate('/shop/products')}
            className="px-6 py-3.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
