'use client';

import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, X, ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { openAuthModal } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { selectCartCount } from '../../store/slices/cartSlice';
import { openCartDrawer } from '../../store/slices/uiSlice';
import { useMemo, useState, useEffect, useRef } from 'react';
import { usePublicCategories } from '@/hooks/usePublicCategories';
import { categoryHref, FALLBACK_CATEGORIES } from '@/lib/publicCategories';

const NAV_LINKS = [
  { label: 'Collections', href: '#', hasMega: true },
  { label: 'Bespoke', href: '/bespoke' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact-us' },
];

export function Navbar() {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((s) => s.auth);
  const cartCount = useAppSelector(selectCartCount);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const { data: fetchedCategories } = usePublicCategories();

  const collectionItems = useMemo(() => {
    const source = fetchedCategories?.length ? fetchedCategories : FALLBACK_CATEGORIES;
    return source.map((category) => ({
      label: category.name,
      href: categoryHref(category),
      desc: category.description || 'Explore curated decorative lighting.',
      image: category.image,
    }));
  }, [fetchedCategories]);

  const browseItems = collectionItems.slice(0, 6);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  const navBg = scrolled
    ? 'rgba(3,32,22,0.92)'
    : 'rgba(8,6,4,0)';
  const navBorder = scrolled
    ? 'rgba(0,96,57,0.28)'
    : 'transparent';

  return (
    <>
      {/* Announcement bar */}
      <div
        style={{
          background: 'linear-gradient(90deg, var(--forest), var(--rolex-green), var(--forest))',
          color: 'var(--ivory)',
          borderBottom: '1px solid rgba(228,199,124,0.24)',
          fontSize: '0.58rem',
          fontWeight: 500,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          textAlign: 'center',
          padding: '0.5rem 1rem',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Complimentary White-Glove Installation · Orders Above ₹1,50,000
      </div>

      <header
        className="sticky top-0 z-50 transition-all duration-500"
        style={{
          background: navBg,
          borderBottom: `1px solid ${navBorder}`,
          backdropFilter: scrolled ? 'blur(20px) saturate(1.5)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-[68px]">

            {/* Logo */}
            <Link
              href="/"
              className="brand-logo"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.2rem',
                fontWeight: 400,
                letterSpacing: '0.18em',
                color: 'var(--ivory)',
                textTransform: 'uppercase',
                textDecoration: 'none',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ color: 'var(--gold-light)', fontSize: '0.7rem' }}>✦</span>
              Royce
              <span style={{ color: 'rgba(250,247,240,0.3)', fontWeight: 300 }}>·</span>
              Lighting
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) =>
                link.hasMega ? (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => setMegaOpen(true)}
                    onMouseLeave={() => setMegaOpen(false)}
                  >
                    <button
                      className="nav-item flex items-center gap-1"
                      style={{ color: 'rgba(250,247,240,0.65)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      {link.label}
                      <ChevronDown
                        size={10}
                        style={{
                          transition: 'transform 0.3s ease',
                          transform: megaOpen ? 'rotate(180deg)' : 'rotate(0)',
                        }}
                      />
                    </button>

                    {/* Mega Menu */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        marginTop: '1.5rem',
                        width: 'min(840px, calc(100vw - 3rem))',
                        maxHeight: 'calc(100vh - 150px)',
                        overflowY: 'auto',
                        background: 'linear-gradient(180deg, rgba(6,47,36,0.98), rgba(15,12,8,0.97))',
                        border: '1px solid rgba(0,96,57,0.28)',
                        backdropFilter: 'blur(24px)',
                        padding: '2rem',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(138px, 1fr))',
                        gap: '1rem',
                        opacity: megaOpen ? 1 : 0,
                        visibility: megaOpen ? 'visible' : 'hidden',
                        transition: 'opacity 0.25s ease, visibility 0.25s ease, transform 0.25s ease',
                        transform: megaOpen
                          ? 'translateX(-50%) translateY(0)'
                          : 'translateX(-50%) translateY(-8px)',
                        boxShadow: '0 40px 80px rgba(8,6,4,0.6)',
                      }}
                    >
                      {collectionItems.map((col) => (
                        <Link
                          key={col.href}
                          href={col.href}
                          style={{ textDecoration: 'none' }}
                          onClick={() => setMegaOpen(false)}
                        >
                          <div
                            style={{
                              position: 'relative',
                              aspectRatio: '4/3',
                              overflow: 'hidden',
                              marginBottom: '0.6rem',
                            }}
                          >
                            <img
                              src={col.image}
                              alt={col.label}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.5s ease',
                                filter: 'brightness(0.7)',
                              }}
                              onMouseEnter={(e) => { (e.target as HTMLImageElement).style.transform = 'scale(1.08)'; }}
                              onMouseLeave={(e) => { (e.target as HTMLImageElement).style.transform = 'scale(1)'; }}
                            />
                          </div>
                          <p
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: '0.62rem',
                              fontWeight: 500,
                              letterSpacing: '0.18em',
                              textTransform: 'uppercase',
                              color: 'var(--ivory)',
                              marginBottom: '0.2rem',
                            }}
                          >
                            {col.label}
                          </p>
                          <p
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: '0.58rem',
                              letterSpacing: '0.1em',
                              color: 'rgba(250,247,240,0.35)',
                            }}
                          >
                            {col.desc}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="nav-item"
                    style={{ color: 'rgba(250,247,240,0.65)', textDecoration: 'none' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ivory)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,247,240,0.65)')}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">

              {/* Search */}
              <button
                className="btn-icon"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <Search size={16} strokeWidth={1.5} />
              </button>

              {/* Cart */}
              <button
                className="btn-icon relative"
                onClick={() => dispatch(openCartDrawer())}
                aria-label="Cart"
              >
                <ShoppingBag size={16} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--rolex-green), var(--forest))',
                      color: 'var(--ivory)',
                      border: '1px solid rgba(228,199,124,0.45)',
                      fontSize: '0.5rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Auth */}
              {token ? (
                <div className="relative group hidden md:block">
                  <button
                    className="btn-icon"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: 'auto', padding: '0 0.75rem' }}
                  >
                    <User size={14} strokeWidth={1.5} />
                    <span style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(250,247,240,0.6)' }}>
                      {user?.name?.split(' ')[0]}
                    </span>
                  </button>
                  <div
                    className="absolute right-0 top-full mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                    style={{
                      background: 'linear-gradient(180deg, rgba(6,47,36,0.98), rgba(15,12,8,0.97))',
                      border: '1px solid rgba(0,96,57,0.25)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 24px 48px rgba(8,6,4,0.5)',
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
                          fontSize: '0.62rem',
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          color: 'rgba(250,247,240,0.5)',
                          textDecoration: 'none',
                          borderBottom: '1px solid rgba(250,247,240,0.06)',
                          transition: 'color 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,247,240,0.5)')}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => dispatch(logout())}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.85rem 1.25rem',
                        fontSize: '0.62rem',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: 'rgba(220,100,100,0.7)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.15s',
                        display: 'block',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(220,100,100,0.7)')}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => dispatch(openAuthModal('login'))}
                  className="hidden md:inline-flex btn-outline ml-1"
                  style={{ padding: '0.5rem 1.25rem', fontSize: '0.58rem' }}
                >
                  Sign In
                </button>
              )}

              {/* Mobile hamburger */}
              <button
                className="md:hidden btn-icon"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={16} strokeWidth={1.5} /> : <Menu size={16} strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            style={{
              background: 'linear-gradient(180deg, rgba(6,47,36,0.98), rgba(15,12,8,0.98))',
              borderTop: '1px solid rgba(0,96,57,0.24)',
              padding: '1.5rem 1.5rem 2rem',
              animation: 'fadeUp 0.3s ease forwards',
            }}
          >
            {[
              ...collectionItems.map((item) => ({ label: item.label, href: item.href })),
              { label: 'Bespoke', href: '/bespoke' },
              { label: 'About', href: '/about' },
              { label: 'Contact', href: '/contact-us' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'block',
                  padding: '0.85rem 0',
                  fontSize: '0.65rem',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: 'rgba(250,247,240,0.55)',
                  textDecoration: 'none',
                  borderBottom: '1px solid rgba(250,247,240,0.05)',
                  transition: 'color 0.2s ease',
                }}
              >
                {link.label}
              </Link>
            ))}
            {!token && (
              <button
                onClick={() => { dispatch(openAuthModal('login')); setMobileOpen(false); }}
                className="btn-primary w-full mt-6"
                style={{ justifyContent: 'center', fontSize: '0.6rem' }}
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </header>

      {/* Search modal */}
      {searchOpen && (
        <div
          className="drawer-overlay"
          style={{ zIndex: 200 }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            style={{
              position: 'absolute',
              top: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: '640px',
              padding: '0 1.5rem',
              animation: 'scaleIn 0.25s ease forwards',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: 'linear-gradient(180deg, rgba(6,47,36,0.98), rgba(15,12,8,0.97))',
                border: '1px solid rgba(0,96,57,0.3)',
                backdropFilter: 'blur(24px)',
                padding: '1.5rem',
                boxShadow: '0 40px 80px rgba(8,6,4,0.7)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Search size={16} style={{ color: 'var(--gold-light)', flexShrink: 0 }} />
                <input
                  ref={searchRef}
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQ.trim()) {
                      window.location.href = `/shop?search=${encodeURIComponent(searchQ.trim())}`;
                      setSearchOpen(false);
                    }
                    if (e.key === 'Escape') setSearchOpen(false);
                  }}
                  placeholder="Search lighting collections..."
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--ivory)',
                    fontSize: '1rem',
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 300,
                    letterSpacing: '0.04em',
                  }}
                />
                <button onClick={() => setSearchOpen(false)} style={{ color: 'rgba(250,247,240,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>
              <div
                style={{
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(250,247,240,0.06)',
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(250,247,240,0.25)', marginRight: '0.25rem' }}>
                  Browse:
                </span>
                {browseItems.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    onClick={() => setSearchOpen(false)}
                    style={{
                      fontSize: '0.58rem',
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: 'rgba(250,247,240,0.4)',
                      textDecoration: 'none',
                      padding: '0.25rem 0.6rem',
                      border: '1px solid rgba(250,247,240,0.08)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.borderColor = 'rgba(0,96,57,0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(250,247,240,0.4)'; e.currentTarget.style.borderColor = 'rgba(250,247,240,0.08)'; }}
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
