'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '../products/ProductCard';

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Earrings', value: 'earrings' },
  { label: 'Bracelets', value: 'bracelets' },
  { label: 'Necklaces', value: 'necklaces' },
  { label: 'Rings', value: 'rings' },
  { label: 'Anklets', value: 'anklets' },
  { label: 'Hair Accessories', value: 'hairAccessories' },
  { label: 'Keychains', value: 'keychains' },
  { label: 'Bags', value: 'bags' },
  { label: 'Home Decor', value: 'homedecor' },
  { label: 'Gifting', value: 'gifting' },
  { label: 'Festive', value: 'festive' },
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
}

export function ShopClient({ initialData, searchParams }: ShopClientProps) {
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const currentCategory = searchParams.category || '';
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">
            {currentCategory
              ? CATEGORIES.find((c) => c.value === currentCategory)?.label || 'Products'
              : 'All Products'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{total} items found</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 w-60"
            />
          </form>

          {/* Sort */}
          <select
            value={currentSort}
            onChange={(e) => updateUrl({ sortBy: e.target.value, page: undefined })}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className={`${filtersOpen ? 'block' : 'hidden'} md:block w-56 shrink-0`}>
          <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>
              <button
                onClick={() => updateUrl({ category: undefined, search: undefined, minPrice: undefined, maxPrice: undefined, page: undefined })}
                className="text-xs text-brand-600 hover:underline"
              >
                Clear all
              </button>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Category</p>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => updateUrl({ category: cat.value || undefined, page: undefined })}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      currentCategory === cat.value
                        ? 'bg-brand-100 text-brand-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Price Range</p>
              <div className="space-y-2">
                {[
                  { label: 'Under ₹500', min: '', max: '500' },
                  { label: '₹500 – ₹1000', min: '500', max: '1000' },
                  { label: '₹1000 – ₹2000', min: '1000', max: '2000' },
                  { label: 'Above ₹2000', min: '2000', max: '' },
                ].map((r) => (
                  <button
                    key={r.label}
                    onClick={() => updateUrl({ minPrice: r.min || undefined, maxPrice: r.max || undefined, page: undefined })}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      searchParams.minPrice === r.min && searchParams.maxPrice === r.max
                        ? 'bg-brand-100 text-brand-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {/* Active filters */}
          {(currentCategory || currentSearch) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {currentCategory && (
                <span className="flex items-center gap-1.5 bg-brand-100 text-brand-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  {CATEGORIES.find((c) => c.value === currentCategory)?.label}
                  <button onClick={() => updateUrl({ category: undefined })}><X size={12} /></button>
                </span>
              )}
              {currentSearch && (
                <span className="flex items-center gap-1.5 bg-brand-100 text-brand-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  "{currentSearch}"
                  <button onClick={() => updateUrl({ search: undefined })}><X size={12} /></button>
                </span>
              )}
            </div>
          )}

          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => updateUrl({ page: String(currentPage - 1) })}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: pages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - currentPage) <= 2)
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => updateUrl({ page: String(p) })}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      p === currentPage
                        ? 'bg-brand-600 text-white'
                        : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}

              <button
                onClick={() => updateUrl({ page: String(currentPage + 1) })}
                disabled={currentPage >= pages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
