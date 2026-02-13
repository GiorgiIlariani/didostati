"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { categoryAPI } from '@/lib/api';
import { Loader2, ArrowRight } from 'lucide-react';

// Your category images (by slug) from public/assets/images/
const CATEGORY_IMAGES: Record<string, string> = {
  'khis-masalebi': '/assets/images/khis-masalebi.jpeg',
  'santeknika-tsklebi': '/assets/images/santeknika-tsklebi.jpeg',
  'tabashir-muqua': '/assets/images/tabashir-muqua.jpeg',
  'mosapirketebeli-sasheni-narevebi': '/assets/images/mosapirketebeli-sasheni-narevebi.jpeg',
  'saghebavebi-saparebi': '/assets/images/saghebavebi-saparebi.jpeg',
  'instrumentebi-samushao-khelsatsqoebi': '/assets/images/instrumentebi-samushao-khelsatsqoebi.jpeg',
};

const CategoriesGrid = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const response = await categoryAPI.getAll();
        if (response.status === 'success') {
          setCategories(response.data.categories);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (error || categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-slate-100">შეიძინეთ </span>
            <span className="bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              კატეგორიის მიხედვით
            </span>
          </h2>
          <p className="text-slate-400 text-lg">
            ყველაფერი რაც გჭირდებათ სახლის გასაუმჯობესებელი პროექტებისთვის
          </p>
        </div>

        {/* Categories - single horizontal line with scroll */}
        <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
          <div className="flex gap-4 flex-nowrap min-w-0" style={{ width: 'max-content' }}>
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/products?category=${category._id}`}
                className="group relative shrink-0 w-44 h-44 md:w-52 md:h-52 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 hover:border-orange-500 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20"
              >
                {/* Image - native img so local paths with spaces work */}
                <img
                  src={CATEGORY_IMAGES[category.slug] ?? category.image ?? ''}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-50 group-hover:scale-110 transition-all duration-300"
                />
                {/* Overlay - inline gradient so it works in all Tailwind versions */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }}
                />
                {/* Content */}
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <h3 className="text-white font-bold text-sm leading-tight mb-1 group-hover:text-orange-400 transition-colors">
                    {category.name}
                  </h3>
                  <div className="flex items-center text-orange-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>ნახე</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoriesGrid;
