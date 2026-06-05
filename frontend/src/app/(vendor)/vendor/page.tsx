'use client';

import { useQuery } from '@tanstack/react-query';
import {
  IndianRupee, Package, ShoppingBag, TrendingUp,
  AlertTriangle, BarChart3,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { vendorApi } from '@/lib/vendorApi';
import { useVendorSelector } from '@/store/vendor/store';

const STATUS_COLORS: Record<string, string> = {
  Placed: 'bg-blue-50 text-blue-700',
  Confirmed: 'bg-indigo-50 text-indigo-700',
  Shipped: 'bg-orange-50 text-orange-700',
  Delivered: 'bg-green-50 text-green-700',
  Cancelled: 'bg-red-50 text-red-700',
};

export default function VendorDashboard() {
  const { vendor } = useVendorSelector((s) => s.vendorAuth);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['vendor-dashboard'],
    queryFn: async () => {
      const res = await vendorApi.get('/vendor/dashboard');
      return res.data.data;
    },
  });

  const { data: ordersData } = useQuery({
    queryKey: ['vendor-recent-orders'],
    queryFn: async () => {
      const res = await vendorApi.get('/vendor/orders?limit=5');
      return res.data.data;
    },
  });

  const statCards = [
    {
      label: 'Total Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'My Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Items Sold',
      value: stats?.totalItemsSold || 0,
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Welcome back, {vendor?.name?.split(' ')[0]}!
        </h2>
        <p className="text-gray-500 text-sm mt-0.5">
          {vendor?.shopName && `${vendor.shopName} · `}Here's your store overview.
        </p>
      </div>

      {/* Low stock alert */}
      {stats?.lowStockProducts > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800 font-medium">
            {stats.lowStockProducts} product(s) have low stock (≤5 units). Consider restocking.
          </p>
          <a href="/vendor/products" className="ml-auto text-xs font-semibold text-amber-700 hover:underline shrink-0">
            View Products →
          </a>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="v-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? (
                    <span className="inline-block h-7 w-20 bg-gray-100 rounded animate-pulse" />
                  ) : value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${color}`}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="v-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={18} className="text-amber-600" />
            <h3 className="font-semibold text-gray-900">Monthly Revenue</h3>
          </div>
          {stats?.monthlyRevenue?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(v: any) => [`₹${v}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No revenue data yet
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="v-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">Recent Orders</h3>
            <a href="/vendor/orders" className="text-xs text-amber-600 hover:underline font-medium">
              View all →
            </a>
          </div>
          <div className="space-y-3">
            {ordersData?.orders?.length > 0
              ? ordersData.orders.map((order: any) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        #{String(order._id).slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.vendorItems?.length} item(s) ·{' '}
                        {new Date(order.orderDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        ₹{order.vendorRevenue}
                      </p>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              : (
                <div className="text-center py-10 text-gray-400 text-sm">
                  No orders yet
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
