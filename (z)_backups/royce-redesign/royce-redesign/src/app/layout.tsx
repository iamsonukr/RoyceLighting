'use client';

import './globals.css';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '../store/store';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { AuthModal } from '../components/auth/AuthModal';
import { Toaster } from '../components/ui/Toaster';
import { CartDrawer } from '../components/layout/CartDrawer';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60 * 1000 } },
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <CartDrawer />
            <AuthModal />
            <Toaster />
          </QueryClientProvider>
        </Provider>
      </body>
    </html>
  );
}
