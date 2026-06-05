'use client';

import '../vendor.css';
import { ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setVendorToken, useVendorDispatch, vendorStore } from '@/store/vendor/store';
import { VendorShell } from './vendor/components/layout/VendorShell';

const queryClient = new QueryClient();

function VendorAuthBootstrap() {
  const dispatch = useVendorDispatch();

  useEffect(() => {
    const token = localStorage.getItem('nc_vendor_token');
    if (token) {
      dispatch(setVendorToken(token));
    }
  }, [dispatch]);

  return null;
}

export default function VendorGroupLayout({ children }: { children: ReactNode }) {
  return (
    <Provider store={vendorStore}>
      <QueryClientProvider client={queryClient}>
        <VendorAuthBootstrap />
        <div className="vendor-panel">
          <VendorShell>{children}</VendorShell>
        </div>
      </QueryClientProvider>
    </Provider>
  );
}
