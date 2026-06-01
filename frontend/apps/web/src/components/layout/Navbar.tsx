'use client';

import Link from 'next/link';
import { ShoppingCart, Search, User, Menu, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { openAuthModal } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { selectCartCount } from '../../store/slices/cartSlice';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { label: 'Chandeliers', href: '/shop?collection=chandeliers' },
  { label: 'Pendants', href: '/shop?collection=pendants' },
  { label: 'Sconces', href: '/shop?collection=sconces' },
  { label: 'Table Lamps', href: '/shop?collection=table-lamps' },
  { label: 'Bespoke', href: '/bespoke' },
  { label: 'About', href: '/about' },
];

export function Navbar() {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((s) => s.auth);
  const cartCount = useAppSelector(selectCartCount);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // treat non-home pages as 'scrolled' so navbar uses dark-on-light styles
  const active = scrolled || pathname !== '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-500"
      style={{
        background: active ? 'var(--ivory)' : 'rgba(14,11,7,0.0)',
        borderBottom: active ? '1px solid var(--parchment)' : '1px solid transparent',
        backdropFilter: active ? 'blur(12px)' : 'none',
      }}
    >
      {/* Announcement bar */}
      <div
        className="text-center py-2"
        style={{
          background: 'var(--gold)',
          color: 'var(--obsidian)',
          fontSize: '0.62rem',
          fontWeight: 500,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
        }}
      >
        Complimentary White-Glove Installation on Orders Above ₹1,50,000
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link
            href="/"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.5rem',
              fontWeight: 400,
              letterSpacing: '0.12em',
              color: active ? 'var(--obsidian)' : 'var(--ivory)',
              textTransform: 'uppercase',
              textDecoration: 'none',
              lineHeight: 1,
            }}
          >
            Royce
            <span style={{ color: 'var(--gold)', margin: '0 0.2em' }}>✦</span>
            Lighting
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link"
                style={{
                  color: active ? 'var(--smoke)' : 'rgba(250,247,240,0.8)',
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  fontWeight: 400,
                  transition: 'color 0.2s',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = active
                    ? 'var(--smoke)'
                    : 'rgba(250,247,240,0.8)')
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <Link
              href="/shop"
              className="p-2.5 transition-colors"
              style={{ color: active ? 'var(--slate)' : 'rgba(250,247,240,0.8)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = active
                  ? 'var(--slate)'
                  : 'rgba(250,247,240,0.8)')
              }
            >
              <Search size={18} strokeWidth={1.5} />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2.5 transition-colors"
              style={{ color: active ? 'var(--slate)' : 'rgba(250,247,240,0.8)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = active
                  ? 'var(--slate)'
                  : 'rgba(250,247,240,0.8)')
              }
            >
              <ShoppingCart size={18} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 flex items-center justify-center"
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: 'var(--gold)',
                    color: 'var(--obsidian)',
                    fontSize: '0.55rem',
                    fontWeight: 600,
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {token ? (
              <div className="relative group">
                <button
                  className="flex items-center gap-2 p-2.5 transition-colors"
                  style={{ color: active ? 'var(--slate)' : 'rgba(250,247,240,0.8)' }}
                >
                  <User size={18} strokeWidth={1.5} />
                  <span
                    className="hidden sm:block"
                    style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}
                  >
                    {user?.name?.split(' ')[0]}
                  </span>
                </button>
                {/* Dropdown */}
                <div
                  className="absolute right-0 top-full mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                  style={{
                    background: 'var(--ivory)',
                    border: '1px solid var(--parchment)',
                    boxShadow: '0 16px 48px rgba(14,11,7,0.12)',
                  }}
                >
                  {[
                    { label: 'My Orders', href: '/my-orders' },
                    { label: 'Profile', href: '/profile' },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        display: 'block',
                        padding: '0.85rem 1.25rem',
                        fontSize: '0.68rem',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: 'var(--slate)',
                        textDecoration: 'none',
                        borderBottom: '1px solid var(--linen)',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold-deep)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--slate)')}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => dispatch(logout())}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'block',
                      padding: '0.85rem 1.25rem',
                      fontSize: '0.68rem',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'var(--burgundy)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'color 0.15s',
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => dispatch(openAuthModal('login'))}
                className="btn-outline hidden sm:inline-flex ml-2"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.62rem' }}
              >
                Sign In
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2.5 transition-colors"
              style={{ color: active ? 'var(--slate)' : 'rgba(250,247,240,0.8)' }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden py-6"
            style={{ borderTop: '1px solid var(--parchment)' }}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'block',
                  padding: '0.75rem 0',
                  fontSize: '0.68rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'var(--slate)',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--linen)',
                }}
              >
                {link.href === '/bespoke' ? (
                  <span style={{ color: 'var(--gold)' }}>{link.label}</span>
                ) : (
                  link.label
                )}
              </Link>
            ))}
            {!token && (
              <button
                onClick={() => {
                  dispatch(openAuthModal('login'));
                  setMobileOpen(false);
                }}
                className="btn-primary w-full mt-5"
                style={{ fontSize: '0.62rem', justifyContent: 'center' }}
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}