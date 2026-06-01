'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Store, UserCheck, UserX, Package } from 'lucide-react';
import { adminApi } from '@/lib/api';
import Pagination from '@/components/Pagination';

export default function AdminVendorsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-vendors', page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        role: 'vendor',
        page: String(page),
        limit: String(limit),
      });
      const res = await adminApi.get(`/users?${params.toString()}`);
      return res.data.data;
    },
  });

  const vendors = data?.users || [];
  const total = data?.total || 0;

  const toggleActive = useMutation({
    mutationFn: (id: string) => adminApi.patch(`/users/${id}/toggle-active`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-vendors'] }),
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Vendors</h2>
        <p className="text-gray-500 text-sm">{total} registered vendors</p>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-gray-100 p-5 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))
            : vendors.map((vendor: any) => (
                <div key={vendor._id} className="rounded-xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                        <Store size={22} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{vendor.shopName || vendor.name}</p>
                        <p className="text-xs text-gray-500">{vendor.name}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      vendor.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {vendor.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 text-sm text-gray-500">
                    <p className="truncate">{vendor.email}</p>
                    {vendor.phone && <p>{vendor.phone}</p>}
                    {vendor.shopDescription && (
                      <p className="text-xs text-gray-400 line-clamp-2">{vendor.shopDescription}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      Joined {new Date(vendor.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleActive.mutate(vendor._id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
                        vendor.isActive
                          ? 'text-red-600 bg-red-50 hover:bg-red-100'
                          : 'text-green-600 bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      {vendor.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                      {vendor.isActive ? 'Suspend' : 'Activate'}
                    </button>
                    <a
                      href={`/products?vendorId=${vendor._id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700"
                    >
                      <Package size={13} /> Products
                    </a>
                  </div>
                </div>
              ))}
        </div>

        {!isLoading && !vendors.length && (
          <div className="p-16 text-center">
            <Store size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">No vendors yet</h3>
            <p className="text-gray-500 text-sm">Vendor accounts will appear here once they register.</p>
          </div>
        )}

        {!isLoading && data?.pages > 1 && (
          <Pagination
            page={page}
            pages={data.pages}
            total={total}
            pageSize={limit}
            itemLabel="vendors"
            onPageChange={setPage}
            onPageSizeChange={(nextLimit) => {
              setLimit(nextLimit);
              setPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
}
