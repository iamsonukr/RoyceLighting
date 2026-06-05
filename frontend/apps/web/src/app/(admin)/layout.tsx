'use client';

import '../admin.css';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { adminStore } from '@/store/admin/store';
import { AdminShell } from './admin/components/layout/AdminShell';

const queryClient = new QueryClient();

export default function AdminGroupLayout({ children }: { children: ReactNode }) {
  return (
    <Provider store={adminStore}>
      <QueryClientProvider client={queryClient}>
        <div className="admin-panel">
          <AdminShell>{children}</AdminShell>
        </div>
      </QueryClientProvider>
    </Provider>
  );
}
