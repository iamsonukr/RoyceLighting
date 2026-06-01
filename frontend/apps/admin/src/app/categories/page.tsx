'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import Pagination from '@/components/Pagination';

const EMPTY_FORM = {
  name: '', slug: '', description: '', emoji: '', sortOrder: 0, isActive: true,
};

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories', page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      const res = await adminApi.get(`/categories/admin/all?${params.toString()}`);
      return res.data.data;
    },
  });

  const categories = Array.isArray(data) ? data : data?.categories || [];
  const total = !Array.isArray(data) ? data?.total : categories.length;

  const saveCategory = useMutation({
    mutationFn: async (fd: FormData) => {
      if (editing) return adminApi.put(`/categories/${editing._id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return adminApi.post('/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); closeModal(); },
  });

  const deleteCategory = useMutation({ mutationFn: (id: string) => adminApi.delete(`/categories/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }) });

  const toggleActive = useMutation({ mutationFn: (id: string) => adminApi.patch(`/categories/${id}/toggle`), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }) });

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY_FORM }); setImageFile(null); setImagePreview(''); setModalOpen(true); };

  const openEdit = (c: any) => { setEditing(c); setForm({ name: c.name, slug: c.slug, description: c.description || '', emoji: c.emoji || '', sortOrder: c.sortOrder || 0, isActive: c.isActive }); setImagePreview(c.image || ''); setImageFile(null); setModalOpen(true); };

  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    if (imageFile) fd.append('image', imageFile);
    saveCategory.mutate(fd);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Categories</h2>
          <p className="text-gray-500 text-sm">Manage product categories</p>
        </div>
        <button onClick={openAdd} className="btn-admin flex items-center gap-2"><Plus size={16} /> Add Category</button>
      </div>

      <div className="admin-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Name', 'Slug', 'Emoji', 'Order', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-50"><td className="px-5 py-4" colSpan={6}><div className="h-4 bg-gray-100 rounded animate-pulse w-40" /></td></tr>
            )) : categories?.map((c: any) => (
              <tr key={c._id} className="table-row border-b border-gray-50">
                <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  {c.image ? <img src={c.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={16} /></div>}
                </div><div><div className="text-sm font-medium text-gray-900">{c.name}</div><div className="text-xs text-gray-400">{c.description}</div></div></div></td>
                <td className="px-5 py-4 text-sm text-gray-500">{c.slug}</td>
                <td className="px-5 py-4">{c.emoji}</td>
                <td className="px-5 py-4">{c.sortOrder}</td>
                <td className="px-5 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"><Pencil size={15} /></button>
                    <button onClick={() => { if (confirm('Delete this category?')) deleteCategory.mutate(c._id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                    <button onClick={() => toggleActive.mutate(c._id)} className="text-sm text-gray-500">Toggle</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && !categories?.length && <p className="text-center text-gray-400 py-16">No categories yet</p>}
        {!isLoading && total > (page * limit - limit) && (
          <Pagination page={page} pages={!Array.isArray(data) ? data.pages : 1} total={total} onPageChange={(p) => setPage(p)} />
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-gray-900">{editing ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={closeModal} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-gray-400 transition-colors">
                  {imagePreview ? <img src={imagePreview.startsWith('blob') ? imagePreview : imagePreview} className="w-24 h-24 object-cover rounded-lg mx-auto" /> : <div className="text-gray-400"><ImageIcon size={32} className="mx-auto mb-2" /><p className="text-sm">Click to upload image</p></div>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Emoji</label>
                  <input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort Order</label>
                  <input type="number" value={form.sortOrder as any} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm" />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm resize-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select value={String(form.isActive)} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm">
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 border border-gray-200 text-gray-700 font-medium px-4 py-2.5 rounded-lg text-sm">Cancel</button>
                <button type="submit" disabled={saveCategory.isPending} className="flex-1 btn-admin flex items-center justify-center gap-2">{saveCategory.isPending && <Loader2 size={15} className="animate-spin" />} {editing ? 'Update Category' : 'Add Category'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
