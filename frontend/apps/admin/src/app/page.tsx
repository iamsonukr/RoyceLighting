'use client';

import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Package, Users, IndianRupee, TrendingUp, Clock, CheckCircle, Truck } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
  const { data: statsData } = useQuery({
    queryKey: ['admin-order-stats'],
    queryFn: async () => {
      const res = await adminApi.get('/orders/admin/stats');
      return res.data.data;
    },
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: async () => {
      const res = await adminApi.get('/orders/admin/all?limit=5');
      return res.data.data.orders;
    },
  });

  const { data: productsData } = useQuery({
    queryKey: ['admin-products-count'],
    queryFn: async () => {
      const res = await adminApi.get('/products/admin/all?limit=1');
      return res.data.data;
    },
  });

  const stats = [
    { label: 'Total Revenue', value: `₹${(statsData?.revenue || 0).toLocaleString()}`, icon: IndianRupee, color: 'bg-green-50 text-green-600', change: '+12%' },
    { label: 'Total Orders', value: statsData?.total || 0, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600', change: '+8%' },
    { label: 'Products', value: productsData?.total || 0, icon: Package, color: 'bg-purple-50 text-purple-600', change: '+3' },
    { label: 'Delivered', value: statsData?.delivered || 0, icon: CheckCircle, color: 'bg-orange-50 text-orange-600', change: '' },
  ];

  const orderStatusData = statsData
    ? [
        { name: 'Placed', count: statsData.placed, fill: '#3b82f6' },
        { name: 'Confirmed', count: statsData.confirmed, fill: '#6366f1' },
        { name: 'Shipped', count: statsData.shipped, fill: '#f59e0b' },
        { name: 'Delivered', count: statsData.delivered, fill: '#22c55e' },
        { name: 'Cancelled', count: statsData.cancelled, fill: '#ef4444' },
      ]
    : [];

  const STATUS_STYLES: Record<string, string> = {
    Placed: 'bg-blue-50 text-blue-700',
    Confirmed: 'bg-indigo-50 text-indigo-700',
    Processing: 'bg-yellow-50 text-yellow-700',
    Shipped: 'bg-orange-50 text-orange-700',
    'Out for Delivery': 'bg-purple-50 text-purple-700',
    Delivered: 'bg-green-50 text-green-700',
    Cancelled: 'bg-red-50 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-0.5">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map(({ label, value, icon: Icon, color, change }) => (
          <div key={label} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {change && (
                  <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                    <TrendingUp size={11} /> {change} this month
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-xl ${color}`}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by status chart */}
        <div className="admin-card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={orderStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {orderStatusData.map((entry, index) => (
                  <rect key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent orders */}
        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Orders</h3>
            <a href="/orders" className="text-xs text-gray-500 hover:text-gray-700 font-medium">View all →</a>
          </div>
          <div className="space-y-3">
            {recentOrders?.map((order: any) => (
              <div key={order._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">#{String(order._id).slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-gray-500">{order.userId?.name || 'Customer'} · {order.items.length} item(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">₹{order.amount}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {!recentOrders?.length && (
              <p className="text-sm text-gray-400 text-center py-8">No orders yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { icon: Clock, label: 'Pending (Placed)', value: statsData?.placed || 0, color: 'text-blue-500' },
          { icon: Truck, label: 'In Transit', value: (statsData?.confirmed || 0) + (statsData?.shipped || 0), color: 'text-orange-500' },
          { icon: CheckCircle, label: 'Delivered', value: statsData?.delivered || 0, color: 'text-green-500' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="admin-card p-5 flex items-center gap-4">
            <Icon size={28} className={color} />
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
