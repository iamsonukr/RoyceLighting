'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchCartThunk,
  removeFromCartThunk,
  updateCartItemThunk,
  selectCartTotal,
} from '@/store/slices/cartSlice';
import { addToast, openAuthModal } from '@/store/slices/uiSlice';

const FREE_THRESHOLD = 150000;

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((s) => s.cart);
  const { token } = useAppSelector((s) => s.auth);
  const subtotal = useAppSelector(selectCartTotal);
  const freeInstall = subtotal >= FREE_THRESHOLD;
  const imageBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace('/api', '');

  useEffect(() => {
    if (token) dispatch(fetchCartThunk(token));
  }, [token, dispatch]);

  if (!token) {
    return (
      <EmptyState
        icon={<ShoppingBag size={40} strokeWidth={1} style={{ color: 'rgba(0,96,57,0.4)' }} />}
        title="Sign in to view your cart"
        desc="Your saved pieces will appear here."
        action={
          <button className="btn-primary" onClick={() => dispatch(openAuthModal('login'))} style={{ fontSize: '0.6rem' }}>
            Sign In
          </button>
        }
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag size={40} strokeWidth={1} style={{ color: 'rgba(0,96,57,0.4)' }} />}
        title="Your cart is empty"
        desc="Discover our handcrafted lighting collections."
        action={
          <Link href="/shop" className="btn-primary" style={{ fontSize: '0.6rem' }}>
            Explore Collections <ArrowRight size={14} />
          </Link>
        }
      />
    );
  }

  return (
    <div
      style={{
        background:
          'linear-gradient(180deg, var(--forest-2) 0%, var(--charcoal) 35%, var(--coffee) 100%)',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '5rem 1.5rem 3rem',
          background:
            'radial-gradient(circle at 82% 18%, rgba(199,164,90,0.12), transparent 28%), linear-gradient(135deg, var(--forest), var(--charcoal-2) 60%, var(--coffee))',
          borderBottom: '1px solid rgba(0,96,57,0.28)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <p className="overline-text" style={{ marginBottom: '0.875rem' }}>Review</p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              color: 'var(--ivory)',
            }}
          >
            Your Selection
          </h1>
        </div>
      </div>

      <div
        className="max-w-7xl mx-auto cart-layout"
        style={{ padding: '3rem 1.5rem 6rem', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem' }}
      >
        {/* Items */}
        <div>
          {/* Free installation bar */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              background: freeInstall ? 'rgba(0,96,57,0.16)' : 'linear-gradient(180deg, rgba(6,47,36,0.5), var(--charcoal-2))',
              border: `1px solid ${freeInstall ? 'rgba(228,199,124,0.34)' : 'rgba(0,96,57,0.2)'}`,
              marginBottom: '2rem',
            }}
          >
            {freeInstall ? (
                <p style={{ fontSize: '0.65rem', letterSpacing: '0.18em', color: 'var(--gold-light)', textTransform: 'uppercase' }}>
                ✦ White-glove installation included with your order
              </p>
            ) : (
              <div>
                <p style={{ fontSize: '0.62rem', color: 'rgba(250,247,240,0.4)', letterSpacing: '0.1em', marginBottom: '0.6rem' }}>
                  Add ₹{(FREE_THRESHOLD - subtotal).toLocaleString('en-IN')} more for free professional installation
                </p>
                <div style={{ height: '2px', background: 'rgba(250,247,240,0.08)', borderRadius: '1px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, (subtotal / FREE_THRESHOLD) * 100)}%`,
                      background: 'linear-gradient(90deg, var(--rolex-green), var(--gold-light))',
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {items.map((item, i) => {
              const imageUrl = item.image?.startsWith('http') ? item.image : `${imageBase}${item.image}`;
              return (
                <div
                  className="cart-item-row"
                  key={`${item.productId}-${item.color}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr auto',
                    gap: '1.5rem',
                    padding: '2rem 0',
                    borderBottom: '1px solid rgba(250,247,240,0.07)',
                    animation: `fadeUp 0.5s ease ${i * 0.08}s both`,
                  }}
                >
                  {/* Image */}
                  <div
                    style={{
                      position: 'relative',
                      width: 100,
                      height: 112,
                      overflow: 'hidden',
                      background: 'linear-gradient(180deg, var(--forest-2), var(--charcoal-2))',
                      border: '1px solid rgba(0,96,57,0.18)',
                      flexShrink: 0,
                    }}
                  >
                    {item.image ? (
                      <Image src={imageUrl} alt={item.name} fill style={{ objectFit: 'cover' }} />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        💡
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <p
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '1.05rem',
                        fontWeight: 400,
                        fontStyle: 'italic',
                        color: 'var(--ivory)',
                        marginBottom: '0.5rem',
                        lineHeight: 1.3,
                      }}
                    >
                      {item.name}
                    </p>
                    {item.color && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, border: '1px solid rgba(250,247,240,0.15)' }} />
                        <span style={{ fontSize: '0.6rem', color: 'rgba(250,247,240,0.35)', letterSpacing: '0.1em' }}>{item.color}</span>
                      </div>
                    )}
                    <p
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '1.1rem',
                        color: 'var(--gold)',
                        marginBottom: '1.25rem',
                      }}
                    >
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>

                    {/* Qty controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                      <button
                        className="qty-btn"
                        style={{ width: 32, height: 32 }}
                        onClick={() => token && dispatch(updateCartItemThunk({ token, productId: item.productId, quantity: item.quantity - 1, color: item.color, size: item.size }))
                          .unwrap()
                          .catch((message) => dispatch(addToast({ message: String(message), type: 'error' })))}
                      >
                        −
                      </button>
                      <span
                        style={{
                          width: 44,
                          height: 32,
                          textAlign: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.82rem',
                          color: 'var(--ivory)',
                          background: 'rgba(250,247,240,0.03)',
                          borderTop: '1px solid rgba(250,247,240,0.1)',
                          borderBottom: '1px solid rgba(250,247,240,0.1)',
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        className="qty-btn"
                        style={{ width: 32, height: 32 }}
                        onClick={() => token && dispatch(updateCartItemThunk({ token, productId: item.productId, quantity: item.quantity + 1, color: item.color, size: item.size }))
                          .unwrap()
                          .catch((message) => dispatch(addToast({ message: String(message), type: 'error' })))}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Remove */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: '0.25rem' }}>
                    <button
                      onClick={() => token && dispatch(removeFromCartThunk({ token, productId: item.productId, color: item.color }))}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'rgba(250,247,240,0.2)',
                        padding: '0.25rem',
                        transition: 'color 0.2s ease',
                        display: 'flex',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,247,240,0.2)')}
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            href="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '2rem',
              fontSize: '0.6rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(250,247,240,0.3)',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,247,240,0.3)')}
          >
            <ArrowLeft size={12} />
            Continue Browsing
          </Link>
        </div>

        {/* Summary */}
        <div>
          <div
            className="cart-summary-panel"
            style={{
              background: 'linear-gradient(180deg, rgba(6,47,36,0.72), var(--charcoal-2))',
              border: '1px solid rgba(0,96,57,0.24)',
              padding: '2rem',
              position: 'sticky',
              top: '100px',
            }}
          >
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.62rem',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'var(--gold-light)',
                marginBottom: '1.75rem',
              }}
            >
              Order Summary
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'rgba(250,247,240,0.45)', letterSpacing: '0.05em' }}>
                  {items.reduce((s, i) => s + i.quantity, 0)} item{items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--ivory)' }}>
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'rgba(250,247,240,0.45)', letterSpacing: '0.05em' }}>
                  Installation
                </span>
                <span style={{ fontSize: '0.82rem', color: freeInstall ? 'var(--gold-light)' : 'var(--ivory)' }}>
                  {freeInstall ? 'Complimentary' : 'Quoted separately'}
                </span>
              </div>
            </div>

            <div
              style={{
                padding: '1.25rem 0',
                borderTop: '1px solid rgba(250,247,240,0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '1.75rem',
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.62rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(250,247,240,0.55)',
                }}
              >
                Total
              </span>
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.5rem',
                  fontWeight: 400,
                  color: 'var(--ivory)',
                }}
              >
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>

            <Link
              href="/checkout"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', gap: '0.75rem', fontSize: '0.6rem' }}
            >
              Proceed to Checkout
              <ArrowRight size={14} />
            </Link>

            <p style={{ marginTop: '1.25rem', fontSize: '0.6rem', color: 'rgba(250,247,240,0.2)', textAlign: 'center', letterSpacing: '0.08em' }}>
              Secure payment via Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, desc, action }: { icon: React.ReactNode; title: string; desc: string; action: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, var(--forest-2), var(--charcoal) 55%, var(--coffee))',
        gap: '1.25rem',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          border: '1px solid rgba(0,96,57,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.5rem',
        }}
      >
        {icon}
      </div>
      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.75rem',
          fontWeight: 300,
          fontStyle: 'italic',
          color: 'rgba(250,247,240,0.7)',
        }}
      >
        {title}
      </h2>
      <p style={{ fontSize: '0.75rem', color: 'rgba(250,247,240,0.3)', letterSpacing: '0.06em', textAlign: 'center' }}>
        {desc}
      </p>
      {action}
    </div>
  );
}
