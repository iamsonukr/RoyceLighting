import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Royace Lighting - Luxury Chandeliers & Handcrafted Lighting',
  description:
    'Bespoke chandeliers and luxury lighting for extraordinary interiors.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
