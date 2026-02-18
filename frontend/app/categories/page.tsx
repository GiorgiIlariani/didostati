"use client";

/**
 * Categories Page
 * Full-page view of all product categories with links to filtered products.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { categoryAPI } from "@/lib/api";
import { Loader2, ArrowRight } from "lucide-react";

const CATEGORY_IMAGES: Record<string, string> = {
  "khis-masalebi": "/assets/images/khis-masalebi.jpeg",
  "santeknika-tsklebi": "/assets/images/santeknika-tsklebi.jpeg",
  "tabashir-muqua": "/assets/images/tabashir-muqua.jpeg",
  "mosapirketebeli-sasheni-narevebi":
    "/assets/images/mosapirketebeli-sasheni-narevebi.jpeg",
  "saghebavebi-saparebi": "/assets/images/saghebavebi-saparebi.jpeg",
  "instrumentebi-samushao-khelsatsqoebi":
    "/assets/images/instrumentebi-samushao-khelsatsqoebi.jpeg",
};

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: { _id: string; name: string; slug: string } | null;
  isSubcategory?: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const response = await categoryAPI.getAll();
        if (response.status === "success") {
          const raw = response.data?.categories ?? response.data ?? [];
          const all = Array.isArray(raw) ? raw : [];
          // Top-level: no parent in DB; subcategories have parent set
          const topLevel = all.filter((c: Category) => c && c.parent == null);
          setCategories(topLevel.length > 0 ? topLevel : all);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "შეცდომა კატეგორიების ჩატვირთვისას");
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 py-16 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-100 mb-4">
            კატეგორიები
          </h1>
          <p className="text-red-400 mb-2">{error}</p>
          <p className="text-slate-500 text-sm">
            შეამოწმეთ, რომ backend გაშვებულია (port 5000) და ბაზა დასიდულია.
          </p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-100 mb-4">
            კატეგორიები
          </h1>
          <p className="text-slate-400 mb-2">კატეგორიები ვერ მოიძებნა.</p>
          <p className="text-slate-500 text-sm">
            გაუშვით seed: <code className="bg-slate-800 px-2 py-1 rounded">npm run seed</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-3">
            ყველა კატეგორია
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            აირჩიეთ კატეგორია და გაეცანით ჩვენს პროდუქტებს
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/products?category=${category._id}`}
              className="group relative rounded-2xl overflow-hidden bg-slate-800/50 border border-slate-700 hover:border-orange-500 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10"
            >
              <div className="aspect-4/3 relative overflow-hidden">
                <img
                  src={
                    CATEGORY_IMAGES[category.slug] ?? category.image ?? ""
                  }
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-60 group-hover:scale-105 transition-all duration-300"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
                  }}
                />
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <h2 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors mb-2">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-slate-300 text-sm line-clamp-2 mb-3">
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center text-orange-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>პროდუქტების ნახვა</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
