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

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProducts } from "@/lib/hooks/useProducts";
import { categoryAPI } from "@/lib/api";
import ProductCard from "../components/ProductCard";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";

  const [categories, setCategories] = useState<Category[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const pricePresets = [
    { label: "₾0 - ₾50", min: 0, max: 50 },
    { label: "₾50 - ₾100", min: 50, max: 100 },
    { label: "₾100 - ₾200", min: 100, max: 200 },
    { label: "₾200+", min: 200, max: undefined as number | undefined },
  ];

  // Fetch products and categories
  const { products, loading, error } = useProducts({
    category: selectedCategory || undefined,
    brand: selectedBrand || undefined,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    inStock: inStockOnly || undefined,
    sort: sortBy || undefined,
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

  const hasActiveFilters =
    !!selectedCategory ||
    !!selectedBrand ||
    !!minPrice ||
    !!maxPrice ||
    inStockOnly ||
    !!sortBy;

  const activeFilterCount = [
    selectedCategory,
    selectedBrand,
    minPrice,
    maxPrice,
    inStockOnly ? "inStock" : "",
    sortBy,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedBrand("");
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setSortBy("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    } else {
      params.delete("q");
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
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
              className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2.5 w-full sm:w-72"
            >
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
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 text-sm hover:bg-slate-700 transition-colors"
            >
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
            {selectedCategory && (
              <button
                type="button"
                onClick={() => setSelectedCategory("")}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 text-slate-100 text-xs border border-slate-600"
              >
                კატეგორია:{" "}
                {
                  categories.find((c) => c._id === selectedCategory)?.name ??
                  "არჩევანი"
                }
                <X className="w-3 h-3" />
              </button>
            )}
            {selectedBrand && (
              <button
                type="button"
                onClick={() => setSelectedBrand("")}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 text-slate-100 text-xs border border-slate-600"
              >
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
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 text-slate-100 text-xs border border-slate-600"
              >
                ფასი: {minPrice || "0"} - {maxPrice || "∞"} ₾
                <X className="w-3 h-3" />
              </button>
            )}
            {inStockOnly && (
              <button
                type="button"
                onClick={() => setInStockOnly(false)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 text-slate-100 text-xs border border-slate-600"
              >
                მხოლოდ მარაგში
                <X className="w-3 h-3" />
              </button>
            )}
            {sortBy && (
              <button
                type="button"
                onClick={() => setSortBy("")}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 text-slate-100 text-xs border border-slate-600"
              >
                დალაგება: {sortBy}
                <X className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900 text-slate-300 text-xs border border-slate-700 hover:bg-slate-800"
            >
              გასუფთავება
            </button>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category */}
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  კატეგორია
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-3 text-base bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 outline-none"
                >
                  <option value="">ყველა კატეგორია</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  ბრენდი
                </label>
                <input
                  type="text"
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  placeholder="მაგ: Knauf"
                  className="w-full px-3 py-3 text-base bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 outline-none"
                />
              </div>

              {/* Price range */}
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  ფასის დიაპაზონი (₾)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-1/2 px-3 py-3 text-base bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-1/2 px-3 py-3 text-base bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 outline-none"
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {pricePresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setMinPrice(String(preset.min));
                        setMaxPrice(
                          preset.max !== undefined ? String(preset.max) : "",
                        );
                      }}
                      className="px-3 py-2 rounded-full text-xs bg-slate-900 border border-slate-700 text-slate-300 hover:border-orange-500 hover:text-orange-400 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort + stock */}
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">
                    დალაგება
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-3 text-base bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 outline-none"
                  >
                    <option value="">ნაგულისხმევი</option>
                    <option value="price">ფასი (ზრდადობით)</option>
                    <option value="-price">ფასი (კლებადობით)</option>
                    <option value="-rating">რейтингით</option>
                    <option value="-createdAt">უახლესი</option>
                  </select>
                </div>
                <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-5 h-5 text-orange-500 focus:ring-orange-500 border-slate-600 bg-slate-900"
                  />
                  მხოლოდ მარაგში
                </label>
              </div>
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
          <div className="py-20 text-center text-slate-400">
            პროდუქტები ვერ მოიძებნა შერჩეული ფილტრებით.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

