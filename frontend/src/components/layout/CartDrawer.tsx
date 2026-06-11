'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToast, closeCartDrawer } from '../../store/slices/uiSlice';
import {
  fetchCartThunk,
  removeFromCartThunk,
  updateCartItemThunk,
  selectCartTotal,
} from '../../store/slices/cartSlice';

const FREE_THRESHOLD = 150000;

export function CartDrawer() {
  const dispatch = useAppDispatch();
  const { cartDrawerOpen } = useAppSelector((s) => s.ui);
  const { items } = useAppSelector((s) => s.cart);
  const { token } = useAppSelector((s) => s.auth);
  const subtotal = useAppSelector(selectCartTotal);
  const imageBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

  useEffect(() => {
    if (cartDrawerOpen && token) dispatch(fetchCartThunk(token));
  }, [cartDrawerOpen, token, dispatch]);

  useEffect(() => {
    if (cartDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [cartDrawerOpen]);

  if (!cartDrawerOpen) return null;

  const freeShippingLeft = Math.max(0, FREE_THRESHOLD - subtotal);
  const freeShippingPct = Math.min(100, (subtotal / FREE_THRESHOLD) * 100);

  return (
    <>
      {/* Overlay */}
      <div className="drawer-overlay" onClick={() => dispatch(closeCartDrawer())} />

      {/* Panel */}
      <div className="drawer-panel">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem 1.75rem',
            borderBottom: '1px solid rgba(250,247,240,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShoppingBag size={16} style={{ color: 'var(--gold-light)' }} strokeWidth={1.5} />
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.62rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'var(--ivory)',
              }}
            >
              Cart
            </span>
            {items.length > 0 && (
              <span
                style={{
                  background: 'linear-gradient(135deg, var(--rolex-green), var(--forest))',
                  color: 'var(--ivory)',
                  border: '1px solid rgba(228,199,124,0.35)',
                  fontSize: '0.52rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.45rem',
                  letterSpacing: '0.05em',
                }}
              >
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={() => dispatch(closeCartDrawer())}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(250,247,240,0.4)',
              padding: '0.25rem',
              transition: 'color 0.2s ease',
              display: 'flex',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ivory)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,247,240,0.4)')}
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Free shipping bar */}
        {subtotal > 0 && (
          <div style={{ padding: '0.875rem 1.75rem', borderBottom: '1px solid rgba(0,96,57,0.18)', background: 'rgba(0,96,57,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(250,247,240,0.4)' }}>
                {freeShippingLeft > 0
                  ? `₹${freeShippingLeft.toLocaleString('en-IN')} away from free installation`
                  : '✦ Free installation unlocked'}
              </span>
            </div>
            <div style={{ height: '2px', background: 'rgba(250,247,240,0.08)', borderRadius: '1px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${freeShippingPct}%`,
                  background: 'linear-gradient(90deg, var(--rolex-green), var(--gold-light))',
                  transition: 'width 0.6s ease',
                  borderRadius: '1px',
                }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.75rem' }}>
          {items.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                minHeight: '300px',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  border: '1px solid rgba(0,96,57,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                <ShoppingBag size={24} style={{ color: 'rgba(0,96,57,0.5)' }} strokeWidth={1} />
              </div>
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.2rem',
                  fontWeight: 400,
                  color: 'rgba(250,247,240,0.6)',
                  fontStyle: 'italic',
                }}
              >
                Your cart is empty
              </p>
              <p style={{ fontSize: '0.72rem', color: 'rgba(250,247,240,0.3)', letterSpacing: '0.06em', textAlign: 'center' }}>
                Discover our handcrafted lighting collections
              </p>
              <Link
                href="/shop"
                onClick={() => dispatch(closeCartDrawer())}
                className="btn-outline"
                style={{ fontSize: '0.58rem', padding: '0.75rem 1.75rem', marginTop: '0.5rem' }}
              >
                Explore Collections
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {items.map((item, idx) => {
                const imageUrl = item.image?.startsWith('http') ? item.image : `${imageBase}${item.image}`;
                return (
                  <div
                    key={`${item.productId}-${item.color}`}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      padding: '1.25rem 0',
                      borderBottom: '1px solid rgba(250,247,240,0.06)',
                      animation: `fadeUp 0.4s ease ${idx * 0.06}s both`,
                    }}
                  >
                    {/* Image */}
                    <div
                      style={{
                        position: 'relative',
                        width: '72px',
                        height: '80px',
                        flexShrink: 0,
                        overflow: 'hidden',
                        background: 'linear-gradient(180deg, var(--forest-2), var(--charcoal-3))',
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
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '0.75rem',
                          fontWeight: 400,
                          color: 'var(--ivory)',
                          marginBottom: '0.25rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.name}
                      </p>
                      {item.color && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, border: '1px solid rgba(250,247,240,0.15)' }} />
                          <span style={{ fontSize: '0.58rem', color: 'rgba(250,247,240,0.35)', letterSpacing: '0.1em' }}>{item.color}</span>
                        </div>
                      )}
                      <p
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: '0.9rem',
                          color: 'var(--gold)',
                          marginBottom: '0.75rem',
                        }}
                      >
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                          <button
                            className="qty-btn"
                            onClick={() => token && dispatch(updateCartItemThunk({ token, productId: item.productId, quantity: item.quantity - 1, color: item.color, size: item.size }))
                              .unwrap()
                              .catch((message) => dispatch(addToast({ message: String(message), type: 'error' })))}
                            style={{ width: 28, height: 28, fontSize: '0.8rem' }}
                          >
                            −
                          </button>
                          <span
                            style={{
                              width: 32,
                              textAlign: 'center',
                              fontSize: '0.75rem',
                              fontFamily: "'DM Sans', sans-serif",
                              color: 'var(--ivory)',
                            }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            className="qty-btn"
                            onClick={() => token && dispatch(updateCartItemThunk({ token, productId: item.productId, quantity: item.quantity + 1, color: item.color, size: item.size }))
                              .unwrap()
                              .catch((message) => dispatch(addToast({ message: String(message), type: 'error' })))}
                            style={{ width: 28, height: 28, fontSize: '0.8rem' }}
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => token && dispatch(removeFromCartThunk({ token, productId: item.productId, color: item.color }))}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'rgba(250,247,240,0.25)',
                            transition: 'color 0.2s ease',
                            padding: '0.25rem',
                            display: 'flex',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,247,240,0.25)')}
                        >
                          <Trash2 size={13} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            style={{
              padding: '1.5rem 1.75rem',
              borderTop: '1px solid rgba(250,247,240,0.08)',
              background: 'rgba(0,96,57,0.12)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(250,247,240,0.4)' }}>
                Subtotal
              </span>
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.4rem',
                  fontWeight: 400,
                  color: 'var(--ivory)',
                }}
              >
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={() => dispatch(closeCartDrawer())}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', gap: '0.75rem', padding: '1rem' }}
            >
              Proceed to Checkout
              <ArrowRight size={14} />
            </Link>
            <button
              onClick={() => dispatch(closeCartDrawer())}
              style={{
                width: '100%',
                marginTop: '0.75rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.6rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(250,247,240,0.3)',
                padding: '0.5rem',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(250,247,240,0.6)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,247,240,0.3)')}
            >
              Continue Browsing
            </button>
          </div>
        )}
      </div>
    </>
  );
}
