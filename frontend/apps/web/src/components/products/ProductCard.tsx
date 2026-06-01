'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Heart, Eye, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToCartThunk } from '../../store/slices/cartSlice';
import { openAuthModal, openCartDrawer, addToast } from '../../store/slices/uiSlice';

interface Product {
  _id: string;
  name: string;
  sellingPrice: number;
  retailPrice: number;
  image?: string;
  images?: string[];
  primaryImage?: string;
  imageAssets?: { url: string; webpUrl?: string; order?: number; isPrimary?: boolean }[];
  category: string | { _id?: string; name?: string; slug?: string };
  colors?: string[];
  totalQuantity: number;
  salesCount?: number;
  isNew?: boolean;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((s) => s.auth);
  const [hovered, setHovered] = useState(false);
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  const discount =
    product.retailPrice > product.sellingPrice
      ? Math.round(((product.retailPrice - product.sellingPrice) / product.retailPrice) * 100)
      : 0;

  const imageBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace('/api', '');
  const assetImages = product.imageAssets?.length
    ? [...product.imageAssets]
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
        .map((asset) => asset.webpUrl || asset.url)
        .filter(Boolean)
    : [];
  const productImages = assetImages.length
    ? assetImages
    : [...new Set([product.primaryImage, ...(product.images || []), product.image].filter(Boolean) as string[])];
  const categoryLabel = typeof product.category === 'object'
    ? product.category?.name || product.category?.slug || ''
    : product.category;
  const getImgUrl = (img?: string) =>
    img?.startsWith('http') ? img : img ? `${imageBase}${img}` : null;

  const primaryImg = getImgUrl(productImages[0]);
  const secondaryImg = productImages[1] ? getImgUrl(productImages[1]) : null;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) { dispatch(openAuthModal('login')); return; }
    setAdding(true);
    const result = await dispatch(addToCartThunk({ token, productId: product._id, quantity: 1 }));
    setAdding(false);
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(addToast({ message: 'Added to cart', type: 'success' }));
      dispatch(openCartDrawer());
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(!wishlisted);
  };

  return (
    <Link href={`/product/${product._id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className="product-card"
        onMouseEnter={() => { setHovered(true); if (secondaryImg) setImgIdx(1); }}
        onMouseLeave={() => { setHovered(false); setImgIdx(0); }}
        style={{ cursor: 'pointer' }}
      >
        {/* Image container */}
        <div
          style={{
            position: 'relative',
            aspectRatio: '3/4',
            overflow: 'hidden',
            background: 'var(--charcoal-3)',
          }}
        >
          {primaryImg ? (
            <>
              <Image
                src={primaryImg}
                alt={product.name}
                fill
                style={{
                  objectFit: 'cover',
                  transition: 'transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.4s ease',
                  transform: hovered ? 'scale(1.07)' : 'scale(1)',
                  opacity: (hovered && secondaryImg) ? 0 : 1,
                }}
              />
              {secondaryImg && (
                <Image
                  src={secondaryImg}
                  alt={`${product.name} alternate`}
                  fill
                  style={{
                    objectFit: 'cover',
                    position: 'absolute',
                    inset: 0,
                    transition: 'opacity 0.5s ease, transform 0.8s ease',
                    opacity: hovered ? 1 : 0,
                    transform: hovered ? 'scale(1.05)' : 'scale(1.02)',
                  }}
                />
              )}
            </>
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                color: 'rgba(250,247,240,0.15)',
              }}
            >
              💡
            </div>
          )}

          {/* Gradient veil */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, transparent 50%, rgba(8,6,4,0.6) 100%)',
              transition: 'opacity 0.4s ease',
              opacity: hovered ? 1 : 0.5,
            }}
          />

          {/* Badges */}
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
            }}
          >
            {product.totalQuantity === 0 && (
              <span className="badge-dark">Sold Out</span>
            )}
            {discount > 0 && product.totalQuantity > 0 && (
              <span className="badge-gold">−{discount}%</span>
            )}
            {product.isNew && (
              <span className="badge-dark" style={{ borderColor: 'rgba(201,168,76,0.3)', color: 'var(--gold)' }}>New</span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(8,6,4,0.6)',
              border: '1px solid rgba(250,247,240,0.1)',
              backdropFilter: 'blur(8px)',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'translateY(0)' : 'translateY(-8px)',
              color: wishlisted ? '#ef4444' : 'rgba(250,247,240,0.6)',
            }}
          >
            <Heart
              size={14}
              strokeWidth={1.5}
              style={{ fill: wishlisted ? '#ef4444' : 'none', transition: 'fill 0.2s ease' }}
            />
          </button>

          {/* Quick actions bar */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              display: 'flex',
              gap: '0',
              padding: '0 0 0',
              transform: hovered ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <button
              onClick={handleAddToCart}
              disabled={adding || product.totalQuantity === 0}
              style={{
                flex: 1,
                padding: '0.875rem 1rem',
                background: product.totalQuantity === 0 ? 'rgba(250,247,240,0.1)' : 'var(--gold)',
                color: product.totalQuantity === 0 ? 'rgba(250,247,240,0.3)' : 'var(--obsidian)',
                border: 'none',
                cursor: product.totalQuantity === 0 ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.58rem',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'background 0.2s ease',
              }}
            >
              <ShoppingBag size={13} strokeWidth={2} />
              {adding ? 'Adding...' : product.totalQuantity === 0 ? 'Sold Out' : 'Add to Cart'}
            </button>
            <Link
              href={`/product/${product._id}`}
              style={{
                width: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(8,6,4,0.85)',
                color: 'rgba(250,247,240,0.6)',
                borderLeft: '1px solid rgba(250,247,240,0.1)',
                backdropFilter: 'blur(8px)',
                transition: 'color 0.2s ease',
                textDecoration: 'none',
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,247,240,0.6)')}
            >
              <Eye size={14} strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '1.25rem 1.25rem 1.5rem' }}>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.58rem',
              fontWeight: 500,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: '0.5rem',
            }}
          >
            {categoryLabel}
          </p>
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1rem',
              fontWeight: 400,
              fontStyle: 'italic',
              color: 'var(--ivory)',
              marginBottom: '0.875rem',
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.name}
          </h3>

          {/* Pricing */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.1rem',
                fontWeight: 400,
                color: 'var(--ivory)',
              }}
            >
              ₹{product.sellingPrice.toLocaleString('en-IN')}
            </span>
            {product.retailPrice > product.sellingPrice && (
              <span className="price-crossed">
                ₹{product.retailPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Color swatches */}
          {product.colors && product.colors.length > 0 && (
            <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.875rem' }}>
              {product.colors.slice(0, 5).map((color) => (
                <div
                  key={color}
                  className="color-swatch"
                  style={{
                    backgroundColor: color,
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    border: '1px solid rgba(250,247,240,0.15)',
                  }}
                  title={color}
                />
              ))}
              {product.colors.length > 5 && (
                <span style={{ fontSize: '0.58rem', color: 'rgba(250,247,240,0.3)', paddingLeft: '0.25rem', alignSelf: 'center' }}>
                  +{product.colors.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
