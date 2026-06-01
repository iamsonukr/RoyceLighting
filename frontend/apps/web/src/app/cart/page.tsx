'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchCartThunk,
  removeFromCartThunk,
  addToCartThunk,
  selectCartTotal,
} from '../../store/slices/cartSlice';
import { openAuthModal } from '../../store/slices/uiSlice';

const DELIVERY_FEE = 60;
const FREE_DELIVERY_THRESHOLD = 999;

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.cart);
  const { token } = useAppSelector((s) => s.auth);
  const subtotal = useAppSelector(selectCartTotal);
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (token) dispatch(fetchCartThunk(token));
  }, [token, dispatch]);

  if (!token) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={56} className="mx-auto text-gray-300 mb-5" />
        <h2 className="font-serif text-2xl font-bold text-gray-900 mb-3">Your cart is waiting</h2>
        <p className="text-gray-500 mb-8">Sign in to view your cart and continue shopping.</p>
        <button onClick={() => dispatch(openAuthModal('login'))} className="btn-primary">
          Sign In
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={56} className="mx-auto text-gray-300 mb-5" />
        <h2 className="font-serif text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Discover our handcrafted pieces and add your favourites.</p>
        <Link href="/shop" className="btn-primary">
          Shop Now
        </Link>
      </div>
    );
  }

  const imageBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace('/api', '');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const imageUrl = item.image?.startsWith('http') ? item.image : `${imageBase}${item.image}`;
            return (
              <div key={`${item.productId}-${item.color}`} className="flex gap-4 bg-white rounded-xl p-4 border border-gray-100">
                {/* Image */}
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                  {item.image ? (
                    <Image src={imageUrl} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">🛍️</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
                  {item.color && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-gray-500">{item.color}</span>
                    </div>
                  )}
                  <p className="text-brand-600 font-bold mt-1">₹{item.price}</p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => dispatch(addToCartThunk({ token, productId: item.productId, quantity: -1, color: item.color }))}
                        className="w-7 h-7 rounded-md border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => dispatch(addToCartThunk({ token, productId: item.productId, quantity: 1, color: item.color }))}
                        className="w-7 h-7 rounded-md border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-colors"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900">₹{item.price * item.quantity}</span>
                      <button
                        onClick={() => dispatch(removeFromCartThunk({ token, productId: item.productId, color: item.color }))}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 text-lg mb-5">Order Summary</h2>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              {subtotal < FREE_DELIVERY_THRESHOLD && (
                <p className="text-xs text-brand-600 bg-brand-50 rounded-lg px-3 py-2">
                  Add ₹{FREE_DELIVERY_THRESHOLD - subtotal} more for free delivery!
                </p>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span className="text-lg">₹{total}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full btn-primary flex items-center justify-center gap-2 text-base"
            >
              Proceed to Checkout <ArrowRight size={18} />
            </Link>

            <Link href="/shop" className="block text-center text-sm text-brand-600 hover:underline mt-4">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
