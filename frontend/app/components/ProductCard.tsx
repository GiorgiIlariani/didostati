"use client";

/**
 * ProductCard Component
 * Displays a single product card with:
 * - Product image with badges (Sale, discount %)
 * - Wishlist toggle button
 * - Product name, brand, rating
 * - Price (with original price if discounted)
 * - Add to cart button
 * - Social proof (view count, sales today) - hidden from UI but logic exists
 */
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Star,
  Check,
  Heart,
  Eye,
  TrendingUp,
} from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { useWishlist } from "@/lib/context/WishlistContext";
import { useState } from "react";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    images: Array<{ url: string; alt: string }>;
    brand: string;
    inStock: boolean;
    stock: number;
    badge?: string;
    rating?: number;
    reviewsCount?: number;
    viewCount?: number;
    soldCount?: number;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [justAdded, setJustAdded] = useState(false);

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  const handleAddToCart = () => {
    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || "",
      brand: product.brand,
      maxStock: product.stock,
    });

    // Show "Added!" feedback
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="group bg-slate-800 rounded-lg sm:rounded-xl overflow-hidden border border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 h-full flex flex-col">
      {/* Image: shorter on mobile so more products fit above the fold */}
      <Link
        href={`/products/${product._id}`}
        className="relative block aspect-4/3 overflow-hidden bg-slate-900">
        <Image
          src={
            product.images[0]?.url ||
            "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=400&fit=crop"
          }
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized={
            (product.images[0]?.url || "").startsWith("http://localhost") ||
            (product.images[0]?.url || "").startsWith("https://localhost")
          }
        />

        {/* Badges - tiny on mobile */}
        <div className="absolute top-1 left-1 sm:top-3 sm:left-3 flex flex-col gap-0.5 sm:gap-2">
          {product.badge && (
            <span className="px-1.5 py-0.5 sm:px-3 sm:py-1 bg-orange-500 text-white text-[10px] sm:text-xs font-bold rounded sm:rounded-full">
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="px-1.5 py-0.5 sm:px-3 sm:py-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded sm:rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist - smaller on mobile */}
        <button
          type="button"
          onClick={async (e) => {
            e.preventDefault();
            await toggleWishlist(product._id);
          }}
          className="absolute top-1 right-1 sm:top-3 sm:right-3 p-1.5 sm:p-2.5 bg-slate-900/80 hover:bg-slate-800 rounded-full transition-colors touch-manipulation z-10 min-w-[32px] min-h-[32px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
          aria-label={
            isInWishlist(product._id)
              ? "Remove from wishlist"
              : "Add to wishlist"
          }>
          <Heart
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
              isInWishlist(product._id)
                ? "fill-red-500 text-red-500"
                : "text-slate-300 hover:text-red-400"
            }`}
          />
        </button>
      </Link>

      {/* Content - minimal on mobile, tighter on desktop */}
      <div className="p-2 sm:p-3 lg:p-4 flex flex-col flex-1">
        {/* Brand - tiny on mobile */}
        <p className="text-[10px] sm:text-xs text-slate-400 mb-0.5 sm:mb-1 truncate">
          {product.brand}
        </p>

        {/* Name - one line on mobile, compact on desktop */}
        <Link href={`/products/${product._id}`}>
          <h3 className="text-xs sm:text-sm md:text-base font-semibold text-slate-100 mb-1 sm:mb-1.5 md:mb-2 line-clamp-1 sm:line-clamp-2 hover:text-orange-400 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating + social proof removed on list cards to make height smaller */}

        {/* Price - compact on mobile and desktop */}
        <div className="flex items-baseline gap-1.5 sm:gap-2 mb-1.5 sm:mb-2.5 lg:mb-3">
          <span className="text-sm sm:text-lg md:text-xl font-bold text-orange-400">
            ₾{product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-[10px] sm:text-sm text-slate-500 line-through">
              ₾{product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to cart - pinned to bottom */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock || justAdded}
          className="mt-auto w-full py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 bg-linear-to-r from-orange-500 to-yellow-500 text-white text-xs sm:text-sm md:text-base font-semibold rounded-md sm:rounded-lg hover:from-orange-600 hover:to-yellow-600 active:from-orange-700 active:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md touch-manipulation min-h-[40px] sm:min-h-[46px] md:min-h-[52px] flex items-center justify-center gap-1.5 sm:gap-2">
          {justAdded ? (
            <>
              <Check className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="hidden sm:inline">დამატებულია!</span>
              <span className="sm:hidden">დამატებულია!</span>
            </>
          ) : product.inStock ? (
            <>
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="hidden sm:inline">კალათაში დამატება</span>
              <span className="sm:hidden">დამატება</span>
            </>
          ) : (
            "არ არის ნაშთში"
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
