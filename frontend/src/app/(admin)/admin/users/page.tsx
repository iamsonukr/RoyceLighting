'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, UserCheck, UserX } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import Pagination from '@/components/Pagination';

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [roleFilter, setRoleFilter] = useState('user');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, search]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', roleFilter, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (roleFilter) params.set('role', roleFilter);
      params.set('page', String(page));
      params.set('limit', String(limit));
      const res = await adminApi.get(`/users?${params.toString()}`);
      return res.data.data;
    },
  });

  const users = Array.isArray(data) ? data : data?.users || [];
  const total = !Array.isArray(data) ? data?.total : users.length;

  const toggleActive = useMutation({
    mutationFn: (id: string) => adminApi.patch(`/users/${id}/toggle-active`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const filtered = users?.filter((u: any) =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Users</h2>
          <p className="text-gray-500 text-sm">{filtered?.length || 0} users</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 w-52"
            />
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['user', 'vendor', 'admin'].map((r) => (
              <button
                key={r} onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                  roleFilter === r ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r}s
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['User', 'Email', 'Role', 'Joined', 'Status', 'Action'].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              : filtered?.map((user: any) => (
                  <tr key={user._id} className="table-row">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        user.role === 'admin' ? 'bg-purple-50 text-purple-700' :
                        user.role === 'vendor' ? 'bg-amber-50 text-amber-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleActive.mutate(user._id)}
                        disabled={user.role === 'admin'}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                          user.isActive
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {user.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                        {user.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!isLoading && !filtered?.length && (
          <div className="text-center py-16">
            <Users size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">No users found</p>
          </div>
        )}
        {!isLoading && !Array.isArray(data) && data?.pages > 1 && (
          <Pagination
            page={page}
            pages={data.pages}
            total={total}
            pageSize={limit}
            itemLabel="users"
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
