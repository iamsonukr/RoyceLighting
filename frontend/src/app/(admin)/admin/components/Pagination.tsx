import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
  page: number;
  pages: number;
  total?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  itemLabel?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
};

const getPageRange = (page: number, pages: number) => {
  const visiblePages = 5;
  const half = Math.floor(visiblePages / 2);
  let start = Math.max(1, page - half);
  const end = Math.min(pages, start + visiblePages - 1);

  start = Math.max(1, end - visiblePages + 1);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

export default function Pagination({
  page,
  pages,
  total,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  itemLabel = 'items',
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  if (!pages || pages < 1) return null;

  const currentPage = Math.min(Math.max(page, 1), pages);
  const pageRange = getPageRange(currentPage, pages);

  const changePage = (nextPage: number) => {
    const safePage = Math.min(Math.max(nextPage, 1), pages);
    if (safePage !== currentPage) onPageChange(safePage);
  };

  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center">
        {typeof total === 'number' && (
          <span>
            {total} {itemLabel}
          </span>
        )}
        {pageSize && onPageSizeChange && (
          <label className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <nav className="flex items-center gap-1.5" aria-label="Pagination">
        <button
          type="button"
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {pageRange[0] > 1 && (
          <>
            <button
              type="button"
              className="h-9 min-w-9 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              onClick={() => changePage(1)}
            >
              1
            </button>
            {pageRange[0] > 2 && <span className="px-1 text-sm text-gray-400">...</span>}
          </>
        )}

        {pageRange.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => changePage(pageNumber)}
            aria-current={pageNumber === currentPage ? 'page' : undefined}
            className={`h-9 min-w-9 rounded-lg border px-3 text-sm font-medium transition-colors ${
              pageNumber === currentPage
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {pageNumber}
          </button>
        ))}

        {pageRange[pageRange.length - 1] < pages && (
          <>
            {pageRange[pageRange.length - 1] < pages - 1 && <span className="px-1 text-sm text-gray-400">...</span>}
            <button
              type="button"
              className="h-9 min-w-9 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              onClick={() => changePage(pages)}
            >
              {pages}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage >= pages}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
}
