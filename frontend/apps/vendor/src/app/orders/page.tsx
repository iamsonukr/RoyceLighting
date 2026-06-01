'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Truck, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { vendorApi } from '@/lib/api';

const STATUS_STYLES: Record<string, string> = {
  Placed:           'bg-blue-50 text-blue-700',
  Confirmed:        'bg-indigo-50 text-indigo-700',
  Processing:       'bg-yellow-50 text-yellow-700',
  Shipped:          'bg-orange-50 text-orange-700',
  'Out for Delivery':'bg-purple-50 text-purple-700',
  Delivered:        'bg-green-50 text-green-700',
  Cancelled:        'bg-red-50 text-red-700',
  Returned:         'bg-gray-100 text-gray-600',
};

export default function VendorOrdersPage() {
  const [page, setPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-orders', page],
    queryFn: async () => {
      const res = await vendorApi.get(`/vendor/orders?page=${page}&limit=15`);
      return res.data.data;
    },
  });

  const orders = data?.orders || [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
        <p className="text-gray-500 text-sm">Orders containing your products</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="v-card p-5 animate-pulse">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-32" />
                  <div className="h-3 bg-gray-100 rounded w-48" />
                </div>
                <div className="h-6 bg-gray-100 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="v-card p-16 text-center">
          <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500 text-sm">Orders for your products will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => {
            const expanded = expandedOrder === order._id;
            const orderId = String(order._id).slice(-8).toUpperCase();
            const orderDate = new Date(order.orderDate).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            });

            return (
              <div key={order._id} className="v-card overflow-hidden">
                {/* Header row */}
                <button
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                  onClick={() => setExpandedOrder(expanded ? null : order._id)}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">#{orderId}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{orderDate}</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm text-gray-600">
                        {order.vendorItems?.length} item(s) from your store
                      </p>
                      <p className="text-xs text-gray-400">{order.userId?.name || 'Customer'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">₹{order.vendorRevenue}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </div>
                    {expanded ? (
                      <ChevronUp size={16} className="text-gray-400 shrink-0" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400 shrink-0" />
                    )}
                  </div>
                </button>

                {/* Expanded details */}
                {expanded && (
                  <div className="border-t border-gray-100 px-5 py-5 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Your items in this order */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                          Your Items in This Order
                        </p>
                        <div className="space-y-2">
                          {order.vendorItems?.map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-white rounded-lg px-3 py-2.5 border border-gray-100"
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                {item.color && (
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <div
                                      className="w-3 h-3 rounded-full border border-gray-200"
                                      style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-xs text-gray-400">{item.color}</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">× {item.quantity}</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  ₹{item.price * item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-between text-sm font-semibold text-gray-900 pt-2 border-t border-gray-200 mt-2">
                            <span>Your Revenue</span>
                            <span className="text-amber-600">₹{order.vendorRevenue}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delivery & Address */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Delivery Address
                          </p>
                          <div className="bg-white rounded-lg px-4 py-3 border border-gray-100 text-sm text-gray-600 space-y-1">
                            <p>{order.address?.addressLineOne}</p>
                            {order.address?.addressLineTwo && <p>{order.address.addressLineTwo}</p>}
                            <p>
                              {order.address?.city}, {order.address?.state} - {order.address?.pinCode}
                            </p>
                            <p className="font-medium text-gray-800">📞 {order.address?.phone}</p>
                          </div>
                        </div>

                        {order.delivery?.waybill && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                              Shipment Tracking
                            </p>
                            <div className="bg-blue-50 rounded-lg px-4 py-3 border border-blue-100">
                              <div className="flex items-center gap-2 mb-1">
                                <Truck size={15} className="text-blue-600" />
                                <p className="text-sm font-semibold text-blue-800">Delhivery</p>
                              </div>
                              <p className="text-xs text-blue-600">AWB: {order.delivery.waybill}</p>
                              {order.delivery.trackingUrl && (
                                <a
                                  href={order.delivery.trackingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-blue-700 font-medium hover:underline mt-2"
                                >
                                  <ExternalLink size={12} /> Track Shipment
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data?.total > 15 && (
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)} disabled={orders.length < 15}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
