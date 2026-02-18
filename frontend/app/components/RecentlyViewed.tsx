"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { productAPI } from "@/lib/api";

const STORAGE_KEY = "didostati_recently_viewed";
const MAX_DISPLAY = 4;

type RecentlyViewedProduct = {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: { url: string; alt: string }[];
  brand: string;
  rating?: number;
  reviewsCount?: number;
  viewCount?: number;
  badge?: string;
  inStock: boolean;
  stock: number;
};

const RecentlyViewed = () => {
  const [items, setItems] = useState<RecentlyViewedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    (async () => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          setLoading(false);
          return;
        }

        const parsed = JSON.parse(raw) as { _id: string }[];
        if (!Array.isArray(parsed) || parsed.length === 0) {
          setLoading(false);
          return;
        }

        const ids = parsed.slice(0, MAX_DISPLAY).map((p) => p._id);
        const results = await Promise.all(
          ids.map((id) => productAPI.getByIdOptional(id))
        );

        if (cancelled) return;

        const products: RecentlyViewedProduct[] = [];
        for (const res of results) {
          if (res?.status === "success" && res?.data?.product) {
            products.push(res.data.product);
          }
        }
        setItems(products);

        // Keep localStorage in sync: only IDs that still exist (avoids 404s after re-seed)
        if (products.length > 0) {
          const toStore = products.map((p) => ({
            _id: p._id,
            name: p.name,
            description: p.description,
            price: p.price,
            originalPrice: p.originalPrice,
            images: p.images,
            brand: p.brand,
            inStock: p.inStock,
            stock: p.stock,
          }));
          const rest = parsed.filter((p: { _id: string }) => !ids.includes(p._id));
          const merged = [...toStore, ...rest].slice(0, 10);
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } else if (parsed.length > 0) {
          // All refetches failed (e.g. DB was re-seeded) – clear stale list
          window.localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        console.error("Failed to load recently viewed products", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || items.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
              <span className="bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                ბოლოს ნანახი პროდუქტები
              </span>
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              სწრაფად დაბრუნდით პროდუქტებზე, რომლებიც უკვე დაათვალიერეთ.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
          {items.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;

