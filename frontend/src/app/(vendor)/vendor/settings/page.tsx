'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Save, Loader2, CheckCircle } from 'lucide-react';
import { vendorApi } from '@/lib/vendorApi';
import { useVendorSelector } from '@/store/vendor/store';

export default function VendorSettingsPage() {
  const { vendor } = useVendorSelector((s) => s.vendorAuth);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');

  const changePassword = useMutation({
    mutationFn: () =>
      vendorApi.patch('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }),
    onSuccess: () => {
      setPwSuccess(true);
      setPwError('');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwSuccess(false), 3000);
    },
    onError: (err: any) => {
      setPwError(err.response?.data?.message || 'Failed to change password');
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPwError('Password must be at least 6 characters');
      return;
    }
    changePassword.mutate();
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500 text-sm mt-0.5">Manage your vendor account settings.</p>
      </div>

      {/* Account Info */}
      <div className="v-card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="space-y-4">
          {[
            { label: 'Name', value: vendor?.name },
            { label: 'Email', value: vendor?.email },
            { label: 'Shop Name', value: vendor?.shopName },
            { label: 'Role', value: 'Vendor' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-500 w-28 shrink-0">{label}</span>
              <span className="text-sm font-medium text-gray-900">{value || '—'}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          To update your profile details, please contact admin.
        </p>
      </div>

      {/* Change Password */}
      <div className="v-card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {[
            { key: 'currentPassword', label: 'Current Password', placeholder: '••••••••' },
            { key: 'newPassword', label: 'New Password', placeholder: '••••••••' },
            { key: 'confirmPassword', label: 'Confirm New Password', placeholder: '••••••••' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <input
                type="password" required
                value={(passwordForm as any)[key]}
                onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          ))}

          {pwError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{pwError}</p>
          )}
          {pwSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
              <CheckCircle size={15} /> Password changed successfully!
            </div>
          )}

          <button
            type="submit" disabled={changePassword.isPending}
            className="btn-vendor flex items-center gap-2"
          >
            {changePassword.isPending
              ? <Loader2 size={15} className="animate-spin" />
              : <Save size={15} />
            }
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
