'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, CreditCard, MapPin, Package, Lock, ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCartThunk, clearCart, selectCartTotal } from '@/store/slices/cartSlice';
import { openAuthModal, addToast } from '@/store/slices/uiSlice';
import { createRazorpayOrderAPI, placeOrderAPI } from '@/lib/api';

const STEPS = [
  { id: 1, label: 'Address', icon: MapPin },
  { id: 2, label: 'Review', icon: Package },
  { id: 3, label: 'Payment', icon: CreditCard },
];

interface AddressForm {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
}

const emptyAddress: AddressForm = {
  fullName: '', phone: '', addressLine1: '', addressLine2: '',
  city: '', state: '', pincode: '',
};

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((s) => s.auth);
  const { items } = useAppSelector((s) => s.cart);
  const subtotal = useAppSelector(selectCartTotal);

  const [step, setStep] = useState(1);
  const [cartReady, setCartReady] = useState(false);
  const [address, setAddress] = useState<AddressForm>(emptyAddress);
  const [errors, setErrors] = useState<Partial<AddressForm>>({});
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<{ orderId: string } | null>(null);

  const imageBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

  useEffect(() => {
    if (!token) return;
    setCartReady(false);
    dispatch(fetchCartThunk(token)).finally(() => setCartReady(true));
  }, [token, dispatch]);

  if (!token) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, var(--forest-2), var(--charcoal) 55%, var(--coffee))',
          gap: '1.5rem',
          padding: '2rem',
        }}
      >
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2rem', fontWeight: 300, fontStyle: 'italic', color: 'rgba(250,247,240,0.7)' }}>
          Sign in to checkout
        </h2>
        <button className="btn-primary" onClick={() => dispatch(openAuthModal('login'))} style={{ fontSize: '0.6rem' }}>
          Sign In
        </button>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div
        style={{
          minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, var(--forest-2), var(--charcoal) 55%, var(--coffee))',
          gap: '1.5rem',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 80, height: 80, borderRadius: '50%', background: 'rgba(0,96,57,0.22)',
            border: '1px solid rgba(228,199,124,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'scaleIn 0.5s ease forwards',
          }}
        >
          <Check size={32} style={{ color: 'var(--gold-light)' }} strokeWidth={1.5} />
        </div>
        <p className="overline-text">Confirmed</p>
        <h2
          style={{
            fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.8rem,4vw,2.8rem)',
            fontWeight: 300, fontStyle: 'italic', color: 'var(--ivory)',
          }}
        >
          Your Order is Placed
        </h2>
        <p style={{ fontSize: '0.72rem', color: 'rgba(250,247,240,0.4)', letterSpacing: '0.08em', maxWidth: 400, lineHeight: 1.8 }}>
          Order ID: <span style={{ color: 'var(--gold)' }}>{orderPlaced.orderId}</span><br />
          Our team will contact you within 24 hours to schedule white-glove delivery and installation.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/my-orders" className="btn-primary" style={{ fontSize: '0.6rem' }}>
            Track Your Order <ArrowRight size={14} />
          </Link>
          <Link href="/shop" className="btn-outline" style={{ fontSize: '0.6rem' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (!cartReady) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, var(--forest-2), var(--charcoal) 55%, var(--coffee))',
          gap: '1rem',
          padding: '2rem',
        }}
      >
        <p className="overline-text">Loading Cart</p>
        <p style={{ fontSize: '0.72rem', color: 'rgba(250,247,240,0.4)', letterSpacing: '0.08em' }}>
          Preparing your checkout...
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, var(--forest-2), var(--charcoal) 55%, var(--coffee))',
          gap: '1.25rem',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2rem', fontWeight: 300, fontStyle: 'italic', color: 'rgba(250,247,240,0.7)' }}>
          Your cart is empty
        </h2>
        <p style={{ fontSize: '0.75rem', color: 'rgba(250,247,240,0.35)', letterSpacing: '0.06em' }}>
          Add a lighting piece before starting checkout.
        </p>
        <Link href="/shop" className="btn-primary" style={{ fontSize: '0.6rem' }}>
          Explore Collections <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  const validateAddress = (): boolean => {
    const errs: Partial<AddressForm> = {};
    if (!address.fullName.trim()) errs.fullName = 'Required';
    if (!address.phone.trim() || !/^\d{10}$/.test(address.phone)) errs.phone = 'Enter valid 10-digit number';
    if (!address.addressLine1.trim()) errs.addressLine1 = 'Required';
    if (!address.city.trim()) errs.city = 'Required';
    if (!address.state) errs.state = 'Required';
    if (!address.pincode.trim() || !/^\d{6}$/.test(address.pincode)) errs.pincode = 'Enter valid 6-digit pincode';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!validateAddress()) return;
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const loadRazorpayScript = () =>
    new Promise<boolean>((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if ((window as any).Razorpay) return resolve(true);

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const getOrderPayload = (paymentFields: Record<string, string> = {}) => ({
    items: items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      color: item.color || '',
      size: item.size || '',
      image: item.image || '',
      itemTotal: item.price * item.quantity,
    })),
    amount: subtotal,
    totalAmount: subtotal,
    deliveryFees: 0,
    paymentMethod,
    address: {
      fullName: address.fullName,
      addressLineOne: address.addressLine1,
      addressLineTwo: address.addressLine2,
      city: address.city,
      state: address.state,
      pinCode: address.pincode,
      country: 'India',
      phone: address.phone,
    },
    ...paymentFields,
  });

  const collectOnlinePayment = async () => {
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!key) throw new Error('Online payment is not configured');

    const loaded = await loadRazorpayScript();
    if (!loaded) throw new Error('Unable to load payment gateway');

    const razorpayOrder = await createRazorpayOrderAPI(token!, subtotal);
    return new Promise<Record<string, string>>((resolve, reject) => {
      const Razorpay = (window as any).Razorpay;
      const checkout = new Razorpay({
        key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || 'INR',
        name: 'Royce Lighting',
        description: 'Lighting order payment',
        order_id: razorpayOrder.orderId,
        prefill: {
          name: address.fullName,
          contact: address.phone,
        },
        handler: (response: any) => {
          resolve({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
        },
        modal: {
          ondismiss: () => reject(new Error('Payment was cancelled')),
        },
      });

      checkout.open();
    });
  };

  const handlePlaceOrder = async () => {
    if (!token) return;
    if (!items.length) {
      dispatch(addToast({ message: 'Your cart is empty', type: 'error' }));
      return;
    }

    setPlacing(true);
    try {
      const paymentFields = paymentMethod === 'online' ? await collectOnlinePayment() : {};
      const orderData = getOrderPayload(paymentFields);
      const res = await placeOrderAPI(token, orderData);
      dispatch(clearCart());
      setOrderPlaced({ orderId: res.order?._id || res._id || 'RL-' + Date.now() });
      dispatch(addToast({ message: 'Order placed successfully!', type: 'success' }));
    } catch (err: any) {
      dispatch(addToast({ message: err.response?.data?.message || err.message || 'Order failed. Please try again.', type: 'error' }));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div
      style={{
        background:
          'linear-gradient(180deg, var(--forest-2) 0%, var(--charcoal) 34%, var(--coffee) 100%)',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '4rem 1.5rem 3rem',
          background:
            'radial-gradient(circle at 84% 20%, rgba(199,164,90,0.12), transparent 26%), linear-gradient(135deg, var(--forest), var(--charcoal-2) 62%, var(--coffee))',
          borderBottom: '1px solid rgba(0,96,57,0.28)',
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <p className="overline-text" style={{ marginBottom: '0.75rem' }}>Secure Checkout</p>
              <h1
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 'clamp(1.8rem,3.5vw,2.8rem)',
                  fontWeight: 300,
                  fontStyle: 'italic',
                  color: 'var(--ivory)',
                }}
              >
                Complete Your Order
              </h1>
            </div>
            {/* Step indicators */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
              {STEPS.map((s, i) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', cursor: step > s.id ? 'pointer' : 'default',
                    }}
                    onClick={() => { if (step > s.id) setStep(s.id); }}
                  >
                    <div
                      style={{
                        width: 36, height: 36,
                        border: `1px solid ${step === s.id ? 'rgba(228,199,124,0.55)' : step > s.id ? 'rgba(0,96,57,0.45)' : 'rgba(250,247,240,0.12)'}`,
                        background: step === s.id ? 'linear-gradient(135deg, var(--rolex-green), var(--forest))' : step > s.id ? 'rgba(0,96,57,0.16)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {step > s.id
                        ? <Check size={14} style={{ color: 'var(--gold-light)' }} strokeWidth={2} />
                        : <s.icon size={14} style={{ color: step === s.id ? 'var(--ivory)' : 'rgba(250,247,240,0.3)' }} strokeWidth={1.5} />
                      }
                    </div>
                    <span style={{
                      fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase',
                      color: step === s.id ? 'var(--gold-light)' : step > s.id ? 'rgba(228,199,124,0.7)' : 'rgba(250,247,240,0.25)',
                      fontFamily: "'DM Sans',sans-serif",
                    }}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ width: 40, height: 1, background: step > s.id ? 'rgba(0,96,57,0.42)' : 'rgba(250,247,240,0.08)', margin: '0 0.5rem', marginBottom: '1.5rem' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto checkout-layout" style={{ padding: '3rem 1.5rem 6rem', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem', alignItems: 'start' }}>

        {/* Main form area */}
        <div>

          {/* ── STEP 1: ADDRESS ── */}
          {step === 1 && (
            <div style={{ animation: 'fadeUp 0.4s ease forwards' }}>
              <SectionTitle num="01" label="Delivery Address" />

              <div className="checkout-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <LuxuryField
                  label="Full Name" value={address.fullName} error={errors.fullName}
                  onChange={(v) => setAddress({ ...address, fullName: v })}
                  placeholder="As on Aadhaar / ID"
                />
                <LuxuryField
                  label="Phone Number" value={address.phone} error={errors.phone}
                  onChange={(v) => setAddress({ ...address, phone: v })}
                  placeholder="10-digit mobile number"
                />
              </div>

              <LuxuryField
                label="Address Line 1" value={address.addressLine1} error={errors.addressLine1}
                onChange={(v) => setAddress({ ...address, addressLine1: v })}
                placeholder="House / Flat / Building number"
                style={{ marginBottom: '1rem' }}
              />
              <LuxuryField
                label="Address Line 2 (Optional)" value={address.addressLine2}
                onChange={(v) => setAddress({ ...address, addressLine2: v })}
                placeholder="Street, Area, Landmark"
                style={{ marginBottom: '1rem' }}
              />

              <div className="checkout-three-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                <LuxuryField
                  label="City" value={address.city} error={errors.city}
                  onChange={(v) => setAddress({ ...address, city: v })}
                  placeholder="City"
                />
                <div>
                  <label style={labelStyle}>State {errors.state && <span style={{ color: 'rgba(239,68,68,0.8)', marginLeft: '0.4rem' }}>*</span>}</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="input-luxury"
                      style={{ appearance: 'none', cursor: 'pointer', borderColor: errors.state ? 'rgba(239,68,68,0.5)' : undefined }}
                    >
                      <option value="" style={{ background: '#062f24' }}>Select State</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s} style={{ background: '#062f24' }}>{s}</option>)}
                    </select>
                    <ChevronDown size={12} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(250,247,240,0.3)', pointerEvents: 'none' }} />
                  </div>
                </div>
                <LuxuryField
                  label="Pincode" value={address.pincode} error={errors.pincode}
                  onChange={(v) => setAddress({ ...address, pincode: v })}
                  placeholder="6-digit pincode"
                />
              </div>

              <div className="checkout-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(250,247,240,0.3)', textDecoration: 'none', transition: 'color 0.2s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(250,247,240,0.6)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,247,240,0.3)')}
                >
                  <ArrowLeft size={12} /> Back to Cart
                </Link>
                <button onClick={handleNextStep} className="btn-primary" style={{ fontSize: '0.6rem' }}>
                  Continue to Review <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: REVIEW ── */}
          {step === 2 && (
            <div style={{ animation: 'fadeUp 0.4s ease forwards' }}>
              <SectionTitle num="02" label="Review Your Order" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '2.5rem' }}>
                {items.map((item) => {
                  const imageUrl = item.image?.startsWith('http') ? item.image : `${imageBase}${item.image}`;
                  return (
                    <div key={`${item.productId}-${item.color}`}
                      style={{ display: 'flex', gap: '1.25rem', padding: '1.5rem 0', borderBottom: '1px solid rgba(250,247,240,0.06)' }}>
                      <div style={{ position: 'relative', width: 72, height: 80, overflow: 'hidden', background: 'linear-gradient(180deg, var(--forest-2), var(--charcoal-2))', flexShrink: 0 }}>
                        {item.image && <img src={imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--ivory)', marginBottom: '0.3rem' }}>{item.name}</p>
                        {item.color && <p style={{ fontSize: '0.6rem', color: 'rgba(250,247,240,0.3)', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Finish: {item.color}</p>}
                        <p style={{ fontSize: '0.65rem', color: 'rgba(250,247,240,0.35)', letterSpacing: '0.06em' }}>Qty: {item.quantity}</p>
                      </div>
                      <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '1rem', color: 'var(--gold)', flexShrink: 0 }}>
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Address summary */}
              <div style={{ background: 'linear-gradient(180deg, rgba(6,47,36,0.62), var(--charcoal-2))', border: '1px solid rgba(0,96,57,0.24)', padding: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: '0.58rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gold-light)', marginBottom: '0.75rem' }}>Delivering to</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--ivory)', marginBottom: '0.25rem' }}>{address.fullName}</p>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(250,247,240,0.45)', lineHeight: 1.7, letterSpacing: '0.04em' }}>
                      {address.addressLine1}{address.addressLine2 ? ', ' + address.addressLine2 : ''}<br />
                      {address.city}, {address.state} — {address.pincode}<br />
                      {address.phone}
                    </p>
                  </div>
                  <button onClick={() => setStep(1)} style={{ fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold-light)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Edit
                  </button>
                </div>
              </div>

              <div className="checkout-actions" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setStep(1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(250,247,240,0.3)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s ease' }}>
                  <ArrowLeft size={12} /> Back
                </button>
                <button onClick={handleNextStep} className="btn-primary" style={{ fontSize: '0.6rem' }}>
                  Continue to Payment <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: PAYMENT ── */}
          {step === 3 && (
            <div style={{ animation: 'fadeUp 0.4s ease forwards' }}>
              <SectionTitle num="03" label="Payment Method" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                {[
                  { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order is delivered and installed', icon: '💵' },
                  { value: 'online', label: 'Online Payment', desc: 'UPI, Net Banking, Cards via Razorpay', icon: '🔒' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPaymentMethod(opt.value as 'cod' | 'online')}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '1.25rem', padding: '1.5rem',
                      background: paymentMethod === opt.value ? 'rgba(0,96,57,0.18)' : 'linear-gradient(180deg, rgba(6,47,36,0.48), var(--charcoal-2))',
                      border: `1px solid ${paymentMethod === opt.value ? 'rgba(228,199,124,0.4)' : 'rgba(0,96,57,0.18)'}`,
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.25s ease',
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', border: `1px solid ${paymentMethod === opt.value ? 'rgba(228,199,124,0.72)' : 'rgba(250,247,240,0.2)'}`,
                      background: paymentMethod === opt.value ? 'var(--rolex-green)' : 'transparent', flexShrink: 0, marginTop: 2,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease',
                    }}>
                      {paymentMethod === opt.value && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold-light)' }} />}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.72rem', fontWeight: 500, color: paymentMethod === opt.value ? 'var(--ivory)' : 'rgba(250,247,240,0.6)', letterSpacing: '0.08em', marginBottom: '0.3rem', fontFamily: "'DM Sans',sans-serif" }}>
                        {opt.icon} {opt.label}
                      </p>
                      <p style={{ fontSize: '0.65rem', color: 'rgba(250,247,240,0.35)', letterSpacing: '0.04em' }}>{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="checkout-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => setStep(2)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(250,247,240,0.3)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s ease' }}>
                  <ArrowLeft size={12} /> Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="btn-primary"
                  style={{ fontSize: '0.6rem', opacity: placing ? 0.7 : 1 }}
                >
                  {placing ? 'Placing Order...' : 'Confirm & Place Order'}
                  {!placing && <Lock size={13} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="checkout-summary-panel" style={{ position: 'sticky', top: '100px' }}>
          <div style={{ background: 'linear-gradient(180deg, rgba(6,47,36,0.72), var(--charcoal-2))', border: '1px solid rgba(0,96,57,0.24)', padding: '1.75rem' }}>
            <p style={{ fontSize: '0.58rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.5rem' }}>
              Order Summary
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {items.map((item) => (
                <div key={`${item.productId}-${item.color}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.75rem 0', borderBottom: '1px solid rgba(250,247,240,0.05)' }}>
                  <div style={{ flex: 1, paddingRight: '1rem' }}>
                    <p style={{ fontSize: '0.7rem', color: 'rgba(250,247,240,0.7)', lineHeight: 1.4, letterSpacing: '0.03em' }}>{item.name}</p>
                    <p style={{ fontSize: '0.6rem', color: 'rgba(250,247,240,0.3)', marginTop: '0.15rem' }}>× {item.quantity}</p>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--ivory)', flexShrink: 0 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(250,247,240,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'rgba(250,247,240,0.4)', letterSpacing: '0.06em' }}>Subtotal</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--ivory)' }}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'rgba(250,247,240,0.4)', letterSpacing: '0.06em' }}>Installation</span>
                <span style={{ fontSize: '0.78rem', color: subtotal >= 150000 ? 'var(--gold-light)' : 'rgba(250,247,240,0.6)' }}>
                  {subtotal >= 150000 ? 'Complimentary' : 'TBD'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid rgba(250,247,240,0.08)' }}>
                <span style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(250,247,240,0.5)' }}>Total</span>
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.4rem', color: 'var(--ivory)' }}>
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <Lock size={11} style={{ color: 'rgba(250,247,240,0.2)' }} />
              <span style={{ fontSize: '0.58rem', color: 'rgba(250,247,240,0.2)', letterSpacing: '0.12em' }}>
                256-bit SSL Encrypted Checkout
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ── */
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'DM Sans',sans-serif",
  fontSize: '0.58rem',
  fontWeight: 400,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'rgba(250,247,240,0.4)',
  marginBottom: '0.5rem',
};

function LuxuryField({
  label, value, onChange, placeholder, error, style,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; error?: string; style?: React.CSSProperties;
}) {
  return (
    <div style={style}>
      <label style={labelStyle}>
        {label}
        {error && <span style={{ color: 'rgba(239,68,68,0.8)', marginLeft: '0.5rem', textTransform: 'none', letterSpacing: '0', fontStyle: 'italic', fontSize: '0.58rem' }}>{error}</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-luxury"
        style={{ borderColor: error ? 'rgba(239,68,68,0.5)' : undefined }}
      />
    </div>
  );
}

function SectionTitle({ num, label }: { num: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
      <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '0.8rem', color: 'var(--gold-light)', fontWeight: 300 }}>{num}</span>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(0,96,57,0.34), rgba(228,199,124,0.16), transparent)' }} />
      <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.62rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(250,247,240,0.55)', fontWeight: 400 }}>
        {label}
      </h2>
    </div>
  );
}
