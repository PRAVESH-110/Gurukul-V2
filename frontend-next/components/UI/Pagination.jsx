'use client';

import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Pure calculation helper (Single Responsibility Principle)
 * Generates array of page numbers and ellipsis tokens
 */
export function generatePaginationRange(currentPage, totalPages, siblingCount = 1) {
  // Total numbers to show: first + last + current + 2*siblings + 2*dots
  const totalNumbers = siblingCount * 2 + 5;

  // Case 1: If total pages is less than page numbers we want to show
  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  // Case 2: No left dots, but right dots show
  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, '...', totalPages];
  }

  // Case 3: No right dots, but left dots show
  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1,
    );
    return [firstPageIndex, '...', ...rightRange];
  }

  // Case 4: Both left and right dots show
  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i,
    );
    return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
  }

  return [];
}

/**
 * Common Reusable Pagination Component (SOLID Design)
 *
 * @param {number} currentPage - Currently active page (1-based index)
 * @param {number} totalPages - Total available pages
 * @param {number} totalItems - (Optional) Total count of items across all pages
 * @param {number} pageSize - (Optional) Number of items per page
 * @param {function} onPageChange - Callback fired when page is selected
 * @param {number} siblingCount - Number of page buttons shown on either side of current page
 * @param {boolean} showFastForward - Whether to render first/last jump buttons
 * @param {boolean} showTotalCount - Whether to display "Showing X to Y of Z" indicator
 * @param {string} className - Optional container styling
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems,
  pageSize,
  onPageChange,
  siblingCount = 1,
  showFastForward = true,
  showTotalCount = true,
  className = '',
}) {
  const paginationRange = useMemo(
    () => generatePaginationRange(currentPage, totalPages, siblingCount),
    [currentPage, totalPages, siblingCount],
  );

  // If there is only 1 page and no items count to show, hide pagination
  if (totalPages <= 1 && !totalItems) {
    return null;
  }

  const handlePageClick = (page) => {
    if (page === currentPage || page < 1 || page > totalPages) return;
    onPageChange?.(page);
  };

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  // Calculate item boundaries for informational text
  const startItem = totalItems && pageSize ? (currentPage - 1) * pageSize + 1 : null;
  const endItem = totalItems && pageSize ? Math.min(currentPage * pageSize, totalItems) : null;

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 ${className}`}
    >
      {/* Information text (e.g. Showing 1 to 10 of 120 results) */}
      {showTotalCount && totalItems != null ? (
        <p className="text-xs sm:text-sm text-gray-500 font-medium">
          Showing <span className="font-semibold text-gray-900">{startItem}</span> to{' '}
          <span className="font-semibold text-gray-900">{endItem}</span> of{' '}
          <span className="font-semibold text-gray-900">{totalItems}</span> results
        </p>
      ) : (
        <div className="hidden sm:block" />
      )}

      {/* Page controls */}
      <div className="flex items-center gap-1 sm:gap-1.5 select-none">
        {/* Jump to first page */}
        {showFastForward && (
          <button
            type="button"
            onClick={() => handlePageClick(1)}
            disabled={isFirstPage}
            aria-label="First page"
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-white/80 border border-transparent hover:border-gray-200 disabled:opacity-30 disabled:pointer-events-none transition-all duration-150"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}

        {/* Previous page */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={isFirstPage}
          aria-label="Previous page"
          className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-white/80 border border-transparent hover:border-gray-200 disabled:opacity-30 disabled:pointer-events-none transition-all duration-150"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Numeric page buttons & dots */}
        {paginationRange.map((pageNumber, idx) => {
          if (pageNumber === '...') {
            return (
              <span
                key={`dots-${idx}`}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-xs sm:text-sm text-gray-400 font-bold"
              >
                &#8230;
              </span>
            );
          }

          const isActive = pageNumber === currentPage;

          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => handlePageClick(pageNumber)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Page ${pageNumber}`}
              className={`
                min-w-8 h-8 sm:min-w-9 sm:h-9 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200
                ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 border border-amber-600 scale-105'
                    : 'text-gray-700 hover:text-gray-950 bg-white/60 hover:bg-white border border-gray-200/80 hover:border-gray-300 shadow-sm'
                }
              `}
            >
              {pageNumber}
            </button>
          );
        })}

        {/* Next page */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={isLastPage}
          aria-label="Next page"
          className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-white/80 border border-transparent hover:border-gray-200 disabled:opacity-30 disabled:pointer-events-none transition-all duration-150"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Jump to last page */}
        {showFastForward && (
          <button
            type="button"
            onClick={() => handlePageClick(totalPages)}
            disabled={isLastPage}
            aria-label="Last page"
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-white/80 border border-transparent hover:border-gray-200 disabled:opacity-30 disabled:pointer-events-none transition-all duration-150"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </nav>
  );
}
