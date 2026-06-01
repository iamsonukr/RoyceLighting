'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MapPin, CreditCard, CheckCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectCartTotal, clearCartLocal } from '../../store/slices/cartSlice';
import { addToast } from '../../store/slices/uiSlice';
import { api } from '@/lib/api';

declare global { interface Window { Razorpay: any } }

const DELIVERY_FEE = 60;
const FREE_THRESHOLD = 999;

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Delhi','Jammu and Kashmir',
  'Ladakh','Lakshadweep','Puducherry',
];

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items } = useAppSelector((s) => s.cart);
  const { token, user } = useAppSelector((s) => s.auth);
  const subtotal = useAppSelector(selectCartTotal);
  const deliveryFee = subtotal >= FREE_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'address' | 'payment' | 'success'>('address');

  const [address, setAddress] = useState({
    addressLineOne: '', addressLineTwo: '', city: '',
    state: 'Maharashtra', pinCode: '', country: 'India',
    phone: '', landmark: '',
  });

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  if (!token || items.length === 0) {
    router.replace('/cart');
    return null;
  }

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Create Razorpay order
      const { data: rzData } = await api.post('/orders/create-razorpay-order', { amount: total });
      const { orderId: razorpayOrderId, amount: rzAmount } = rzData.data;

      // 2. Open Razorpay checkout
      const rzOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: rzAmount,
        currency: 'INR',
        name: 'Royce Lighting',
        description: `Order of ${items.length} item(s)`,
        order_id: razorpayOrderId,
        prefill: { name: user?.name, email: user?.email, contact: address.phone },
        theme: { color: '#b96514' },
        handler: async (response: any) => {
          try {
            // 3. Place order in backend
            await api.post('/orders/place', {
              items: items.map((i) => ({
                productId: i.productId,
                name: i.name,
                price: i.price,
                quantity: i.quantity,
                color: i.color,
                size: i.size,
                image: i.image,
                itemTotal: i.price * i.quantity,
              })),
              amount: total,
              deliveryFees: deliveryFee,
              address,
              razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            dispatch(clearCartLocal());
            setStep('success');
          } catch {
            dispatch(addToast({ message: 'Order placement failed. Contact support.', type: 'error' }));
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rz = new window.Razorpay(rzOptions);
      rz.open();
    } catch (err: any) {
      dispatch(addToast({ message: err.response?.data?.message || 'Payment failed', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-gray-900 mb-3">Order Placed!</h2>
        <p className="text-gray-500 mb-2">Thank you for shopping with Royce Lighting.</p>
        <p className="text-gray-500 mb-8">A confirmation email has been sent to your inbox.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => router.push('/my-orders')} className="btn-primary">Track My Order</button>
          <button onClick={() => router.push('/shop')} className="btn-outline">Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-3 mb-10">
        {[
          { key: 'address', icon: MapPin, label: 'Delivery Address' },
          { key: 'payment', icon: CreditCard, label: 'Payment' },
        ].map(({ key, icon: Icon, label }, idx) => (
          <div key={key} className="flex items-center gap-2">
            {idx > 0 && <div className={`h-px w-12 ${step === 'payment' ? 'bg-brand-600' : 'bg-gray-200'}`} />}
            <button
              onClick={() => key === 'address' && setStep('address')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                step === key ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {step === 'address' && (
            <form onSubmit={handleAddressSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
              <h2 className="font-semibold text-gray-900 text-lg">Delivery Address</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
                <input required value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="+91 98765 43210" maxLength={15}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 1 *</label>
                <input required value={address.addressLineOne}
                  onChange={(e) => setAddress({ ...address, addressLineOne: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="House no., Street name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 2</label>
                <input value={address.addressLineTwo}
                  onChange={(e) => setAddress({ ...address, addressLineTwo: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Apartment, area, colony (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                  <input required value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">PIN Code *</label>
                  <input required value={address.pinCode}
                    onChange={(e) => setAddress({ ...address, pinCode: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="400001" maxLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">State *</label>
                <select required value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Landmark</label>
                <input value={address.landmark}
                  onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Near landmark (optional)"
                />
              </div>

              <button type="submit" className="w-full btn-primary">
                Continue to Payment
              </button>
            </form>
          )}

          {step === 'payment' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 text-lg mb-5">Confirm & Pay</h2>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
                <p className="font-medium text-gray-700 mb-1">Delivering to:</p>
                <p className="text-gray-500">
                  {address.addressLineOne}{address.addressLineTwo && `, ${address.addressLineTwo}`}, {address.city}, {address.state} - {address.pinCode}
                </p>
                <p className="text-gray-500">Ph: {address.phone}</p>
                <button onClick={() => setStep('address')} className="text-brand-600 text-xs hover:underline mt-1">
                  Change Address
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard size={18} className="text-blue-600" />
                  <p className="font-medium text-blue-800 text-sm">Secure Payment via Razorpay</p>
                </div>
                <p className="text-xs text-blue-600">Supports UPI, Cards, Net Banking & Wallets</p>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 text-base py-4"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                Pay ₹{total} Securely
              </button>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 h-fit sticky top-24">
          <h2 className="font-semibold text-gray-900 mb-5">Order Summary</h2>
          <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={`${item.productId}-${item.color}`} className="flex justify-between text-sm">
                <span className="text-gray-600 truncate flex-1">{item.name} × {item.quantity}</span>
                <span className="font-medium ml-3 shrink-0">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span><span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
              <span>Total</span><span>₹{total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
