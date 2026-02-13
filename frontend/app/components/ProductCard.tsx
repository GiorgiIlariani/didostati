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
import { ShoppingCart, Star, Check, Heart, Eye, TrendingUp } from "lucide-react";
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
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || '',
      brand: product.brand,
      maxStock: product.stock
    });
    
    // Show "Added!" feedback
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="group bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10">
      {/* Image */}
      <Link href={`/products/${product._id}`} className="relative block aspect-square overflow-hidden bg-slate-900">
        <Image
          src={product.images[0]?.url || '/placeholder.jpg'}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.badge && (
            <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist toggle */}
        <button
          type="button"
          onClick={async (e) => {
            e.preventDefault();
            await toggleWishlist(product._id);
          }}
          className="absolute top-3 right-3 p-2.5 bg-slate-900/80 hover:bg-slate-800 rounded-full transition-colors touch-manipulation z-10"
          aria-label={isInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}>
          <Heart 
            className={`w-5 h-5 transition-colors ${
              isInWishlist(product._id) 
                ? "fill-red-500 text-red-500" 
                : "text-slate-300 hover:text-red-400"
            }`} 
          />
        </button>
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Brand */}
        <p className="text-xs text-slate-400 mb-1">{product.brand}</p>
        
        {/* Name */}
        <Link href={`/products/${product._id}`}>
          <h3 className="text-base font-semibold text-slate-100 mb-2 line-clamp-2 hover:text-orange-400 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.rating !== undefined && product.rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            <span className="text-slate-300 text-sm font-semibold">{product.rating.toFixed(1)}</span>
            {product.reviewsCount !== undefined && (
              <span className="text-slate-500 text-xs">({product.reviewsCount} შეფასება)</span>
            )}
          </div>
        )}

        {/* Social Proof */}
        <div className="flex items-center gap-3 mb-3 text-xs text-slate-400">
          {product.viewCount !== undefined && product.viewCount > 0 && (
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{product.viewCount.toLocaleString()} ნახვა</span>
            </div>
          )}
          {product.soldCount !== undefined && product.soldCount > 0 && (
            <div className="flex items-center gap-1 text-emerald-400">
              <TrendingUp className="w-3 h-3" />
              <span className="font-semibold">{product.soldCount} გაყიდული დღეს</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-bold text-orange-400">
            ₾{product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-slate-500 line-through">
              ₾{product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock || justAdded}
          className="w-full py-4 px-4 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 active:from-orange-700 active:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md touch-manipulation min-h-[52px] flex items-center justify-center gap-2">
          {justAdded ? (
            <>
              <Check className="w-5 h-5" />
              <span className="hidden sm:inline">დამატებულია!</span>
              <span className="sm:hidden">დამატებულია!</span>
            </>
          ) : product.inStock ? (
            <>
              <ShoppingCart className="w-5 h-5" />
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
