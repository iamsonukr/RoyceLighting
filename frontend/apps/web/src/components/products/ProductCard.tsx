'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToCartThunk } from '../../store/slices/cartSlice';
import { openAuthModal, addToast } from '../../store/slices/uiSlice';

interface Product {
  _id: string;
  name: string;
  sellingPrice: number;
  retailPrice: number;
  image?: string;
  images?: string[];
  category: string;
  colors?: string[];
  totalQuantity: number;
  salesCount?: number;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((s) => s.auth);

  const discount = product.retailPrice > product.sellingPrice
    ? Math.round(((product.retailPrice - product.sellingPrice) / product.retailPrice) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!token) {
      dispatch(openAuthModal('login'));
      return;
    }
    const result = await dispatch(addToCartThunk({ token, productId: product._id, quantity: 1 }));
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(addToast({ message: 'Added to cart!', type: 'success' }));
    }
  };

  const productImages = product.images?.length ? product.images : product.image ? [product.image] : [];
  const primaryImage = productImages[0];
  const imageBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace('/api', '');
  const imageUrl = primaryImage?.startsWith('http')
    ? primaryImage
    : `${imageBase}${primaryImage}`;

  return (
    <Link href={`/product/${product._id}`}>
      <div className="group bg-white rounded-xl overflow-hidden card-hover border border-gray-100">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {primaryImage ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-4xl">🛍️</div>
          )}

          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}

          {product.totalQuantity === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-800 text-sm font-semibold px-4 py-2 rounded-full">Out of Stock</span>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={product.totalQuantity === 0}
            className="absolute bottom-3 right-3 bg-brand-600 hover:bg-brand-700 text-white p-2.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0 disabled:opacity-50"
          >
            <ShoppingCart size={16} />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-brand-600 font-medium uppercase tracking-wide mb-1">{product.category}</p>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">{product.name}</h3>

          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">₹{product.sellingPrice}</span>
            {product.retailPrice > product.sellingPrice && (
              <span className="text-xs text-gray-400 line-through">₹{product.retailPrice}</span>
            )}
          </div>

          {product.colors && product.colors.length > 0 && (
            <div className="flex gap-1.5 mt-2">
              {product.colors.slice(0, 4).map((color) => (
                <div
                  key={color}
                  className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
