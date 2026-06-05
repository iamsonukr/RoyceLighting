'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ArrowRight, ChevronDown, Truck, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { openAuthModal } from '@/store/slices/uiSlice';
import { fetchOrdersAPI } from '@/lib/api';

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: any; progress: number }> = {
  placed:     { label: 'Order Placed',  className: 'status-placed',     icon: Clock,          progress: 20  },
  confirmed:  { label: 'Confirmed',     className: 'status-placed',     icon: CheckCircle,    progress: 30  },
  processing: { label: 'Processing',    className: 'status-processing',  icon: AlertCircle,    progress: 40  },
  shipped:    { label: 'In Transit',    className: 'status-shipped',     icon: Truck,          progress: 70  },
  'out for delivery': { label: 'Out for Delivery', className: 'status-shipped', icon: Truck, progress: 85 },
  delivered:  { label: 'Delivered',     className: 'status-delivered',   icon: CheckCircle,    progress: 100 },
  cancelled:  { label: 'Cancelled',     className: 'status-cancelled',   icon: XCircle,        progress: 0   },
};

export default function MyOrdersPage() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((s) => s.auth);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetchOrdersAPI(token)
      .then((data) => setOrders(data.orders || data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [token]);

  const imageBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

  if (!token) {
    return (
      <EmptyWrapper>
        <div style={{ width: 80, height: 80, border: '1px solid rgba(0,96,57,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Package size={32} strokeWidth={1} style={{ color: 'rgba(0,96,57,0.4)' }} />
        </div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.8rem', fontWeight: 300, fontStyle: 'italic', color: 'rgba(250,247,240,0.6)' }}>
          Sign in to view your orders
        </h2>
        <button className="btn-primary" style={{ fontSize: '0.6rem' }} onClick={() => dispatch(openAuthModal('login'))}>
          Sign In
        </button>
      </EmptyWrapper>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          background:
            'linear-gradient(180deg, var(--forest-2) 0%, var(--charcoal) 35%, var(--coffee) 100%)',
          minHeight: '100vh',
        }}
      >
        <PageHeader />
        <div className="max-w-4xl mx-auto" style={{ padding: '3rem 1.5rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 140, marginBottom: '1px', background: undefined }} />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyWrapper>
        <div style={{ width: 80, height: 80, border: '1px solid rgba(0,96,57,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Package size={32} strokeWidth={1} style={{ color: 'rgba(0,96,57,0.4)' }} />
        </div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.8rem', fontWeight: 300, fontStyle: 'italic', color: 'rgba(250,247,240,0.6)' }}>
          No orders yet
        </h2>
        <p style={{ fontSize: '0.72rem', color: 'rgba(250,247,240,0.3)', letterSpacing: '0.06em' }}>
          Discover our handcrafted lighting collections
        </p>
        <Link href="/shop" className="btn-primary" style={{ fontSize: '0.6rem' }}>
          Explore Collections <ArrowRight size={14} />
        </Link>
      </EmptyWrapper>
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
      <PageHeader />

      <div className="max-w-4xl mx-auto" style={{ padding: '3rem 1.5rem 6rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {orders.map((order, oi) => {
            const statusKey = String(order.status || 'placed').toLowerCase();
            const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.placed;
            const StatusIcon = status.icon;
            const isExpanded = expandedOrder === order._id;
            const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric',
            });
            const orderTotal = order.totalAmount || order.items?.reduce((s: number, i: any) => s + (i.price || 0) * i.quantity, 0) || 0;

            return (
              <div
                key={order._id}
                style={{
                  background: 'linear-gradient(180deg, rgba(6,47,36,0.64), var(--charcoal-2))',
                  border: '1px solid rgba(0,96,57,0.2)',
                  marginBottom: '1px',
                  animation: `fadeUp 0.5s ease ${oi * 0.08}s both`,
                  transition: 'border-color 0.3s ease',
                  borderColor: isExpanded ? 'rgba(228,199,124,0.34)' : 'rgba(0,96,57,0.2)',
                }}
              >
                {/* Order header */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '1.5rem',
                    padding: '1.75rem 2rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  {/* Status icon */}
                  <div
                    style={{
                      width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: order.status === 'delivered' ? 'rgba(0,96,57,0.18)' : order.status === 'cancelled' ? 'rgba(239,68,68,0.1)' : 'rgba(0,96,57,0.12)',
                      border: `1px solid ${order.status === 'delivered' ? 'rgba(228,199,124,0.34)' : order.status === 'cancelled' ? 'rgba(239,68,68,0.25)' : 'rgba(0,96,57,0.24)'}`,
                    }}
                  >
                    <StatusIcon size={18} strokeWidth={1.5} style={{ color: order.status === 'delivered' ? 'var(--gold-light)' : order.status === 'cancelled' ? '#fca5a5' : 'var(--gold-light)' }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ivory)' }}>
                        Order #{String(order._id).slice(-8).toUpperCase()}
                      </span>
                      <span className={`label-text ${status.className}`} style={{ padding: '0.15rem 0.6rem', fontSize: '0.52rem' }}>
                        {status.label}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.65rem', color: 'rgba(250,247,240,0.35)', letterSpacing: '0.06em' }}>
                      {orderDate} · {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', color: 'var(--ivory)', marginBottom: '0.25rem' }}>
                      ₹{orderTotal.toLocaleString('en-IN')}
                    </p>
                    <ChevronDown
                      size={14}
                      strokeWidth={1.5}
                      style={{
                        color: 'rgba(250,247,240,0.3)', transition: 'transform 0.3s ease',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                      }}
                    />
                  </div>
                </button>

                {/* Progress bar (not for cancelled) */}
                {order.status !== 'cancelled' && (
                  <div style={{ padding: '0 2rem 1.5rem' }}>
                    <div style={{ height: 2, background: 'rgba(250,247,240,0.06)', borderRadius: 1, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${status.progress}%`,
                          background: order.status === 'delivered'
                            ? 'linear-gradient(90deg,var(--rolex-green),var(--gold-light))'
                            : 'linear-gradient(90deg,var(--rolex-green),var(--gold-light))',
                          borderRadius: 1,
                          transition: 'width 0.8s ease',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                      {['Placed', 'Processing', 'Shipped', 'Delivered'].map((s, i) => (
                        <span key={s} style={{ fontSize: '0.52rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: status.progress > i * 33 ? 'rgba(250,247,240,0.5)' : 'rgba(250,247,240,0.15)' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid rgba(250,247,240,0.06)', padding: '1.75rem 2rem', animation: 'fadeUp 0.3s ease forwards' }}>
                    {/* Items */}
                    {order.items?.map((item: any, ii: number) => {
                      const imgUrl = item.product?.image?.startsWith('http') ? item.product?.image : `${imageBase}${item.product?.image}`;
                      return (
                        <div key={ii} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(250,247,240,0.05)' }}>
                          <div style={{ width: 56, height: 64, background: 'linear-gradient(180deg, var(--forest-2), var(--charcoal-3))', flexShrink: 0, overflow: 'hidden' }}>
                            {item.product?.image && <img src={imgUrl} alt={item.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--ivory)', marginBottom: '0.2rem' }}>
                              {item.product?.name || 'Product'}
                            </p>
                            {item.color && <p style={{ fontSize: '0.58rem', color: 'rgba(250,247,240,0.3)', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Finish: {item.color}</p>}
                            <p style={{ fontSize: '0.62rem', color: 'rgba(250,247,240,0.35)', letterSpacing: '0.05em' }}>Qty: {item.quantity}</p>
                          </div>
                          <p style={{ fontSize: '0.82rem', color: 'var(--ivory)', flexShrink: 0 }}>₹{((item.price || item.product?.sellingPrice || 0) * item.quantity).toLocaleString('en-IN')}</p>
                        </div>
                      );
                    })}

                    {/* Address */}
                    {order.shippingAddress && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <p style={{ fontSize: '0.55rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gold-light)', marginBottom: '0.6rem' }}>
                          Delivery Address
                        </p>
                        <p style={{ fontSize: '0.7rem', color: 'rgba(250,247,240,0.4)', lineHeight: 1.7, letterSpacing: '0.04em' }}>
                          {order.shippingAddress.fullName} · {order.shippingAddress.phone}<br />
                          {order.shippingAddress.addressLine1}{order.shippingAddress.addressLine2 ? ', ' + order.shippingAddress.addressLine2 : ''}<br />
                          {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PageHeader() {
  return (
    <div
      style={{
        padding: '5rem 1.5rem 3rem',
        background:
          'radial-gradient(circle at 82% 18%, rgba(199,164,90,0.12), transparent 28%), linear-gradient(135deg, var(--forest), var(--charcoal-2) 60%, var(--coffee))',
        borderBottom: '1px solid rgba(0,96,57,0.28)',
      }}
    >
      <div className="max-w-4xl mx-auto">
        <p className="overline-text" style={{ marginBottom: '0.875rem' }}>Account</p>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, fontStyle: 'italic', color: 'var(--ivory)' }}>
          Your Orders
        </h1>
      </div>
    </div>
  );
}

function EmptyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        padding: '2rem',
        background: 'linear-gradient(180deg, var(--forest-2), var(--charcoal) 55%, var(--coffee))',
        textAlign: 'center',
      }}
    >
      {children}
    </div>
  );
}
