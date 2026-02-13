"use client";

/**
 * SearchBar Component (Smart Search)
 * Provides live search suggestions as user types:
 * - Debounced search (300ms delay)
 * - Shows up to 5 results in dropdown
 * - Click result to go to product page
 * - "See all results" button links to /products?q=...
 * - Closes on outside click
 */
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { productAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

interface SearchResult {
  _id: string;
  name: string;
  brand: string;
  price: number;
  images: { url: string; alt: string }[];
}

const SearchBar = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await productAPI.search(query.trim(), 5);
        if (res?.status === "success") {
          setResults(res.data.products || []);
          setOpen(true);
        }
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
  };

  const goToProduct = (id: string) => {
    router.push(`/products/${id}`);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2.5 transition-all hover:ring-2 hover:ring-orange-400/50 focus-within:ring-2 focus-within:ring-orange-500 group">
        <Search className="w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors shrink-0" />
        <input
          id="search"
          placeholder="ძებნა..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="text-sm outline-0 bg-transparent text-slate-200 placeholder:text-slate-400 w-full min-w-0"
        />
      </form>

      {open && (results.length > 0 || loading) && (
        <div className="absolute left-0 right-0 sm:right-auto mt-2 w-full sm:w-[260px] md:w-[320px] bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {loading && (
            <div className="px-4 py-3 text-sm text-slate-400">ძებნა...</div>
          )}
          {!loading && results.length > 0 && (
            <>
              <ul className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                {results.map((p) => (
                  <li
                    key={p._id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 cursor-pointer"
                    onClick={() => goToProduct(p._id)}>
                    <div className="w-10 h-10 rounded-md bg-slate-800 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.images?.[0]?.url || "/placeholder.jpg"}
                        alt={p.images?.[0]?.alt || p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-100 truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {p.brand} • ₾{p.price.toFixed(2)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => {
                  router.push(
                    `/products?q=${encodeURIComponent(query.trim())}`,
                  );
                  setOpen(false);
                }}
                className="w-full text-center text-xs px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border-t border-slate-700">
                ნახე ყველა შედეგი
              </button>
            </>
          )}
          {!loading && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-slate-400">
              შედეგი ვერ მოიძებნა
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
