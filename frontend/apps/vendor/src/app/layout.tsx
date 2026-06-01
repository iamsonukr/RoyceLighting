'use client';

import './globals.css';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vendorStore } from '@/store/store';
import { VendorShell } from '../components/layout/VendorShell';

const queryClient = new QueryClient();

export default function VendorLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Provider store={vendorStore}>
          <QueryClientProvider client={queryClient}>
            <VendorShell>{children}</VendorShell>
          </QueryClientProvider>
        </Provider>
      </body>
    </html>
  );
}
