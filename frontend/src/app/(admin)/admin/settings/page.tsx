'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Save, Loader2, CheckCircle, Shield } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { useAdminSelector } from '@/store/admin/store';

export default function AdminSettingsPage() {
  const { admin } = useAdminSelector((s) => s.adminAuth);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => adminApi.patch('/auth/change-password', {
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    }),
    onSuccess: () => {
      setSuccess(true);
      setError('');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) { setError("Passwords don't match"); return; }
    mutation.mutate();
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500 text-sm mt-0.5">Manage your admin account.</p>
      </div>

      <div className="admin-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">{admin?.name?.charAt(0)}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{admin?.name}</p>
            <p className="text-sm text-gray-500">{admin?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-purple-50 rounded-lg px-4 py-2.5">
          <Shield size={16} className="text-purple-600" />
          <p className="text-sm font-medium text-purple-700">Administrator Access</p>
        </div>
      </div>

      <div className="admin-card p-6">
        <h3 className="font-semibold text-gray-900 mb-5">Change Password</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'currentPassword', label: 'Current Password' },
            { key: 'newPassword', label: 'New Password' },
            { key: 'confirmPassword', label: 'Confirm New Password' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <input
                type="password" required
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="••••••••"
              />
            </div>
          ))}
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          {success && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
              <CheckCircle size={15} /> Password changed successfully!
            </div>
          )}
          <button type="submit" disabled={mutation.isPending} className="btn-admin flex items-center gap-2">
            {mutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save Password
          </button>
        </form>
      </div>
    </div>
  );
}
