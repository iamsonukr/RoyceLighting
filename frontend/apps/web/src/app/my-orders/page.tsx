'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Package, ChevronRight, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { api } from '@/lib/api';

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: any }> = {
  Placed:          { label: 'Order Placed',      color: 'text-blue-600 bg-blue-50',    Icon: Clock },
  Confirmed:       { label: 'Confirmed',          color: 'text-indigo-600 bg-indigo-50',Icon: CheckCircle },
  Processing:      { label: 'Processing',         color: 'text-yellow-600 bg-yellow-50',Icon: Clock },
  Shipped:         { label: 'Shipped',            color: 'text-orange-600 bg-orange-50',Icon: Truck },
  'Out for Delivery':{ label: 'Out for Delivery', color: 'text-purple-600 bg-purple-50',Icon: Truck },
  Delivered:       { label: 'Delivered',          color: 'text-green-600 bg-green-50',  Icon: CheckCircle },
  Cancelled:       { label: 'Cancelled',          color: 'text-red-600 bg-red-50',      Icon: XCircle },
  Returned:        { label: 'Returned',           color: 'text-gray-600 bg-gray-100',   Icon: XCircle },
};

export default function MyOrdersPage() {
  const { token } = useAppSelector((s) => s.auth);

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await api.get('/orders/my-orders');
      return res.data.data;
    },
    enabled: !!token,
  });

  if (!token) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <Package size={56} className="mx-auto text-gray-300 mb-5" />
        <h2 className="font-serif text-2xl font-bold mb-3">Sign in to view orders</h2>
        <Link href="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 mb-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <Package size={56} className="mx-auto text-gray-300 mb-5" />
        <h2 className="font-serif text-2xl font-bold mb-3">No orders yet</h2>
        <p className="text-gray-500 mb-8">Your placed orders will appear here.</p>
        <Link href="/shop" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-serif text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      <div className="space-y-4">
        {data.map((order: any) => {
          const { label, color, Icon } = STATUS_CONFIG[order.status] || STATUS_CONFIG['Placed'];
          const orderId = String(order._id).slice(-8).toUpperCase();
          const orderDate = new Date(order.orderDate).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
          });

          return (
            <div key={order._id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-brand-200 transition-colors">
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-semibold text-gray-800">#{orderId}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">{orderDate}</span>
                </div>
                <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>
                  <Icon size={13} />
                  {label}
                </span>
              </div>

              <div className="p-5">
                <div className="mb-4">
                  {order.items.slice(0, 2).map((item: any) => (
                    <div key={`${item.productId}-${item.color}`} className="flex items-center gap-3 mb-2">
                      <div className="w-1.5 h-1.5 bg-brand-400 rounded-full shrink-0" />
                      <span className="text-sm text-gray-700">{item.name}</span>
                      <span className="text-xs text-gray-400">× {item.quantity}</span>
                      {item.color && (
                        <div className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: item.color }} />
                      )}
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-xs text-gray-400 ml-4">+{order.items.length - 2} more items</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-gray-500">Total: </span>
                    <span className="font-bold text-gray-900">₹{order.amount}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {order.delivery?.trackingUrl && (
                      <a
                        href={order.delivery.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Truck size={13} /> Track
                      </a>
                    )}
                    <Link
                      href={`/order/${order._id}`}
                      className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
                    >
                      View Details <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
