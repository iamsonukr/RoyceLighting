'use client';

import './globals.css';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { adminStore } from '../store/store';
import { AdminShell } from '../components/layout/AdminShell';

const queryClient = new QueryClient();

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Provider store={adminStore}>
          <QueryClientProvider client={queryClient}>
            <AdminShell>{children}</AdminShell>
          </QueryClientProvider>
        </Provider>
      </body>
    </html>
  );
}
