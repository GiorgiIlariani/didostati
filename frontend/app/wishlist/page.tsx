"use client";

import { useEffect, useState } from "react";
import { useWishlist } from "@/lib/context/WishlistContext";
import { productAPI } from "@/lib/api";
import ProductCard from "../components/ProductCard";
import { Heart } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: { url: string; alt: string }[];
  brand: string;
  rating?: number;
  reviews?: number;
  badge?: string;
  inStock: boolean;
  stock: number;
}

export default function WishlistPage() {
  const { wishlistIds } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      if (wishlistIds.length === 0) {
        setProducts([]);
        return;
      }
      setLoading(true);
      try {
        const results = await Promise.all(
          wishlistIds.map(async (id) => {
            try {
              const res = await productAPI.getById(id);
              if (res.status === "success") {
                return res.data.product as Product;
              }
            } catch (e) {
              console.error("Failed to load wishlist product", id, e);
            }
            return null;
          })
        );
        setProducts(results.filter((p): p is Product => p !== null));
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [wishlistIds]);

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
            <Heart className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                რჩეულები
              </span>
            </h1>
            <p className="text-slate-400 text-sm">
              შეინახეთ პროდუქტები რჩეულებში, რომ მარტივად დაბრუნდეთ მათთან.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-400">იტვირთება რჩეულები...</p>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-slate-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-200 mb-2">
              ჯერ არ გაქვთ რჩეულები
            </h2>
            <p className="text-slate-400">
              დაამატეთ პროდუქტები „რჩეულებში“, რათა მარტივად იპოვოთ ისინი მოგვიანებით.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

