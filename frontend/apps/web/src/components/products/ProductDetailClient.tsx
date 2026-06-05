'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag,
  Heart,
  Share2,
  Check,
  ChevronRight,
  ChevronDown,
  Truck,
  Shield,
  RotateCcw,
  X,
  Maximize2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToCartThunk } from '../../store/slices/cartSlice';
import { openAuthModal, openCartDrawer, addToast } from '../../store/slices/uiSlice';

interface ProductDetailClientProps {
  product: any;
}

const DELIVERY_HIGHLIGHTS = [
  { icon: Truck, title: 'White-Glove Delivery', desc: 'Professional installation included' },
  { icon: Shield, title: 'Lifetime Guarantee', desc: 'Craftsmanship warranty on all pieces' },
  { icon: RotateCcw, title: '30-Day Returns', desc: 'Hassle-free return policy' },
];

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((s) => s.auth);

  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('details');

  const imageBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');
  const productImages = product.imageAssets?.length
    ? [...product.imageAssets]
        .sort((a: any, b: any) => Number(a.order || 0) - Number(b.order || 0))
        .map((asset: any) => asset.webpUrl || asset.url)
        .filter(Boolean)
    : [...new Set([product.primaryImage, ...(product.images || []), product.image].filter(Boolean))];
  const getImageUrl = (img?: string) =>
    img?.startsWith('http') ? img : `${imageBase}${img}`;

  const [selectedImage, setSelectedImage] = useState(product.primaryImage || productImages[0] || '');
  const imageUrl = getImageUrl(selectedImage);
  const categoryLabel = typeof product.category === 'object'
    ? product.category?.name || product.category?.slug || ''
    : product.category;
  const categoryHref = typeof product.category === 'object'
    ? product.category?.slug || product.category?._id || ''
    : product.category;

  const discount =
    product.retailPrice > product.sellingPrice
      ? Math.round(((product.retailPrice - product.sellingPrice) / product.retailPrice) * 100)
      : 0;

  const handleAddToCart = async () => {
    if (!token) { dispatch(openAuthModal('login')); return; }
    setAdding(true);
    try {
      await dispatch(
        addToCartThunk({ token, productId: product._id, quantity, color: selectedColor }),
      ).unwrap();
      setAdded(true);
      dispatch(addToast({ message: 'Added to cart', type: 'success' }));
      dispatch(openCartDrawer());
      setTimeout(() => setAdded(false), 2500);
    } catch (message) {
      dispatch(addToast({ message: String(message), type: 'error' }));
    } finally {
      setAdding(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    dispatch(addToast({ message: 'Link copied to clipboard', type: 'info' }));
  };

  const specDetails = [
    { label: 'Category', value: categoryLabel },
    product.brand && { label: 'Brand', value: product.brand },
    product.weight && { label: 'Weight', value: product.weight },
    (product.size?.height || product.dimension?.height) && {
      label: 'Dimensions',
      value: `${product.size?.height || product.dimension?.height} x ${product.size?.width || product.dimension?.width}`,
    },
    (product.materialUsed?.length > 0 || product.material?.length > 0) && {
      label: 'Materials',
      value: (product.materialUsed || product.material).join(', '),
    },
  ].filter(Boolean);

  const accordions = [
    {
      id: 'details',
      label: 'Product Details',
      content: product.description,
    },
    {
      id: 'specs',
      label: 'Specifications',
      content: specDetails,
    },
    {
      id: 'delivery',
      label: 'Delivery & Installation',
      content: 'Our white-glove delivery team will contact you to schedule a convenient installation time. Professional mounting is included with every order. Installation typically takes 2–4 hours.',
    },
    {
      id: 'returns',
      label: 'Returns & Warranty',
      content: 'All Royce pieces come with a lifetime craftsmanship guarantee. Returns accepted within 30 days of delivery in original condition. Bespoke commissions are non-returnable.',
    },
  ];

  return (
    <div
      style={{
        background:
          'linear-gradient(180deg, var(--forest-2) 0%, var(--charcoal) 32%, var(--coffee) 100%)',
        minHeight: '100vh',
      }}
    >
      {/* Breadcrumb */}
      <div style={{ padding: '1.5rem 1.5rem 0', maxWidth: '1280px', margin: '0 auto' }}>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {[
            { label: 'Home', href: '/' },
            { label: 'Shop', href: '/shop' },
            { label: categoryLabel, href: `/shop?category=${categoryHref}` },
            { label: product.name, href: null },
          ].map((crumb, i, arr) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {crumb.href ? (
                <Link href={crumb.href} className="breadcrumb-item">
                  {crumb.label}
                </Link>
              ) : (
                <span
                  style={{
                    fontSize: '0.62rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(250,247,240,0.55)',
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {crumb.label}
                </span>
              )}
              {i < arr.length - 1 && <span className="breadcrumb-sep">›</span>}
            </span>
          ))}
        </nav>
      </div>

      {/* Main product section */}
      <div
        className="max-w-7xl mx-auto product-detail-layout grid grid-cols-1 lg:grid-cols-2"
        style={{ padding: '2.5rem 1.5rem 5rem', gap: '5rem', alignItems: 'start' }}
      >
        {/* Gallery */}
        <div>
          {/* Main image */}
          <div
            style={{
              position: 'relative',
              aspectRatio: '4/5',
              overflow: 'hidden',
              background: 'linear-gradient(180deg, rgba(6,47,36,0.62), var(--charcoal-2))',
              border: '1px solid rgba(0,96,57,0.2)',
              marginBottom: '0.75rem',
              cursor: 'zoom-in',
            }}
            onClick={() => setLightboxOpen(true)}
          >
            {selectedImage ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                style={{ objectFit: 'cover', transition: 'transform 0.6s ease' }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.transform = 'scale(1.04)')}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = 'scale(1)')}
              />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
                💡
              </div>
            )}

            {discount > 0 && (
              <span
                className="badge-gold"
                style={{ position: 'absolute', top: '1.25rem', left: '1.25rem' }}
              >
                −{discount}%
              </span>
            )}

            <button
              style={{
                position: 'absolute',
                bottom: '1.25rem',
                right: '1.25rem',
                background: 'rgba(8,6,4,0.6)',
                border: '1px solid rgba(250,247,240,0.15)',
                backdropFilter: 'blur(8px)',
                color: 'rgba(250,247,240,0.6)',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
            >
              <Maximize2 size={14} strokeWidth={1.5} />
            </button>
          </div>

          {/* Thumbnails */}
          {productImages.length > 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(productImages.length, 5)}, 1fr)`, gap: '0.5rem' }}>
              {productImages.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    position: 'relative',
                    aspectRatio: '1/1',
                    overflow: 'hidden',
                    background: 'var(--forest-2)',
                    border: `1px solid ${selectedImage === img ? 'rgba(228,199,124,0.72)' : 'rgba(0,96,57,0.18)'}`,
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease',
                    padding: 0,
                  }}
                >
                  <Image
                    src={getImageUrl(img)}
                    alt={`${product.name} ${i + 1}`}
                    fill
                    style={{ objectFit: 'cover', opacity: selectedImage === img ? 1 : 0.55, transition: 'opacity 0.2s ease' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="product-info-panel" style={{ position: 'sticky', top: '100px' }}>
          {/* Category */}
          <p className="overline-text" style={{ marginBottom: '0.875rem' }}>{categoryLabel}</p>

          {/* Name */}
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
              fontWeight: 300,
              fontStyle: 'italic',
              color: 'var(--ivory)',
              lineHeight: 1.15,
              marginBottom: '1.75rem',
            }}
          >
            {product.name}
          </h1>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '2rem' }}>
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '2rem',
                fontWeight: 400,
                color: 'var(--ivory)',
              }}
            >
              ₹{product.sellingPrice.toLocaleString('en-IN')}
            </span>
            {product.retailPrice > product.sellingPrice && (
              <>
                <span className="price-crossed">₹{product.retailPrice.toLocaleString('en-IN')}</span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    letterSpacing: '0.1em',
                  color: 'var(--gold-light)',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Save ₹{(product.retailPrice - product.sellingPrice).toLocaleString('en-IN')}
                </span>
              </>
            )}
          </div>

          <div style={{ width: '100%', height: 1, background: 'rgba(250,247,240,0.08)', marginBottom: '2rem' }} />

          {/* Color selector */}
          {product.colors?.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.62rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'rgba(250,247,240,0.45)',
                  marginBottom: '0.875rem',
                }}
              >
                Finish: <span style={{ color: 'var(--gold-light)' }}>{selectedColor}</span>
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {product.colors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className="color-swatch"
                    style={{
                      backgroundColor: color,
                      borderColor: selectedColor === color ? 'var(--gold)' : 'transparent',
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div style={{ marginBottom: '2rem' }}>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.62rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'rgba(250,247,240,0.45)',
                marginBottom: '0.875rem',
              }}
            >
              Quantity
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
              <button
                className="qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span
                style={{
                  width: 52,
                  textAlign: 'center',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.85rem',
                  color: 'var(--ivory)',
                  background: 'rgba(250,247,240,0.03)',
                  borderTop: '1px solid rgba(250,247,240,0.1)',
                  borderBottom: '1px solid rgba(250,247,240,0.1)',
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {quantity}
              </span>
              <button
                className="qty-btn"
                onClick={() => setQuantity((q) => Math.min(product.totalQuantity, q + 1))}
              >
                +
              </button>
              <span style={{ marginLeft: '1rem', fontSize: '0.65rem', color: 'rgba(250,247,240,0.3)', letterSpacing: '0.08em' }}>
                {product.totalQuantity} in stock
              </span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="product-cta-row" style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
            <button
              onClick={handleAddToCart}
              disabled={adding || product.totalQuantity === 0}
              style={{
                flex: 1,
                padding: '1rem',
                background: added
                  ? 'rgba(0,96,57,0.22)'
                  : product.totalQuantity === 0
                    ? 'rgba(250,247,240,0.06)'
                    : 'linear-gradient(135deg, var(--rolex-green), var(--forest))',
                color: added ? 'var(--gold-light)' : product.totalQuantity === 0 ? 'rgba(250,247,240,0.25)' : 'var(--ivory)',
                border: added
                  ? '1px solid rgba(228,199,124,0.35)'
                  : product.totalQuantity === 0
                    ? '1px solid rgba(250,247,240,0.1)'
                    : '1px solid rgba(228,199,124,0.55)',
                cursor: product.totalQuantity === 0 ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.62rem',
                fontWeight: 600,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                transition: 'all 0.3s ease',
              }}
            >
              {added ? <Check size={15} /> : <ShoppingBag size={15} strokeWidth={2} />}
              {product.totalQuantity === 0
                ? 'Out of Stock'
                : added
                ? 'Added to Cart'
                : adding
                ? 'Adding...'
                : 'Add to Cart'}
            </button>
            <button
              className="btn-icon"
              onClick={() => setWishlisted(!wishlisted)}
              style={{
                color: wishlisted ? '#ef4444' : 'rgba(250,247,240,0.5)',
                borderColor: wishlisted ? 'rgba(239,68,68,0.3)' : 'rgba(250,247,240,0.1)',
              }}
            >
              <Heart
                size={15}
                strokeWidth={1.5}
                style={{ fill: wishlisted ? '#ef4444' : 'none', transition: 'fill 0.2s ease' }}
              />
            </button>
            <button className="btn-icon" onClick={handleShare}>
              <Share2 size={15} strokeWidth={1.5} />
            </button>
          </div>

          {/* Delivery highlights */}
          <div
            style={{
              background: 'linear-gradient(180deg, rgba(6,47,36,0.68), var(--charcoal-2))',
              border: '1px solid rgba(0,96,57,0.24)',
              padding: '1.5rem',
              marginBottom: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {DELIVERY_HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                <Icon size={15} style={{ color: 'var(--gold-light)', marginTop: '0.1rem', flexShrink: 0 }} strokeWidth={1.5} />
                <div>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.68rem',
                      fontWeight: 500,
                      color: 'var(--ivory)',
                      letterSpacing: '0.08em',
                      marginBottom: '0.15rem',
                    }}
                  >
                    {title}
                  </p>
                  <p style={{ fontSize: '0.62rem', color: 'rgba(250,247,240,0.35)', letterSpacing: '0.04em' }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Accordions */}
          <div>
            {accordions.map((acc) => (
              <div key={acc.id} className="accordion-item">
                <button
                  className="accordion-trigger"
                  onClick={() => setOpenAccordion(openAccordion === acc.id ? null : acc.id)}
                >
                  {acc.label}
                  <ChevronDown
                    size={14}
                    strokeWidth={1.5}
                    style={{
                      transition: 'transform 0.3s ease',
                      transform: openAccordion === acc.id ? 'rotate(180deg)' : 'rotate(0)',
                      color: openAccordion === acc.id ? 'var(--gold-light)' : 'rgba(250,247,240,0.4)',
                    }}
                  />
                </button>
                {openAccordion === acc.id && (
                  <div
                    style={{
                      paddingBottom: '1.5rem',
                      animation: 'fadeUp 0.3s ease forwards',
                    }}
                  >
                    {acc.id === 'specs' && Array.isArray(acc.content) ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {(acc.content as any[]).map((detail: any) => (
                          <div
                            key={detail.label}
                            style={{
                              display: 'flex',
                              gap: '2rem',
                              padding: '0.5rem 0',
                              borderBottom: '1px solid rgba(250,247,240,0.04)',
                            }}
                          >
                            <span
                              style={{
                                width: '100px',
                                flexShrink: 0,
                                fontSize: '0.65rem',
                                color: 'rgba(250,247,240,0.3)',
                                letterSpacing: '0.08em',
                              }}
                            >
                              {detail.label}
                            </span>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                color: 'rgba(250,247,240,0.7)',
                                textTransform: 'capitalize',
                                letterSpacing: '0.04em',
                              }}
                            >
                              {detail.value}
                            </span>
                          </div>
                        ))}
                        {product.tags?.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
                            {product.tags.map((tag: string) => (
                              <span
                                key={tag}
                                className="badge-dark"
                                style={{ fontSize: '0.58rem', textTransform: 'lowercase', letterSpacing: '0.06em' }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p
                        style={{
                          fontSize: '0.75rem',
                          color: 'rgba(250,247,240,0.5)',
                          lineHeight: 1.85,
                          letterSpacing: '0.04em',
                          fontWeight: 300,
                        }}
                      >
                        {acc.content as string}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && selectedImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(3,32,22,0.96)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.25s ease forwards',
          }}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              background: 'none',
              border: '1px solid rgba(250,247,240,0.15)',
              color: 'rgba(250,247,240,0.6)',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} strokeWidth={1.5} />
          </button>
          <div
            style={{ position: 'relative', width: '80vmin', height: '80vmin' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
