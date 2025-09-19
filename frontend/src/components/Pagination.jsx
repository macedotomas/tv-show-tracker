import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useTvShowStore } from '../stores/useTvShowStore.jsx';

function Pagination() {
  const { 
    pagination, 
    setPage, 
    nextPage, 
    previousPage, 
    setItemsPerPage 
  } = useTvShowStore();

  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPreviousPage
  } = pagination;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination
      if (currentPage <= 3) {
        // Show first pages
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show last pages
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show middle pages
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-4 bg-base-100 rounded-lg border border-base-300 shadow-lg">
      {/* Items per page selector */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-base-content/70">Show:</span>
        <select 
          className="select select-sm select-bordered"
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
        >
          <option value={6}>6 per page</option>
          <option value={12}>12 per page</option>
          <option value={24}>24 per page</option>
          <option value={48}>48 per page</option>
        </select>
      </div>

      {/* Page info */}
      <div className="text-sm text-base-content/70">
        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <button
          onClick={() => setPage(1)}
          disabled={!hasPreviousPage}
          className="btn btn-sm btn-ghost disabled:opacity-50"
          title="First page"
        >
          <ChevronsLeft className="size-4" />
        </button>

        {/* Previous page */}
        <button
          onClick={previousPage}
          disabled={!hasPreviousPage}
          className="btn btn-sm btn-ghost disabled:opacity-50"
          title="Previous page"
        >
          <ChevronLeft className="size-4" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-base-content/50">...</span>
            ) : (
              <button
                key={page}
                onClick={() => setPage(page)}
                className={`btn btn-sm ${
                  currentPage === page 
                    ? 'btn-primary' 
                    : 'btn-ghost hover:btn-neutral'
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Next page */}
        <button
          onClick={nextPage}
          disabled={!hasNextPage}
          className="btn btn-sm btn-ghost disabled:opacity-50"
          title="Next page"
        >
          <ChevronRight className="size-4" />
        </button>

        {/* Last page */}
        <button
          onClick={() => setPage(totalPages)}
          disabled={!hasNextPage}
          className="btn btn-sm btn-ghost disabled:opacity-50"
          title="Last page"
        >
          <ChevronsRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
