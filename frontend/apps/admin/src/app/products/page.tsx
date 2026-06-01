'use client';

import { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Image as ImageIcon, X, Loader2, Search, GripVertical, Star } from 'lucide-react';
import { adminApi } from '@/lib/api';
import Pagination from '@/components/Pagination';

const EMPTY_FORM = {
  name: '', description: '', costPrice: '', sellingPrice: '', retailPrice: '',
  category: '', totalQuantity: '', colors: '', tags: '', materialUsed: '',
  size: { height: '', width: '' },
  weight: '', isActive: true,
  productId: '', Fineshed: '', LightSource: '', Remark: '',
};

type ImageItem = {
  id: string;
  src: string;
  file?: File;
  existing: boolean;
};

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [primaryImageId, setPrimaryImageId] = useState('');
  const [enableCompression, setEnableCompression] = useState(true);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    setPage(1);
  }, [search, category]);

  useEffect(() => {
    if (imageItems.length && !imageItems.some((item) => item.id === primaryImageId)) {
      setPrimaryImageId(imageItems[0].id);
    }
    if (!imageItems.length && primaryImageId) {
      setPrimaryImageId('');
    }
  }, [imageItems, primaryImageId]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, category, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (category) params.set('category', category);
      if (search) params.set('search', search);
      const res = await adminApi.get(`/products/admin/all?${params.toString()}`);
      return res.data.data;
    },
  });

  // categories for select
  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await adminApi.get('/categories/admin/all');
      return res.data.data;
    },
  });

  const saveProduct = useMutation({
    mutationFn: async (fd: FormData) => {
      if (editingProduct) {
        return adminApi.put(`/products/${editingProduct._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      return adminApi.post('/products', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      closeModal();
    },
    onError: (error: any) => {
      setFormError(error?.response?.data?.message || 'Unable to save product. Please check the fields and try again.');
    },
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => adminApi.delete(`/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ ...EMPTY_FORM });
    setImageItems([]);
    setPrimaryImageId('');
    setEnableCompression(true);
    setFormError('');
    setModalOpen(true);
  };

  const getProductImages = (product: any) => {
    if (Array.isArray(product.imageAssets) && product.imageAssets.length) {
      return [...product.imageAssets]
        .sort((a: any, b: any) => Number(a.order || 0) - Number(b.order || 0))
        .map((asset: any) => asset.webpUrl || asset.url)
        .filter(Boolean);
    }
    const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    const primary = product.primaryImage || product.image;
    return images.length ? [...new Set([primary, ...images].filter(Boolean))] : primary ? [primary] : [];
  };

  const getImageSrc = (image?: string) => {
    if (!image) return '';
    return image.startsWith('http') || image.startsWith('blob') ? image : `${imageBase}${image}`;
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    setForm({
      name: product.name, description: product.description,
      costPrice: product.costPrice, sellingPrice: product.sellingPrice,
      retailPrice: product.retailPrice, category: product.category?._id || product.category || '',
      totalQuantity: product.totalQuantity,
      colors: product.colors?.join(', ') || '',
      tags: product.tags?.join(', ') || '',
      materialUsed: product.materialUsed?.join(', ') || product.material?.join(', ') || '',
      size: product.size || product.dimension || { height: '', width: '' },
      weight: product.weight || '', isActive: product.isActive,
      productId: product.productId || '', Fineshed: product.Fineshed || '', LightSource: product.LightSource || '', Remark: product.Remark || '',
    });
    const nextImages = getProductImages(product).map((src: string) => ({
      id: src,
      src,
      existing: true,
    }));
    setImageItems(nextImages);
    setPrimaryImageId(
      nextImages.find((item) => item.src === (product.primaryImage || product.image))?.id ||
      nextImages[0]?.id ||
      '',
    );
    setEnableCompression(true);
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    imageItems.forEach((item) => {
      if (!item.existing && item.src.startsWith('blob:')) URL.revokeObjectURL(item.src);
    });
    setModalOpen(false);
    setEditingProduct(null);
    setFormError('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const nextItems = files.map((file, index) => ({
      id: `new:${Date.now()}:${index}:${file.name}`,
      src: URL.createObjectURL(file),
      file,
      existing: false,
    }));
    setImageItems((current) => {
      const merged = [...current, ...nextItems].slice(0, 8);
      return merged;
    });
    e.target.value = '';
  };

  const removeImage = (id: string) => {
    setImageItems((items) => {
      const removed = items.find((item) => item.id === id);
      if (removed && !removed.existing && removed.src.startsWith('blob:')) URL.revokeObjectURL(removed.src);
      const next = items.filter((item) => item.id !== id);
      if (primaryImageId === id) setPrimaryImageId(next[0]?.id || '');
      return next;
    });
  };

  const moveImage = (fromId: string, toId: string) => {
    setImageItems((items) => {
      const fromIndex = items.findIndex((item) => item.id === fromId);
      const toIndex = items.findIndex((item) => item.id === toId);
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return items;
      const next = [...items];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.category) {
      setFormError('Please select a category.');
      return;
    }
    if (!editingProduct && imageItems.length === 0) {
      setFormError('Please add at least one product image.');
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'colors' || k === 'tags' || k === 'materialUsed') {
        fd.append(k, JSON.stringify(String(v).split(',').map((s) => s.trim()).filter(Boolean)));
      } else if (k === 'size') {
        fd.append(k, JSON.stringify(v));
      } else {
        fd.append(k, String(v));
      }
    });
    const newItems = imageItems.filter((item) => !item.existing && item.file);
    const imageOrder = imageItems.map((item) => (
      item.existing ? item.src : `new:${newItems.findIndex((newItem) => newItem.id === item.id)}`
    ));
    const primaryItem = imageItems.find((item) => item.id === primaryImageId) || imageItems[0];
    const primaryImage = primaryItem
      ? primaryItem.existing
        ? primaryItem.src
        : `new:${newItems.findIndex((newItem) => newItem.id === primaryItem.id)}`
      : '';

    fd.append('enableCompression', String(enableCompression));
    fd.append('existingImages', JSON.stringify(imageItems.filter((item) => item.existing).map((item) => item.src)));
    fd.append('imageOrder', JSON.stringify(imageOrder));
    fd.append('primaryImage', primaryImage);
    newItems.forEach((item) => item.file && fd.append('images', item.file));
    saveProduct.mutate(fd);
  };

  const imageBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace('/api', '');

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Products</h2>
          <p className="text-gray-500 text-sm">{data?.total || 0} products</p>
        </div>
        <button onClick={openAdd} className="btn-admin flex items-center gap-2">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900">
          <option value="">All Categories</option>
          {categoriesData?.map((c: any) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Products table */}
      <div className="admin-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Product', 'Category', 'Price', 'Stock', 'Status', 'Vendor', 'Actions'].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-3 bg-gray-100 rounded animate-pulse w-20" /></td>
                    ))}
                  </tr>
                ))
              : data?.products?.map((p: any) => {
                  const productImages = getProductImages(p);
                  const imgSrc = getImageSrc(productImages[0]);
                  return (
                    <tr key={p._id} className="table-row">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                            {productImages.length
                              ? <img src={imgSrc} alt={p.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={16} /></div>
                            }
                          </div>
                          <div className="min-w-0">
                            <span className="block text-sm font-medium text-gray-900 max-w-[160px] truncate">{p.name}</span>
                            {productImages.length > 1 && (
                              <span className="text-xs text-gray-400">{productImages.length} images</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 capitalize">{p.category?.name || p.category}</td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900">₹{p.sellingPrice}</p>
                        {p.retailPrice > p.sellingPrice && (
                          <p className="text-xs text-gray-400 line-through">₹{p.retailPrice}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-sm font-medium ${p.totalQuantity <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                          {p.totalQuantity}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {p.vendorId ? p.vendorId.shopName || p.vendorId.name : 'Admin'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => { if (confirm('Delete this product?')) deleteProduct.mutate(p._id); }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
        {!isLoading && !data?.products?.length && (
          <p className="text-center text-gray-400 py-16">No products found</p>
        )}
        {!isLoading && data?.total > 0 && (
          <Pagination
            page={data.page || page}
            pages={data.pages || 1}
            total={data.total}
            pageSize={limit}
            itemLabel="products"
            onPageChange={setPage}
            onPageSizeChange={(nextLimit) => {
              setLimit(nextLimit);
              setPage(1);
            }}
          />
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={closeModal} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Image upload */}
              <div>
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <label className="block text-sm font-medium text-gray-700">Product Images</label>
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-600">
                    <input
                      type="checkbox"
                      checked={enableCompression}
                      onChange={(e) => setEnableCompression(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    />
                    Enable Automatic Compression
                  </label>
                </div>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                >
                  {imageItems.length ? (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {imageItems.map((item, index) => (
                        <div
                          key={item.id}
                          draggable
                          onClick={(e) => e.stopPropagation()}
                          onDragStart={() => setDraggedImageId(item.id)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedImageId) moveImage(draggedImageId, item.id);
                            setDraggedImageId(null);
                          }}
                          className={`group relative aspect-square rounded-lg bg-gray-100 overflow-hidden border ${primaryImageId === item.id ? 'border-gray-900 ring-2 ring-gray-900/10' : 'border-gray-200'}`}
                        >
                          <img src={getImageSrc(item.src)} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            className="absolute left-1 top-1 rounded-md bg-white/90 p-1 text-gray-500 shadow-sm cursor-grab"
                            title="Drag to reorder"
                          >
                            <GripVertical size={13} />
                          </button>
                          {primaryImageId === item.id && (
                            <span className="absolute left-1.5 bottom-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                              Primary
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setPrimaryImageId(item.id)}
                            className={`absolute right-1 top-1 rounded-md p-1 shadow-sm ${primaryImageId === item.id ? 'bg-amber-400 text-white' : 'bg-white/90 text-gray-500 hover:text-amber-500'}`}
                            title="Set as primary image"
                          >
                            <Star size={13} fill={primaryImageId === item.id ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(item.id)}
                            className="absolute right-1 bottom-1 rounded-md bg-white/90 p-1 text-gray-500 opacity-0 shadow-sm transition-opacity hover:text-red-600 group-hover:opacity-100"
                            title="Remove image"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <ImageIcon size={32} className="mx-auto mb-2" />
                      <p className="text-sm">Click to upload images</p>
                      <p className="text-xs mt-1">PNG, JPG, WEBP up to 10MB each</p>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-xs text-gray-500">
                  <span>Drag images to reorder. Use the star to choose the featured image.</span>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="font-medium text-gray-900 hover:underline"
                  >
                    Add images
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
              </div>

              {formError && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="e.g. Handcrafted Pearl Earrings" />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
                  <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                    placeholder="Describe the product..." />
                </div>

                {[
                  { key: 'costPrice', label: 'Cost Price (₹) *' },
                  { key: 'sellingPrice', label: 'Selling Price (₹) *' },
                  { key: 'retailPrice', label: 'Retail Price (₹) *' },
                  { key: 'totalQuantity', label: 'Stock Quantity *' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                    <input required type="number" min="0" value={(form as any)[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                    <option value="">Select category</option>
                    {categoriesData?.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select value={String(form.isActive)} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Height</label>
                    <input value={(form as any).size?.height} onChange={(e) => setForm({ ...form, size: { ...(form as any).size, height: e.target.value } })}
                      placeholder="e.g. 20cm"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Width</label>
                    <input value={(form as any).size?.width} onChange={(e) => setForm({ ...form, size: { ...(form as any).size, width: e.target.value } })}
                      placeholder="e.g. 10cm"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                </div>

                {[
                  { key: 'colors', label: 'Colors (comma-separated)', placeholder: '#ff0000, #00ff00, blue' },
                  { key: 'tags', label: 'Tags (comma-separated)', placeholder: 'handmade, pearl, gift' },
                  { key: 'materialUsed', label: 'Materials (comma-separated)', placeholder: 'silver, pearl, thread' },
                  { key: 'weight', label: 'Weight', placeholder: '50g' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className={key === 'colors' || key === 'tags' || key === 'materialUsed' ? 'col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                    <input value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder={placeholder} />
                  </div>
                ))}

                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Product ID</label>
                    <input value={(form as any).productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}
                      placeholder="SKU or product id"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Fineshed</label>
                    <input value={(form as any).Fineshed} onChange={(e) => setForm({ ...form, Fineshed: e.target.value })}
                      placeholder="e.g. Polished"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Light Source</label>
                    <input value={(form as any).LightSource} onChange={(e) => setForm({ ...form, LightSource: e.target.value })}
                      placeholder="e.g. LED"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Remark</label>
                    <input value={(form as any).Remark} onChange={(e) => setForm({ ...form, Remark: e.target.value })}
                      placeholder="Any remarks"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 border border-gray-200 text-gray-700 font-medium px-4 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saveProduct.isPending}
                  className="flex-1 btn-admin flex items-center justify-center gap-2">
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
