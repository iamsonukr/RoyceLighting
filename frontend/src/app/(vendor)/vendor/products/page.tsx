'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Pencil, Trash2, Image as ImageIcon,
  X, Loader2, AlertTriangle, Package,
} from 'lucide-react';
import { vendorApi } from '@/lib/vendorApi';

const EMPTY_FORM = {
  name: '', description: '', costPrice: '', sellingPrice: '',
  retailPrice: '', category: '', totalQuantity: '',
  colors: '', tags: '', materialUsed: '', suitableAges: '',
  brand: '', weight: '',
};

export default function VendorProductsPage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const imageBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

  const { data: products, isLoading } = useQuery({
    queryKey: ['vendor-products'],
    queryFn: async () => {
      const res = await vendorApi.get('/products/vendor/my-products?limit=50');
      return res.data.data;
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['vendor-categories'],
    queryFn: async () => {
      const res = await vendorApi.get('/categories');
      return res.data.data;
    },
  });

  const saveProduct = useMutation({
    mutationFn: async (fd: FormData) => {
      if (editingProduct) {
        return vendorApi.put(`/products/${editingProduct._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      return vendorApi.post('/products', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-products'] });
      qc.invalidateQueries({ queryKey: ['vendor-dashboard'] });
      closeModal();
    },
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => vendorApi.delete(`/products/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-products'] });
      qc.invalidateQueries({ queryKey: ['vendor-dashboard'] });
    },
  });

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ ...EMPTY_FORM });
    setImageFiles([]);
    setImagePreviews([]);
    setModalOpen(true);
  };

  const getProductImages = (product: any) => {
    const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    return images.length ? images : product.image ? [product.image] : [];
  };

  const getImageSrc = (image?: string) => {
    if (!image) return '';
    return image.startsWith('http') || image.startsWith('blob') ? image : `${imageBase}${image}`;
  };

  const openEdit = (p: any) => {
    setEditingProduct(p);
    setForm({
      name: p.name, description: p.description,
      costPrice: p.costPrice, sellingPrice: p.sellingPrice,
      retailPrice: p.retailPrice, category: p.category?._id || p.category || '',
      totalQuantity: p.totalQuantity,
      colors: p.colors?.join(', ') || '',
      tags: p.tags?.join(', ') || '',
      materialUsed: p.materialUsed?.join(', ') || '',
      suitableAges: p.suitableAges || '', brand: p.brand || '', weight: p.weight || '',
    });
    setImagePreviews(getProductImages(p));
    setImageFiles([]);
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditingProduct(null); };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImageFiles(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (['colors', 'tags', 'materialUsed'].includes(k)) {
        fd.append(k, JSON.stringify(String(v).split(',').map((s) => s.trim()).filter(Boolean)));
      } else {
        fd.append(k, String(v));
      }
    });
    imageFiles.forEach((file) => fd.append('images', file));
    saveProduct.mutate(fd);
  };

  const lowStockCount = products?.filter((p: any) => p.totalQuantity <= 5).length || 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Products</h2>
          <p className="text-gray-500 text-sm">{products?.length || 0} products in your store</p>
        </div>
        <button onClick={openAdd} className="btn-vendor flex items-center gap-2">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle size={16} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            {lowStockCount} product(s) have low stock (≤5 units).
          </p>
        </div>
      )}

      {/* Product grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="v-card p-5 animate-pulse">
              <div className="w-full aspect-video bg-gray-100 rounded-lg mb-4" />
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products?.length === 0 ? (
        <div className="v-card p-16 text-center">
          <Package size={48} className="mx-auto text-gray-200 mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-500 text-sm mb-6">Add your first product to start selling.</p>
          <button onClick={openAdd} className="btn-vendor">Add Your First Product</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p: any) => {
            const productImages = getProductImages(p);
            const imgSrc = getImageSrc(productImages[0]);
            const isLowStock = p.totalQuantity <= 5;
            return (
              <div key={p._id} className="v-card overflow-hidden group">
                {/* Image */}
                <div className="relative aspect-video bg-gray-50">
                  {productImages.length ? (
                    <img src={imgSrc} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(p)}
                      className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      <Pencil size={14} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => { if (confirm('Delete this product?')) deleteProduct.mutate(p._id); }}
                      className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                  {isLowStock && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      Low Stock
                    </span>
                  )}
                  {productImages.length > 1 && (
                    <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                      {productImages.length} images
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{p.name}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                      p.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.isActive ? 'Active' : 'Off'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 capitalize mb-3">{p.category?.name || p.category}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900">₹{p.sellingPrice}</span>
                      {p.retailPrice > p.sellingPrice && (
                        <span className="text-xs text-gray-400 line-through ml-2">₹{p.retailPrice}</span>
                      )}
                    </div>
                    <span className={`text-xs font-medium ${isLowStock ? 'text-amber-600' : 'text-gray-500'}`}>
                      {p.totalQuantity} in stock
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={closeModal} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-amber-400 transition-colors"
                >
                  {imagePreviews.length ? (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {imagePreviews.map((preview, index) => (
                        <div key={`${preview}-${index}`} className="relative aspect-square rounded-lg bg-gray-100 overflow-hidden">
                          <img src={getImageSrc(preview)} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                          {index === 0 && (
                            <span className="absolute left-1.5 top-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <ImageIcon size={32} className="mx-auto mb-2" />
                      <p className="text-sm">Click to upload images</p>
                      <p className="text-xs mt-1 text-gray-300">PNG, JPG up to 5MB each</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
                  <input
                    required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. Handcrafted Pearl Earrings"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
                  <textarea
                    required rows={3} value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    placeholder="Describe your product..."
                  />
                </div>

                {[
                  { key: 'costPrice', label: 'Cost Price (₹) *' },
                  { key: 'sellingPrice', label: 'Selling Price (₹) *' },
                  { key: 'retailPrice', label: 'MRP (₹) *' },
                  { key: 'totalQuantity', label: 'Stock Quantity *' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                    <input
                      required type="number" min="0" value={(form as any)[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                ))}

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                  <select
                    value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select category</option>
                    {categoriesData?.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                {[
                  { key: 'colors', label: 'Available Colors (comma-separated)', placeholder: '#ff0000, blue, gold', full: true },
                  { key: 'tags', label: 'Tags (comma-separated)', placeholder: 'handmade, pearl, gift', full: true },
                  { key: 'materialUsed', label: 'Materials (comma-separated)', placeholder: 'silver, gold, thread', full: true },
                  { key: 'brand', label: 'Brand', placeholder: 'Your brand', full: false },
                  { key: 'weight', label: 'Weight', placeholder: '50g', full: false },
                  { key: 'suitableAges', label: 'Suitable Ages', placeholder: '18+', full: false },
                ].map(({ key, label, placeholder, full }) => (
                  <div key={key} className={full ? 'col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                    <input
                      value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button" onClick={closeModal}
                  className="flex-1 border border-gray-200 text-gray-700 font-medium px-4 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={saveProduct.isPending}
                  className="flex-1 btn-vendor flex items-center justify-center gap-2"
                >
                  {saveProduct.isPending && <Loader2 size={15} className="animate-spin" />}
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
