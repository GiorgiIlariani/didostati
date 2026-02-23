"use client";

/**
 * Products Page
 * Enhanced product filters:
 * - Category select (from backend categories)
 * - Brand text filter
 * - Price range with quick presets
 * - In‑stock only toggle
 * - Sort select (price/rating/newest)
 * - Active filter chips with clear buttons
 * Uses useProducts() hook so API logic stays centralized.
 */

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProducts } from "@/lib/hooks/useProducts";
import { usePagination } from "@/lib/hooks/usePagination";
import { categoryAPI, productAPI } from "@/lib/api";
import ProductCard from "../components/ProductCard";
import PaginationBar from "../components/PaginationBar";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  parent?: { _id: string; name: string; slug: string } | null;
  isSubcategory?: boolean;
}

function ProductsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";

  const PRODUCTS_PER_PAGE = 12;

  const [categories, setCategories] = useState<Category[]>([]);
  const [filterOptions, setFilterOptions] = useState<{
    sizes: string[];
    purposes: string[];
  }>({ sizes: [], purposes: [] });

  // Filters
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Sync search query from URL when navigating
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearchQuery(q);
  }, [searchParams]);

  const pricePresets = [
    { label: "₾0 - ₾50", min: 0, max: 50 },
    { label: "₾50 - ₾100", min: 50, max: 100 },
    { label: "₾100 - ₾200", min: 100, max: 200 },
    { label: "₾200+", min: 200, max: undefined as number | undefined },
  ];

  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10) || 1;

  // Fetch products: server-side search when query present, else filtered list
  const {
    products,
    loading,
    error,
    pagination: productsPagination,
  } = useProducts({
    search: searchQuery.trim() || undefined,
    page: searchQuery.trim() ? undefined : pageFromUrl,
    limit: PRODUCTS_PER_PAGE,
    category: selectedCategory || undefined,
    brand: selectedBrand || undefined,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    size: selectedSize || undefined,
    purpose: selectedPurpose || undefined,
    inStock: inStockOnly || undefined,
    sort: sortBy || undefined,
  });

  const pagination = usePagination({
    basePath: "/products",
    paramKey: "page",
    pagination:
      !searchQuery.trim() && productsPagination
        ? {
            currentPage: productsPagination.currentPage,
            totalPages: productsPagination.totalPages,
            totalItems: productsPagination.totalProducts,
            limit: PRODUCTS_PER_PAGE,
          }
        : null,
  });

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await categoryAPI.getAll();
        if (res.status === "success") {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        const res = await productAPI.getFilterOptions();
        if (res.status === "success" && res.data) {
          setFilterOptions({
            sizes: res.data.sizes || [],
            purposes: res.data.purposes || [],
          });
        }
      } catch (err) {
        console.error("Failed to fetch filter options", err);
      }
    }
    fetchFilterOptions();
  }, []);

  const hasActiveFilters =
    !!searchQuery.trim() ||
    !!selectedCategory ||
    !!selectedBrand ||
    !!minPrice ||
    !!maxPrice ||
    !!selectedSize ||
    !!selectedPurpose ||
    inStockOnly ||
    !!sortBy;

  const activeFilterCount = [
    searchQuery.trim(),
    selectedCategory,
    selectedBrand,
    minPrice,
    maxPrice,
    selectedSize,
    selectedPurpose,
    inStockOnly ? "inStock" : "",
    sortBy,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedBrand("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedSize("");
    setSelectedPurpose("");
    setInStockOnly(false);
    setSortBy("");
    router.push("/products");
  };

  const clearSearch = () => {
    setSearchQuery("");
    pagination.resetPage({ q: null, page: null });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
      params.delete("page");
    } else {
      params.delete("q");
      params.delete("page");
    }
    router.push(
      params.toString() ? `/products?${params.toString()}` : "/products",
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header + search + filter toggle */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-1">
              ყველა პროდუქტი
            </h1>
            <p className="text-slate-400 text-sm">
              გაფილტრე პროდუქტი კატეგორიის, ბრენდის, ფასისა და მარაგის მიხედვით.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Inline search for this page (optional, client-side URL only) */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2.5 w-full sm:w-72">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="ძებნა პროდუქტებში..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500 w-full"
              />
            </form>

            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 text-sm hover:bg-slate-700 transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
              <span>ფილტრები</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-orange-500 text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={clearSearch}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 text-slate-100 text-xs border border-slate-600">
                ძებნა: &quot;{searchQuery.trim()}&quot;
                <X className="w-3 h-3" />
              </button>
            )}
            {selectedCategory && (
              <button
                type="button"
                onClick={() => setSelectedCategory("")}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 text-slate-100 text-xs border border-slate-600">
                კატეგორია:{" "}
                {(() => {
                  const cat = categories.find(
                    (c) => c._id === selectedCategory,
                  );
                  if (!cat) return "არჩევანი";
                  return cat.isSubcategory && cat.parent
                    ? `${cat.parent.name} › ${cat.name}`
                    : cat.name;
                })()}
                <X className="w-3 h-3" />
              </button>
            )}
            {selectedBrand && (
              <button
                type="button"
                onClick={() => setSelectedBrand("")}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 text-slate-100 text-xs border border-slate-600">
                ბრენდი: {selectedBrand}
                <X className="w-3 h-3" />
              </button>
            )}
            {(minPrice || maxPrice) && (
              <button
                type="button"
                onClick={() => {
                  setMinPrice("");
                  setMaxPrice("");
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 text-slate-100 text-xs border border-slate-600">
                ფასი: {minPrice || "0"} - {maxPrice || "∞"} ₾
                <X className="w-3 h-3" />
              </button>
            )}
            {selectedSize && (
              <button
                type="button"
                onClick={() => setSelectedSize("")}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 text-slate-100 text-xs border border-slate-600">
                ზომა: {selectedSize}
                <X className="w-3 h-3" />
              </button>
            )}
            {selectedPurpose && (
              <button
                type="button"
                onClick={() => setSelectedPurpose("")}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 text-slate-100 text-xs border border-slate-600">
                დანიშნულება: {selectedPurpose}
                <X className="w-3 h-3" />
              </button>
            )}
            {inStockOnly && (
              <button
                type="button"
                onClick={() => setInStockOnly(false)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 text-slate-100 text-xs border border-slate-600">
                მხოლოდ მარაგში
                <X className="w-3 h-3" />
              </button>
            )}
            {sortBy && (
              <button
                type="button"
                onClick={() => setSortBy("")}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 text-slate-100 text-xs border border-slate-600">
                დალაგება: {sortBy}
                <X className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900 text-slate-300 text-xs border border-slate-700 hover:bg-slate-800">
              გასუფთავება
            </button>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 rounded-2xl bg-slate-900/80 backdrop-blur-sm p-4 sm:p-6 shadow-xl shadow-black/20 ring-1 ring-slate-700/80 max-h-[85vh] overflow-y-auto overscroll-contain">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Category */}
              <div className="space-y-1.5 min-w-0">
                <label className="block text-slate-400 text-xs font-medium uppercase tracking-wider">
                  კატეგორია
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select w-full min-h-[44px] px-4 py-3 text-sm text-slate-100 bg-slate-800/90 border border-slate-600/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 transition-all cursor-pointer appearance-none">
                  <option value="">ყველა კატეგორია</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.isSubcategory && cat.parent
                        ? `${cat.parent.name} › ${cat.name}`
                        : cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div className="space-y-1.5 min-w-0">
                <label className="block text-slate-400 text-xs font-medium uppercase tracking-wider">
                  ბრენდი
                </label>
                <input
                  type="text"
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  placeholder="მაგ: Knauf, Bosch"
                  className="w-full min-h-[44px] px-4 py-3 text-sm text-slate-100 bg-slate-800/90 border border-slate-600/80 rounded-xl placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 transition-all"
                />
              </div>

              {/* Size */}
              <div className="space-y-1.5 min-w-0">
                <label className="block text-slate-400 text-xs font-medium uppercase tracking-wider">
                  ზომა
                </label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="filter-select w-full min-h-[44px] px-4 py-3 text-sm text-slate-100 bg-slate-800/90 border border-slate-600/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 transition-all cursor-pointer appearance-none">
                  <option value="">ყველა ზომა</option>
                  {filterOptions.sizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Purpose */}
              <div className="space-y-1.5 min-w-0">
                <label className="block text-slate-400 text-xs font-medium uppercase tracking-wider">
                  დანიშნულება
                </label>
                <select
                  value={selectedPurpose}
                  onChange={(e) => setSelectedPurpose(e.target.value)}
                  className="filter-select w-full min-h-[44px] px-4 py-3 text-sm text-slate-100 bg-slate-800/90 border border-slate-600/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 transition-all cursor-pointer appearance-none">
                  <option value="">ყველა დანიშნულება</option>
                  {filterOptions.purposes.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price range */}
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-2 min-w-0">
                <label className="block text-slate-400 text-xs font-medium uppercase tracking-wider">
                  ფასის დიაპაზონი (₾)
                </label>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
                  <input
                    type="number"
                    placeholder="მინ."
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="flex-1 min-w-0 min-h-[44px] px-4 py-3 text-sm text-slate-100 bg-slate-800/90 border border-slate-600/80 rounded-xl placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 transition-all"
                  />
                  <span className="text-slate-500 shrink-0 self-center hidden sm:inline">–</span>
                  <input
                    type="number"
                    placeholder="მაქს."
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="flex-1 min-w-0 min-h-[44px] px-4 py-3 text-sm text-slate-100 bg-slate-800/90 border border-slate-600/80 rounded-xl placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 transition-all"
                  />
                </div>
                <div className="flex flex-wrap gap-2 pt-2 sm:pt-1">
                  {pricePresets.map((preset) => {
                    const isActive =
                      minPrice === String(preset.min) &&
                      (preset.max === undefined
                        ? !maxPrice
                        : maxPrice === String(preset.max));
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setMinPrice(String(preset.min));
                          setMaxPrice(
                            preset.max !== undefined ? String(preset.max) : "",
                          );
                        }}
                        className={
                          isActive
                            ? "px-3 py-2.5 sm:px-3.5 sm:py-1.5 rounded-lg text-xs font-medium bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/40 transition-all min-h-[40px] touch-manipulation"
                            : "px-3 py-2.5 sm:px-3.5 sm:py-1.5 rounded-lg text-xs font-medium bg-slate-800/90 text-slate-400 hover:text-slate-200 hover:bg-slate-700/80 ring-1 ring-slate-600/60 transition-all min-h-[40px] touch-manipulation"
                        }>
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort + stock */}
              <div className="space-y-3 sm:col-span-2 lg:col-span-2 min-w-0">
                <div className="space-y-1.5">
                  <label className="block text-slate-400 text-xs font-medium uppercase tracking-wider">
                    დალაგება
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="filter-select w-full min-h-[44px] px-4 py-3 text-sm text-slate-100 bg-slate-800/90 border border-slate-600/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50 transition-all cursor-pointer appearance-none">
                    <option value="">ნაგულისხმევი</option>
                    <option value="price">ფასი (ზრდადობით)</option>
                    <option value="-price">ფასი (კლებადობით)</option>
                    <option value="-rating">რейтингით</option>
                    <option value="-createdAt">უახლესი</option>
                  </select>
                </div>
                <label className="inline-flex items-center gap-3 py-2 cursor-pointer group min-h-[44px] touch-manipulation">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-orange-500 focus:ring-2 focus:ring-orange-500/40 focus:ring-offset-0 cursor-pointer shrink-0"
                  />
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    მხოლოდ მარაგში
                  </span>
                </label>
              </div>
            </div>
            {/* Mobile close button */}
            <div className="mt-4 pt-4 border-t border-slate-700/80 sm:hidden">
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="w-full py-3 rounded-xl bg-orange-500/20 text-orange-400 font-medium text-sm hover:bg-orange-500/30 transition-colors touch-manipulation">
                დახურვა
              </button>
            </div>
          </div>
        )}

        {/* Products grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="inline-block w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-400">{error}</div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-slate-400 mb-4">
              პროდუქტები ვერ მოიძებნა შერჩეული ფილტრებით.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-5 py-2.5 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors text-sm font-medium">
                გაასუფთავე ფილტრები
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
              {products.map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            <PaginationBar {...pagination} className="mt-10" />
          </>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="inline-block w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
      <ProductsPageInner />
    </Suspense>
  );
}
