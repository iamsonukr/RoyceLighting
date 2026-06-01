'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ChevronDown, Truck, ExternalLink, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';

const STATUSES = ['', 'Placed', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];

const STATUS_STYLES: Record<string, string> = {
  Placed: 'bg-blue-50 text-blue-700 border-blue-200',
  Confirmed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Processing: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Shipped: 'bg-orange-50 text-orange-700 border-orange-200',
  'Out for Delivery': 'bg-purple-50 text-purple-700 border-purple-200',
  Delivered: 'bg-green-50 text-green-700 border-green-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
  Returned: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (filterStatus) params.set('status', filterStatus);
      const res = await adminApi.get(`/orders/admin/all?${params}`);
      return res.data.data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      adminApi.patch(`/orders/admin/${orderId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order-stats'] });
    },
  });

  const orders = data?.orders || [];
  const totalPages = data?.pages || 1;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Orders</h2>
          <p className="text-gray-500 text-sm">{data?.total || 0} total orders</p>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s || 'All Statuses'}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order ID', 'Customer', 'Items', 'Amount', 'Date', 'Status', 'Delivery', 'Action'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                : orders.map((order: any) => (
                    <>
                      <tr key={order._id} className="table-row cursor-pointer"
                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}>
                        <td className="px-5 py-4 text-sm font-mono font-medium text-gray-800">
                          #{String(order._id).slice(-8).toUpperCase()}
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-gray-900">{order.userId?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-400">{order.userId?.email}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">{order.items.length} item(s)</td>
                        <td className="px-5 py-4 text-sm font-semibold text-gray-900">₹{order.amount}</td>
                        <td className="px-5 py-4 text-sm text-gray-500">
                          {new Date(order.orderDate || order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short',
                          })}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {order.delivery?.waybill ? (
                            <a href={order.delivery.trackingUrl} target="_blank" rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                              <Truck size={13} /> {order.delivery.waybill}
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateStatus.mutate({ orderId: order._id, status: e.target.value });
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-900 cursor-pointer"
                          >
                            {STATUSES.filter(Boolean).map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>

                      {/* Expanded row */}
                      {expandedOrder === order._id && (
                        <tr key={`${order._id}-expanded`} className="bg-gray-50">
                          <td colSpan={8} className="px-5 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Items */}
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Order Items</p>
                                <div className="space-y-2">
                                  {order.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between text-sm bg-white rounded-lg px-3 py-2 border border-gray-100">
                                      <div>
                                        <span className="font-medium">{item.name}</span>
                                        {item.color && <span className="text-gray-400 ml-2">· {item.color}</span>}
                                      </div>
                                      <div className="text-right">
                                        <span className="text-gray-500">×{item.quantity}</span>
                                        <span className="font-semibold ml-3">₹{item.price * item.quantity}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Address */}
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Delivery Address</p>
                                <div className="bg-white rounded-lg px-4 py-3 border border-gray-100 text-sm text-gray-600 space-y-1">
                                  <p>{order.address.addressLineOne}</p>
                                  {order.address.addressLineTwo && <p>{order.address.addressLineTwo}</p>}
                                  <p>{order.address.city}, {order.address.state} - {order.address.pinCode}</p>
                                  <p className="font-medium text-gray-800">📞 {order.address.phone}</p>
                                </div>

                                {order.delivery?.waybill && (
                                  <div className="mt-3 bg-blue-50 rounded-lg px-4 py-3 text-sm">
                                    <p className="font-semibold text-blue-800 mb-1">Delhivery Shipment</p>
                                    <p className="text-blue-600">AWB: {order.delivery.waybill}</p>
                                    <a href={order.delivery.trackingUrl} target="_blank" rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-blue-700 hover:underline mt-1 text-xs font-medium">
                                      <ExternalLink size={12} /> Track on Delhivery
                                    </a>
                                  </div>
                                )}

                                {order.status === 'Confirmed' && !order.delivery?.waybill && (
                                  <p className="mt-3 text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-2">
                                    ⚡ Delhivery shipment being created...
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
                Previous
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
