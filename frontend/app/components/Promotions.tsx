"use client";

import { usePromotions } from "@/lib/hooks/useProducts";
import ProductCard from "./ProductCard";
import { Loader2 } from "lucide-react";

const Promotions = () => {
  const { products, loading, error } = usePromotions(8);

  if (loading) {
    return (
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <span className="ml-3 text-slate-300">იტვირთება...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center py-20">
            <p className="text-red-400">შეცდომა: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't show section if no promotions
  }

  return (
    <section className="py-16 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              აქციები და სპეციალური შეთავაზებები
            </span>
          </h2>
          <p className="text-slate-400 text-lg">
            გამოიყენეთ შესაძლებლობა და შეიძინეთ ხელსაყრელ ფასად
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Promotions;
