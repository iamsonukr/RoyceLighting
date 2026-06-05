import '../globals.css';
import { ReactNode } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { AuthModal } from '@/components/auth/AuthModal';
import { Toaster } from '@/components/ui/Toaster';
import { PageTransition } from '@/components/layout/PageTransition';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="public-site">
      <Navbar />
      <PageTransition>{children}</PageTransition>
      <Footer />
      <CartDrawer />
      <AuthModal />
      <Toaster />
    </div>
  );
}
