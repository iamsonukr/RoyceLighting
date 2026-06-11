'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Store,
  Tag,
  ChevronLeft, ChevronRight, LogOut, Menu, X, Settings,
  BarChart3, Bell,
} from 'lucide-react';
import { useAdminSelector, useAdminDispatch, adminLogout, setAdminAuth } from '@/store/admin/store';
import { AdminLogin } from '../auth/AdminLogin';

const NAV_ITEMS = [
  { href: '/admin',            icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/products',   icon: Package,         label: 'Products' },
  { href: '/admin/categories', icon: Tag,             label: 'Categories' },
  { href: '/admin/orders',     icon: ShoppingBag,     label: 'Orders' },
  { href: '/admin/users',      icon: Users,           label: 'Users' },
  { href: '/admin/vendors',    icon: Store,           label: 'Vendors' },
  { href: '/admin/analytics',  icon: BarChart3,       label: 'Analytics' },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const { token, admin } = useAdminSelector((s) => s.adminAuth);
  const dispatch = useAdminDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!token) {
    // In development, offer a quick preview bypass so the admin UI can be inspected
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="space-y-4">
            <AdminLogin />
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Development preview: view the admin UI without logging in.</p>
              <button
                onClick={() => dispatch(setAdminAuth({ token: 'dev-token', admin: { _id: 'dev', name: 'Dev Admin', email: 'dev@local', role: 'admin' } }))}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg"
              >
                Preview Admin UI
              </button>
            </div>
          </div>
        </div>
      );
    }

    return <AdminLogin />;
  }

  const handleLogout = () => {
    dispatch(adminLogout());
    router.push('/admin');
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-4 py-5 border-b border-gray-100 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">NC</span>
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-gray-900 text-sm">Royace Lighting</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`px-3 py-4 border-t border-gray-100 space-y-1`}>
        <Link href="/admin/settings" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors ${collapsed ? 'justify-center' : ''}`}>
          <Settings size={18} />
          {!collapsed && 'Settings'}
        </Link>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={18} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col border-r border-gray-100 bg-white transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'}`}>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-full bg-white border border-gray-200 rounded-r-lg p-1 shadow-sm hover:bg-gray-50 transition-colors"
          style={{ left: collapsed ? 56 : 224 }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-white flex flex-col shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1 text-gray-600" onClick={() => setMobileOpen(true)}>
              <Menu size={20} />
            </button>
            <h1 className="font-semibold text-gray-900 text-base">
              {NAV_ITEMS.find((n) => pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href)))?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {admin?.name?.charAt(0) || 'A'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{admin?.name || 'Admin'}</p>
                <p className="text-xs text-gray-400">{admin?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
