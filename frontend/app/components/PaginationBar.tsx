"use client";

import type { UsePaginationReturn } from "@/lib/hooks/usePagination";

interface PaginationBarProps extends UsePaginationReturn {
  /** Previous button text */
  prevLabel?: string;
  /** Next button text */
  nextLabel?: string;
  /** Optional custom class for container */
  className?: string;
}

export default function PaginationBar({
  goToPage,
  page,
  showPagination,
  hasPrev,
  hasNext,
  pageNumbers,
  startItem,
  endItem,
  totalItems = 0,
  prevLabel = "← წინა",
  nextLabel = "შემდეგი →",
  className = "",
}: PaginationBarProps) {
  if (!showPagination) return null;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-700/50 pt-8 ${className}`}
    >
      <p className="text-slate-400 text-sm">
        გვიჩვენება {startItem}–{endItem} {totalItems}-დან
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => goToPage(page - 1)}
          disabled={!hasPrev}
          className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {prevLabel}
        </button>
        <div className="flex items-center gap-1">
          {pageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => goToPage(pageNum)}
              className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                pageNum === page
                  ? "bg-linear-to-r from-orange-500 to-yellow-500 text-white"
                  : "border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => goToPage(page + 1)}
          disabled={!hasNext}
          className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
