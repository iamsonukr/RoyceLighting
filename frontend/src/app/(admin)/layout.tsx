'use client';

import '../admin.css';
import { ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { adminStore, setAdminToken, useAdminDispatch } from '@/store/admin/store';
import { AdminShell } from './admin/components/layout/AdminShell';

const queryClient = new QueryClient();

function AdminAuthBootstrap() {
  const dispatch = useAdminDispatch();

  useEffect(() => {
    const token = localStorage.getItem('nc_admin_token');
    if (token) {
      dispatch(setAdminToken(token));
    }
  }, [dispatch]);

  return null;
}

export default function AdminGroupLayout({ children }: { children: ReactNode }) {
  return (
    <Provider store={adminStore}>
      <QueryClientProvider client={queryClient}>
        <AdminAuthBootstrap />
        <div className="admin-panel">
          <AdminShell>{children}</AdminShell>
        </div>
      </QueryClientProvider>
    </Provider>
  );
}
