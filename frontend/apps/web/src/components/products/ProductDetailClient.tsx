'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, Heart, Share2, Check, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToCartThunk } from '../../store/slices/cartSlice';
import { openAuthModal, addToast } from '../../store/slices/uiSlice';
import Link from 'next/link';

interface ProductDetailClientProps {
  product: any;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((s) => s.auth);

  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const productImages = product.images?.length ? product.images : product.image ? [product.image] : [];
  const [selectedImage, setSelectedImage] = useState(productImages[0] || '');
  const imageBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace('/api', '');
  const getImageUrl = (image?: string) =>
    image?.startsWith('http')
      ? image
      : `${imageBase}${image}`;
  const imageUrl = getImageUrl(selectedImage);

  const discount =
    product.retailPrice > product.sellingPrice
      ? Math.round(((product.retailPrice - product.sellingPrice) / product.retailPrice) * 100)
      : 0;

  const handleAddToCart = async () => {
    if (!token) { dispatch(openAuthModal('login')); return; }
    setAdding(true);
    const result = await dispatch(
      addToCartThunk({ token, productId: product._id, quantity, color: selectedColor }),
    );
    setAdding(false);
    if (result.meta.requestStatus === 'fulfilled') {
      setAdded(true);
      dispatch(addToast({ message: 'Added to cart!', type: 'success' }));
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight size={14} />
        <Link href="/shop" className="hover:text-brand-600">Shop</Link>
        <ChevronRight size={14} />
        <Link href={`/shop?category=${product.category}`} className="hover:text-brand-600 capitalize">{product.category}</Link>
        <ChevronRight size={14} />
        <span className="text-gray-800 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        {/* Image */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50">
            {selectedImage ? (
              <Image src={imageUrl} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-8xl">🛍️</div>
            )}
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                -{discount}% OFF
              </span>
            )}
          </div>
          {productImages.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {productImages.map((image: string, index: number) => (
                <button
                  key={`${image}-${index}`}
                  onClick={() => setSelectedImage(image)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 bg-gray-50 transition-colors ${
                    selectedImage === image ? 'border-brand-600' : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <Image src={getImageUrl(image)} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-brand-600 font-medium text-sm uppercase tracking-widest mb-2">{product.category}</p>
          <h1 className="font-serif text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">₹{product.sellingPrice}</span>
            {product.retailPrice > product.sellingPrice && (
              <span className="text-lg text-gray-400 line-through">₹{product.retailPrice}</span>
            )}
            {discount > 0 && (
              <span className="text-green-600 font-semibold text-sm">You save ₹{product.retailPrice - product.sellingPrice}</span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Color: <span className="text-brand-600">{selectedColor}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-9 h-9 rounded-full border-2 transition-all ${
                      selectedColor === color ? 'border-brand-600 scale-110' : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-8">
            <p className="text-sm font-semibold text-gray-700 mb-3">Quantity</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center font-semibold text-lg"
              >
                −
              </button>
              <span className="w-10 text-center font-semibold text-gray-900">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.totalQuantity, q + 1))}
                className="w-9 h-9 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center font-semibold text-lg"
              >
                +
              </button>
              <span className="text-sm text-gray-500">{product.totalQuantity} in stock</span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={adding || product.totalQuantity === 0}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                added
                  ? 'bg-green-600 text-white'
                  : 'bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-50'
              }`}
            >
              {added ? <Check size={18} /> : <ShoppingCart size={18} />}
              {product.totalQuantity === 0 ? 'Out of Stock' : added ? 'Added!' : adding ? 'Adding...' : 'Add to Cart'}
            </button>
            <button className="p-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600">
              <Heart size={20} />
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); dispatch(addToast({ message: 'Link copied!', type: 'info' })); }}
              className="p-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
            >
              <Share2 size={20} />
            </button>
          </div>

          {/* Details */}
          <div className="border-t border-gray-100 pt-6 space-y-3">
            {[
              { label: 'Category', value: product.category },
              product.brand && { label: 'Brand', value: product.brand },
              product.weight && { label: 'Weight', value: product.weight },
              product.suitableAges && { label: 'Suitable Ages', value: product.suitableAges },
              product.size?.height && { label: 'Size', value: `${product.size.height} × ${product.size.width}` },
              product.materialUsed?.length > 0 && { label: 'Materials', value: product.materialUsed.join(', ') },
            ]
              .filter(Boolean)
              .map((detail: any) => (
                <div key={detail.label} className="flex gap-4 text-sm">
                  <span className="w-32 text-gray-500 shrink-0">{detail.label}</span>
                  <span className="text-gray-900 capitalize">{detail.value}</span>
                </div>
              ))}
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {product.tags.map((tag: string) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
