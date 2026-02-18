"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

export interface UsePaginationOptions {
  /** Base path (e.g. "/products") */
  basePath: string;
  /** URL param name for page (default: "page") */
  paramKey?: string;
  /** Pagination data from API - when provided, hook returns computed UI values */
  pagination?: PaginationData | null;
  /** Max page numbers to show in UI (default: 5) */
  maxVisiblePages?: number;
}

export interface UsePaginationReturn {
  /** Current page (1-based) */
  page: number;
  /** Navigate to a specific page */
  goToPage: (page: number) => void;
  /** Reset to page 1 and optionally update URL params */
  resetPage: (paramsToUpdate?: Record<string, string | null>) => void;
  /** Whether to show pagination UI (when pagination data exists and totalPages > 1) */
  showPagination: boolean;
  /** Whether previous page exists */
  hasPrev: boolean;
  /** Whether next page exists */
  hasNext: boolean;
  /** Page numbers to display (e.g. [1,2,3,4,5]) */
  pageNumbers: number[];
  /** Start index for "Showing 1-12 of 50" */
  startItem: number;
  /** End index for "Showing 1-12 of 50" */
  endItem: number;
  /** Total item count */
  totalItems: number;
  /** Build URL with optional param overrides (does not navigate) */
  buildUrl: (page: number, extraParams?: Record<string, string | null>) => string;
}

export function usePagination({
  basePath,
  paramKey = "page",
  pagination,
  maxVisiblePages = 5,
}: UsePaginationOptions): UsePaginationReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPage = parseInt(searchParams.get(paramKey) || "1", 10) || 1;

  const [page, setPage] = useState(initialPage);

  // Sync page from URL when it changes (e.g. back/forward, external navigation)
  useEffect(() => {
    const p = parseInt(searchParams.get(paramKey) || "1", 10) || 1;
    setPage(p);
  }, [searchParams, paramKey]);

  const buildUrl = useCallback(
    (targetPage: number, extraParams?: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      if (targetPage === 1) params.delete(paramKey);
      else params.set(paramKey, String(targetPage));
      if (extraParams) {
        Object.entries(extraParams).forEach(([key, value]) => {
          if (value === null || value === "") params.delete(key);
          else params.set(key, value);
        });
      }
      const query = params.toString();
      return query ? `${basePath}?${query}` : basePath;
    },
    [basePath, paramKey, searchParams]
  );

  const goToPage = useCallback(
    (targetPage: number) => {
      setPage(targetPage);
      router.push(buildUrl(targetPage));
    },
    [router, buildUrl]
  );

  const resetPage = useCallback(
    (paramsToUpdate?: Record<string, string | null>) => {
      setPage(1);
      router.push(buildUrl(1, paramsToUpdate));
    },
    [router, buildUrl]
  );

  // Computed values when pagination data is provided
  const currentPage = pagination?.currentPage ?? page;
  const totalPages = pagination?.totalPages ?? 1;
  const totalItems = pagination?.totalItems ?? 0;
  const limit = pagination?.limit ?? 12;

  const showPagination = !!pagination && totalPages > 1;
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const startItem = totalPages > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endItem = Math.min(currentPage * limit, totalItems);

  // Page numbers to display
  const pageNumbers = (() => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= Math.ceil(maxVisiblePages / 2)) {
      return Array.from({ length: maxVisiblePages }, (_, i) => i + 1);
    }
    if (currentPage >= totalPages - Math.floor(maxVisiblePages / 2)) {
      return Array.from(
        { length: maxVisiblePages },
        (_, i) => totalPages - maxVisiblePages + 1 + i
      );
    }
    const half = Math.floor(maxVisiblePages / 2);
    return Array.from(
      { length: maxVisiblePages },
      (_, i) => currentPage - half + i
    );
  })();

  return {
    page: currentPage,
    goToPage,
    resetPage,
    showPagination,
    hasPrev,
    hasNext,
    pageNumbers,
    startItem,
    endItem,
    totalItems,
    buildUrl,
  };
}
