'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export default function Pagination({
  page,
  pages,
  total,
  pageSize,
  itemLabel,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const pageSizeOptions = [10, 20, 50, 100];

  const handlePrevious = () => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (page < pages) {
      onPageChange(page + 1);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-4 border-t border-gray-200">
      {/* Items per page selector */}
      <div className="flex items-center gap-2">
        <label htmlFor="pageSize" className="text-sm text-gray-600">
          Show
        </label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-600">{itemLabel}</span>
      </div>

      {/* Items info */}
      <div className="text-sm text-gray-600">
        Showing {startItem} to {endItem} of {total} {itemLabel}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevious}
          disabled={page === 1}
          className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {Array.from({ length: pages }, (_, i) => i + 1)
            .filter((p) => {
              // Show first page, last page, current page, and neighbors
              return (
                p === 1 ||
                p === pages ||
                (p >= page - 1 && p <= page + 1)
              );
            })
            .map((p, idx, arr) => {
              const prevP = arr[idx - 1];
              const showDots = prevP && p - prevP > 1;

              return (
                <div key={`page-${p}`} className="flex items-center gap-1">
                  {showDots && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                  <button
                    onClick={() => onPageChange(p)}
                    className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                      page === p
                        ? 'bg-gray-900 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                </div>
              );
            })}
        </div>

        <button
          onClick={handleNext}
          disabled={page === pages}
          className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
