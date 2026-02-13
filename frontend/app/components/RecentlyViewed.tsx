"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

const STORAGE_KEY = "didostati_recently_viewed";

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
  badge?: string;
  inStock: boolean;
  stock: number;
};

const RecentlyViewed = () => {
  const [items, setItems] = useState<RecentlyViewedProduct[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as RecentlyViewedProduct[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setItems(parsed);
      }
    } catch (e) {
      console.error("Failed to load recently viewed products", e);
    }
  }, []);

  if (items.length === 0) {
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;

