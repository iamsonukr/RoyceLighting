'use client';

import '../vendor.css';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vendorStore } from '@/store/vendor/store';
import { VendorShell } from './vendor/components/layout/VendorShell';

const queryClient = new QueryClient();

export default function VendorGroupLayout({ children }: { children: ReactNode }) {
  return (
    <Provider store={vendorStore}>
      <QueryClientProvider client={queryClient}>
        <div className="vendor-panel">
          <VendorShell>{children}</VendorShell>
        </div>
      </QueryClientProvider>
    </Provider>
  );
}
