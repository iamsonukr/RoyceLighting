'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { ProductCard } from '../products/ProductCard';
import type { PublicCategory } from '@/lib/publicCategories';

const PRICE_RANGES = [
  { label: 'Under ₹10,000', min: '', max: '10000' },
  { label: '₹10k – ₹50k', min: '10000', max: '50000' },
  { label: '₹50k – ₹1L', min: '50000', max: '100000' },
  { label: 'Above ₹1L', min: '100000', max: '' },
];

const SORT_OPTIONS = [
  { label: 'Newest', value: 'createdAt' },
  { label: 'Price: Low to High', value: 'sellingPrice_asc' },
  { label: 'Price: High to Low', value: 'sellingPrice_desc' },
  { label: 'Best Sellers', value: 'salesCount' },
];

interface ShopClientProps {
  initialData: { products: any[]; total: number; pages: number };
  searchParams: Record<string, string | undefined>;
  categories: PublicCategory[];
}

export function ShopClient({ initialData, searchParams, categories }: ShopClientProps) {
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const currentCategory = searchParams.category || searchParams.collection || '';
  const currentSearch = searchParams.search || '';
  const currentPage = Number(searchParams.page) || 1;
  const currentSort = searchParams.sortBy || 'createdAt';
  const [searchInput, setSearchInput] = useState(currentSearch);

  const updateUrl = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams();
      const merged = { ...searchParams, ...updates };
      Object.entries(merged).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      router.push(`/shop?${params.toString()}`);
    },
    [searchParams, router],
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ search: searchInput || undefined, page: undefined });
  };

  const { products, total, pages } = initialData;
  const categoryOptions = [
    { label: 'All Pieces', value: '' },
    ...categories.map((category) => ({
      label: category.name,
      value: category.slug || category._id || '',
    })),
  ];
  const collectionLabel = categoryOptions.find((c) => c.value === currentCategory)?.label || 'All Pieces';

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, var(--forest-2) 0%, var(--charcoal) 34%, var(--coffee) 100%)',
      }}
    >
      {/* Page header */}
      <div
        style={{
          padding: '6rem 1.5rem 4rem',
          background:
            'radial-gradient(circle at 18% 12%, rgba(199,164,90,0.12), transparent 28%), linear-gradient(135deg, var(--forest), var(--charcoal-2) 58%, var(--coffee))',
          borderBottom: '1px solid rgba(0,96,57,0.28)',
          textAlign: 'center',
        }}
      >
        <p className="overline-text" style={{ marginBottom: '1rem' }}>Discover</p>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 300,
            fontStyle: 'italic',
            color: 'var(--ivory)',
            marginBottom: '1rem',
          }}
        >
          {collectionLabel}
        </h1>
        <p style={{ fontSize: '0.7rem', color: 'rgba(250,247,240,0.3)', letterSpacing: '0.15em' }}>
          {total} piece{total !== 1 ? 's' : ''} available
        </p>
      </div>

      <div className="max-w-7xl mx-auto" style={{ padding: '2.5rem 1.5rem 6rem' }}>
        {/* Controls bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2.5rem',
            gap: '1rem',
            flexWrap: 'wrap',
            paddingBottom: '2rem',
            borderBottom: '1px solid rgba(0,96,57,0.16)',
          }}
        >
          {/* Search */}
          <form className="shop-search-form" onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '1rem', color: 'rgba(250,247,240,0.3)', pointerEvents: 'none' }} />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search the collection..."
              className="input-luxury"
              style={{ paddingLeft: '2.75rem', width: '260px', fontSize: '0.75rem' }}
            />
          </form>

          <div className="shop-control-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Sort */}
            <select
              value={currentSort}
              onChange={(e) => updateUrl({ sortBy: e.target.value, page: undefined })}
              style={{
                background: 'rgba(0,96,57,0.12)',
                border: '1px solid rgba(0,96,57,0.24)',
                color: 'rgba(250,247,240,0.6)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.62rem',
                letterSpacing: '0.12em',
                padding: '0.6rem 1rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} style={{ background: '#062f24' }}>
                  {o.label}
                </option>
              ))}
            </select>

            {/* Filter toggle */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1rem',
                background: filtersOpen ? 'var(--green-muted)' : 'rgba(0,96,57,0.08)',
                border: `1px solid ${filtersOpen ? 'rgba(228,199,124,0.42)' : 'rgba(0,96,57,0.2)'}`,
                color: filtersOpen ? 'var(--gold-light)' : 'rgba(250,247,240,0.5)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.62rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <SlidersHorizontal size={13} strokeWidth={1.5} />
              Filters
            </button>
          </div>
        </div>

        {/* Active filters */}
        {(currentCategory || currentSearch || searchParams.minPrice) && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(250,247,240,0.25)', marginRight: '0.25rem' }}>
              Active:
            </span>
            {currentCategory && (
              <button
                onClick={() => updateUrl({ category: undefined, collection: undefined })}
                className="filter-chip active"
              >
                {collectionLabel} <X size={10} />
              </button>
            )}
            {currentSearch && (
              <button
                onClick={() => updateUrl({ search: undefined })}
                className="filter-chip active"
              >
                "{currentSearch}" <X size={10} />
              </button>
            )}
            {searchParams.minPrice && (
              <button
                onClick={() => updateUrl({ minPrice: undefined, maxPrice: undefined })}
                className="filter-chip active"
              >
                Price filter <X size={10} />
              </button>
            )}
            <button
              onClick={() => updateUrl({ category: undefined, collection: undefined, search: undefined, minPrice: undefined, maxPrice: undefined })}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.58rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(250,247,240,0.25)',
                marginLeft: '0.5rem',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(250,247,240,0.6)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(250,247,240,0.25)')}
            >
              Clear all
            </button>
          </div>
        )}

        <div className="shop-content-layout" style={{ display: 'flex', gap: '2.5rem' }}>
          {/* Sidebar */}
          {filtersOpen && (
            <aside
              className="shop-filters"
              style={{
                width: '220px',
                flexShrink: 0,
                animation: 'fadeIn 0.25s ease forwards',
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(180deg, rgba(6,47,36,0.78), var(--charcoal-2))',
                  border: '1px solid rgba(0,96,57,0.24)',
                  padding: '1.75rem',
                  position: 'sticky',
                  top: '100px',
                }}
              >
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.58rem',
                    fontWeight: 500,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    marginBottom: '1.5rem',
                  }}
                >
                  Category
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => updateUrl({ category: cat.value || undefined, collection: undefined, page: undefined })}
                      style={{
                        textAlign: 'left',
                        padding: '0.65rem 0',
                        fontSize: '0.7rem',
                        letterSpacing: '0.06em',
                        color: currentCategory === cat.value ? 'var(--gold-light)' : 'rgba(250,247,240,0.4)',
                        background: currentCategory === cat.value ? 'rgba(0,96,57,0.12)' : 'none',
                        border: 'none',
                        borderBottom: '1px solid rgba(250,247,240,0.05)',
                        cursor: 'pointer',
                        transition: 'color 0.2s ease',
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: currentCategory === cat.value ? 500 : 300,
                      }}
                      onMouseEnter={(e) => {
                        if (currentCategory !== cat.value) e.currentTarget.style.color = 'rgba(250,247,240,0.7)';
                      }}
                      onMouseLeave={(e) => {
                        if (currentCategory !== cat.value) e.currentTarget.style.color = 'rgba(250,247,240,0.4)';
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.58rem',
                    fontWeight: 500,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    marginTop: '2rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  Price Range
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {PRICE_RANGES.map((r) => (
                    <button
                      key={r.label}
                      onClick={() => updateUrl({ minPrice: r.min || undefined, maxPrice: r.max || undefined, page: undefined })}
                      style={{
                        textAlign: 'left',
                        padding: '0.65rem 0',
                        fontSize: '0.7rem',
                        letterSpacing: '0.04em',
                        color:
                          searchParams.minPrice === r.min && searchParams.maxPrice === r.max
                            ? 'var(--gold-light)'
                            : 'rgba(250,247,240,0.4)',
                        background: 'none',
                        border: 'none',
                        borderBottom: '1px solid rgba(250,247,240,0.05)',
                        cursor: 'pointer',
                        transition: 'color 0.2s ease',
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 300,
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          )}

          {/* Products grid */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {products.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '8rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1.25rem',
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
                    fontSize: '1.75rem',
                    color: 'rgba(0,96,57,0.4)',
                  }}
                >
                  ✦
                </div>
                <p
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '1.5rem',
                    fontStyle: 'italic',
                    color: 'rgba(250,247,240,0.5)',
                  }}
                >
                  No pieces found
                </p>
                <p style={{ fontSize: '0.72rem', color: 'rgba(250,247,240,0.25)', letterSpacing: '0.06em' }}>
                  Try adjusting your filters or explore our full collection
                </p>
                <button
                  onClick={() => updateUrl({ category: undefined, collection: undefined, search: undefined, minPrice: undefined, maxPrice: undefined })}
                  className="btn-outline"
                  style={{ fontSize: '0.58rem', padding: '0.75rem 1.75rem' }}
                >
                  View All Pieces
                </button>
              </div>
            ) : (
              <div
                style={{
                  gap: '1px',
                  background: 'rgba(0,96,57,0.12)',
                }}
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${filtersOpen ? '' : 'xl:grid-cols-4'}`}
              >
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  marginTop: '4rem',
                  paddingTop: '3rem',
                  borderTop: '1px solid rgba(250,247,240,0.06)',
                }}
              >
                <button
                  onClick={() => updateUrl({ page: String(currentPage - 1) })}
                  disabled={currentPage <= 1}
                  className="btn-icon"
                  style={{ opacity: currentPage <= 1 ? 0.3 : 1 }}
                >
                  <ChevronLeft size={16} strokeWidth={1.5} />
                </button>

                {Array.from({ length: pages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - currentPage) <= 2)
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => updateUrl({ page: String(p) })}
                      style={{
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '0.72rem',
                        letterSpacing: '0.06em',
                        background: p === currentPage ? 'linear-gradient(135deg, var(--rolex-green), var(--forest))' : 'transparent',
                        color: p === currentPage ? 'var(--ivory)' : 'rgba(250,247,240,0.4)',
                        border: `1px solid ${p === currentPage ? 'rgba(228,199,124,0.55)' : 'rgba(0,96,57,0.18)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontWeight: p === currentPage ? 600 : 300,
                      }}
                    >
                      {p}
                    </button>
                  ))}

                <button
                  onClick={() => updateUrl({ page: String(currentPage + 1) })}
                  disabled={currentPage >= pages}
                  className="btn-icon"
                  style={{ opacity: currentPage >= pages ? 0.3 : 1 }}
                >
                  <ChevronRight size={16} strokeWidth={1.5} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
