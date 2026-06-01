'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut, Store } from 'lucide-react';
import { useVendorSelector, useVendorDispatch, vendorLogout } from '../../store/store';
import { VendorLogin } from '../auth/VendorLogin';

const NAV = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/products', icon: Package, label: 'My Products' },
  { href: '/orders', icon: ShoppingBag, label: 'My Orders' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function VendorShell({ children }: { children: ReactNode }) {
  const { token, vendor } = useVendorSelector((s) => s.vendorAuth);
  const dispatch = useVendorDispatch();
  const pathname = usePathname();

  if (!token) return <VendorLogin />;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center shrink-0">
              <Store size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm truncate">{vendor?.shopName || vendor?.name}</p>
              <p className="text-xs text-gray-400">Vendor Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-amber-600 text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}>
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <button onClick={() => dispatch(vendorLogout())}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h1 className="font-semibold text-gray-900">
            {NAV.find((n) => pathname === n.href || (n.href !== '/' && pathname.startsWith(n.href)))?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-xs font-bold">
              {vendor?.name?.charAt(0)}
            </div>
            <span className="text-sm font-medium text-gray-900 hidden sm:block">{vendor?.name}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
