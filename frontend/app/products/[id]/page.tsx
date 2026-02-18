"use client";

/**
 * Product Detail Page
 * Shows full product information:
 * - Product images (main + thumbnails)
 * - Product name, brand, rating
 * - Price (with discount if applicable)
 * - Stock status
 * - Description
 * - Quantity selector
 * - Add to cart button
 * - Basic product info only (keep it simple)
 */
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { productAPI, supportAPI, reviewAPI } from "@/lib/api";
import { useAuth } from "@/lib/context/AuthContext";
import { useCart } from "@/lib/context/CartContext";
import { useWishlist } from "@/lib/context/WishlistContext";
import ProductCard from "@/app/components/ProductCard";
import {
  ShoppingCart,
  Heart,
  Star,
  Truck,
  Shield,
  ArrowLeft,
  Check,
  Package,
  MinusCircle,
  PlusCircle,
  Eye,
  TrendingUp,
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: Array<{ url: string; alt: string }>;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  brand: string;
  stock: number;
  inStock: boolean;
  rating?: number;
  reviewsCount?: number;
  reviews?: Array<{
    _id: string;
    user: string;
    name: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  badge?: string;
  specifications?: Array<{ key: string; value: string }>;
  manualUrl?: string;
  videoUrl?: string;
  viewCount?: number;
  soldCount?: number;
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { cart, addToCart, isInCart, getItemQuantity } = useCart();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [consultName, setConsultName] = useState("");
  const [consultPhone, setConsultPhone] = useState("");
  const [consultMessage, setConsultMessage] = useState("");
  const [consultSending, setConsultSending] = useState(false);
  const [consultSuccess, setConsultSuccess] = useState("");
  const [consultError, setConsultError] = useState("");
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [related, setRelated] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // Track recently viewed products in localStorage
  useEffect(() => {
    if (!product) return;
    if (typeof window === "undefined") return;

    const STORAGE_KEY = "didostati_recently_viewed";

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const existing: any[] = raw ? JSON.parse(raw) : [];

      const simplified = {
        _id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        images: product.images,
        brand: product.brand,
        inStock: product.inStock,
        stock: product.stock,
        rating: product.rating,
        reviewsCount: product.reviewsCount,
      };

      const filtered = existing.filter((p) => p._id !== product._id);
      const updated = [simplified, ...filtered].slice(0, 10);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save recently viewed", e);
    }
  }, [product]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await productAPI.getById(params.id as string);
        if (response.status === "success") {
          setProduct(response.data.product);
        }
      } catch (err: any) {
        setError(err.message || "პროდუქტის ჩატვირთვა ვერ მოხერხდა");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  // Load related products by same category (and different _id)
  useEffect(() => {
    if (!product) return;
    const categoryId = product.category?._id;
    if (!categoryId) return;

    async function fetchRelated() {
      setRelatedLoading(true);
      try {
        const res = await productAPI.getAll({
          category: categoryId,
          limit: 8,
          sort: "-rating",
        } as any);
        if (res.status === "success") {
          const items: Product[] = res.data.products || [];
          const currentId = product?._id;
          setRelated(
            currentId ? items.filter((p) => p._id !== currentId) : items,
          );
        }
      } catch (e) {
        console.error("Failed to load related products", e);
        setRelated([]);
      } finally {
        setRelatedLoading(false);
      }
    }

    fetchRelated();
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || "",
      brand: product.brand,
      maxStock: product.stock,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleConsultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (!consultName.trim() || !consultPhone.trim() || !consultMessage.trim()) {
      setConsultError("გთხოვთ შეავსოთ ყველა ველი.");
      return;
    }

    setConsultError("");
    setConsultSuccess("");
    setConsultSending(true);
    try {
      await supportAPI.create({
        name: consultName.trim(),
        phone: consultPhone.trim(),
        message: consultMessage.trim(),
        productId: product._id,
      });
      setConsultSuccess(
        "შეხვედრა/კონსულტაცია გაგზავნილია, მალე დაგიკავშირდებით.",
      );
      setConsultName("");
      setConsultPhone("");
      setConsultMessage("");
    } catch (err: any) {
      setConsultError(
        err.message || "ვერ გაიგზავნა მოთხოვნა, სცადეთ მოგვიანებით.",
      );
    } finally {
      setConsultSending(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=/products/${params.id}`);
      return;
    }
    if (!product) return;
    if (!reviewComment.trim()) {
      setReviewError("გთხოვთ დაწეროთ კომენტარი.");
      return;
    }
    setReviewError("");
    setReviewSubmitting(true);
    try {
      const res = await reviewAPI.addOrUpdate(
        product._id,
        reviewRating,
        reviewComment.trim(),
      );
      if (res.status === "success") {
        setProduct(res.data.product);
        setReviewComment("");
      }
    } catch (err: any) {
      setReviewError(err.message || "ვერ გაიგზავნა შეფასება.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 mt-4">იტვირთება...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-300 mb-2">
            პროდუქტი ვერ მოიძებნა
          </h2>
          <p className="text-slate-400 mb-6">
            {error || "ასეთი პროდუქტი არ არსებობს"}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all">
            <ArrowLeft className="w-4 h-4" />
            მთავარ გვერდზე
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  const mainImage = product.images[selectedImage]?.url || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=600&fit=crop";

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/" className="hover:text-orange-400 transition-colors">
            მთავარი
          </Link>
          <span>/</span>
          <Link
            href={`/category/${product.category.slug}`}
            className="hover:text-orange-400 transition-colors">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-slate-300">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-800 border border-slate-700">
              {product.badge && (
                <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-orange-500 text-white text-sm font-bold rounded-full">
                  {product.badge}
                </span>
              )}
              {discount > 0 && (
                <span className="absolute top-4 right-4 z-10 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                  -{discount}%
                </span>
              )}
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized={mainImage.startsWith("http://localhost") || mainImage.startsWith("https://localhost")}
              />
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? "border-orange-500"
                        : "border-slate-700 hover:border-slate-600"
                    }`}>
                    <Image
                      src={img.url}
                      alt={img.alt || product.name}
                      fill
                      className="object-cover"
                      sizes="120px"
                      unoptimized={img.url.startsWith("http://localhost") || img.url.startsWith("https://localhost")}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6 flex-wrap">
              {product.rating !== undefined && product.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  <span className="text-slate-100 font-semibold">
                    {product.rating.toFixed(1)}
                  </span>
                  {product.reviewsCount !== undefined && (
                    <span className="text-slate-400 text-sm">
                      ({product.reviewsCount} შეფასება)
                    </span>
                  )}
                </div>
              )}
              <span className="text-slate-500">|</span>
              <span className="text-slate-400 text-sm">
                ბრენდი:{" "}
                <span className="text-orange-400 font-semibold">
                  {product.brand}
                </span>
              </span>
            </div>
            {/* Social Proof */}
            {(product.viewCount !== undefined && product.viewCount > 0) ||
            (product.soldCount !== undefined && product.soldCount > 0) ? (
              <div className="flex items-center gap-4 mb-6 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                {product.viewCount !== undefined && product.viewCount > 0 && (
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <Eye className="w-4 h-4 text-slate-400" />
                    <span>
                      <span className="font-semibold text-slate-100">
                        {product.viewCount.toLocaleString()}
                      </span>{" "}
                      ადამიანმა ნახა
                    </span>
                  </div>
                )}
                {product.soldCount !== undefined && product.soldCount > 0 && (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-semibold">
                      {product.soldCount} გაყიდული დღეს
                    </span>
                  </div>
                )}
              </div>
            ) : null}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                ₾{product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-2xl text-slate-500 line-through">
                  ₾{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.inStock && product.stock > 0 ? (
                <div className="flex items-center gap-2 text-green-400">
                  <Check className="w-5 h-5" />
                  <span className="font-semibold">
                    ნაშთში ({product.stock} ცალი)
                  </span>
                </div>
              ) : (
                <div className="text-red-400 font-semibold">არ არის ნაშთში</div>
              )}
            </div>

            {/* Description */}
            <div className="mb-6 pb-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-slate-200 mb-2">
                აღწერა
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Media: PDF / Video */}
            {(product.manualUrl || product.videoUrl) && (
              <div className="mb-6 pb-6 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-slate-200 mb-3">
                  დამატებითი მასალები
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  {product.manualUrl && (
                    <Link
                      href={product.manualUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 text-sm font-semibold transition-colors">
                      📄 PDF ინსტრუქცია
                    </Link>
                  )}
                  {product.videoUrl && (
                    <Link
                      href={product.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 text-sm font-semibold transition-colors">
                      🎥 ვიდეო ინსტრუქცია
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {product.inStock && (
              <div className="mb-6">
                <label className="block text-slate-300 font-semibold mb-3">
                  რაოდენობა
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="w-12 h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors touch-manipulation"
                    aria-label="Decrease quantity">
                    <MinusCircle className="w-7 h-7 text-slate-300" />
                  </button>
                  <span className="text-3xl font-bold text-slate-100 w-16 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                    className="w-12 h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors touch-manipulation"
                    aria-label="Increase quantity">
                    <PlusCircle className="w-7 h-7 text-slate-300" />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || addedToCart}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-yellow-600 active:from-orange-700 active:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg touch-manipulation min-h-[52px]">
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    დამატებულია!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span className="hidden sm:inline">კალათაში დამატება</span>
                    <span className="sm:hidden">დამატება</span>
                  </>
                )}
              </button>
              <button
                onClick={async () => await toggleWishlist(product._id)}
                className="w-14 h-14 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-xl transition-colors touch-manipulation">
                <Heart
                  className={`w-6 h-6 transition-colors ${
                    isInWishlist(product._id)
                      ? "fill-red-500 text-red-500"
                      : "text-slate-300"
                  }`}
                />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-start gap-3 p-4 bg-slate-800 rounded-lg border border-slate-700">
                <Truck className="w-6 h-6 text-orange-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-slate-200 mb-1">
                    სწრაფი მიწოდება
                  </h4>
                  <p className="text-sm text-slate-400">იმავე დღეს გორიში</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-800 rounded-lg border border-slate-700">
                <Shield className="w-6 h-6 text-orange-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-slate-200 mb-1">
                    ხარისხის გარანტია
                  </h4>
                  <p className="text-sm text-slate-400">
                    ორიგინალური პროდუქტები
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-800 rounded-lg border border-slate-700">
                <Package className="w-6 h-6 text-orange-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-slate-200 mb-1">
                    მარტივი დაბრუნება
                  </h4>
                  <p className="text-sm text-slate-400">
                    7 დღიანი დაბრუნების ვადა
                  </p>
                </div>
              </div>
            </div>

            {/* Consultation form */}
            <div className="mt-4 p-4 md:p-5 bg-slate-800 rounded-lg border border-slate-700 mb-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-2">
                გჭირდებათ კონსულტაცია ამ პროდუქტზე?
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                დატოვეთ თქვენი კონტაქტი და შეკითხვა, და დაგირეკავთ/მოგწერთ
                დეტალების დასაზუსტებლად.
              </p>
              {consultSuccess && (
                <p className="mb-3 text-sm text-emerald-400">
                  {consultSuccess}
                </p>
              )}
              {consultError && (
                <p className="mb-3 text-sm text-red-400">{consultError}</p>
              )}
              <form
                onSubmit={handleConsultSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="თქვენი სახელი"
                  value={consultName}
                  onChange={(e) => setConsultName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:border-orange-500 outline-none"
                />
                <input
                  type="tel"
                  placeholder="ტელეფონი"
                  value={consultPhone}
                  onChange={(e) => setConsultPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:border-orange-500 outline-none"
                />
                <textarea
                  placeholder="თქვენი კითხვა / რა გჭირდებათ"
                  value={consultMessage}
                  onChange={(e) => setConsultMessage(e.target.value)}
                  className="md:col-span-2 w-full px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:border-orange-500 outline-none min-h-[80px]"
                />
                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={consultSending}
                    className="px-5 py-2.5 rounded-lg bg-linear-to-r from-orange-500 to-yellow-500 text-white text-sm font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
                    {consultSending ? "გაგზავნა..." : "კონსულტაციის მოთხოვნა"}
                  </button>
                </div>
              </form>
            </div>

            {/* Reviews */}
            <div className="p-4 md:p-5 bg-slate-800 rounded-lg border border-slate-700">
              <h3 className="text-lg font-semibold text-slate-100 mb-3">
                მომხმარებლის შეფასებები
              </h3>
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
                  {product.reviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="border border-slate-700 rounded-md px-3 py-2 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-100">
                          {rev.name}
                        </span>
                        {typeof rev.rating === "number" && rev.rating > 0 && (
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{Number(rev.rating || 0).toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-slate-300 text-sm mb-1">
                        {rev.comment}
                      </p>
                      {rev.createdAt && (
                        <p className="text-[11px] text-slate-500">
                          {new Date(rev.createdAt).toLocaleDateString("ka-GE")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm mb-4">
                  ჯერ არ არის შეფასებები ამ პროდუქტზე. იყავით პირველი ვინც
                  დატოვებს შეფასებას.
                </p>
              )}

              <div className="mt-2">
                {!user ? (
                  <p className="text-slate-400 text-sm">
                    შეფასების დასაწერად{" "}
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/login?redirect=/products/${product._id}`)
                      }
                      className="text-orange-400 hover:text-orange-300 underline underline-offset-2">
                      შედით სისტემაში
                    </button>
                    .
                  </p>
                ) : (
                  <form
                    onSubmit={handleReviewSubmit}
                    className="space-y-2 mt-2">
                    {reviewError && (
                      <p className="text-sm text-red-400">{reviewError}</p>
                    )}
                    <div className="flex items-center gap-3">
                      <label className="text-slate-300 text-sm">
                        შეფასება:
                      </label>
                      <select
                        value={reviewRating}
                        onChange={(e) =>
                          setReviewRating(Number(e.target.value))
                        }
                        className="px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:border-orange-500 outline-none">
                        {[5, 4, 3, 2, 1].map((r) => (
                          <option key={r} value={r}>
                            {r} ⭐
                          </option>
                        ))}
                      </select>
                    </div>
                    <textarea
                      placeholder="დაწერეთ თქვენი აზრი ამ პროდუქტზე..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:border-orange-500 outline-none min-h-[70px]"
                    />
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="px-4 py-2 rounded-lg bg-linear-to-r from-orange-500 to-yellow-500 text-white text-sm font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
                      {reviewSubmitting ? "გაგზავნა..." : "შეფასების დამატება"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">
              მსგავსი პროდუქტები
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
              {related.slice(0, 4).map((p) => (
                <ProductCard key={p._id} product={p as any} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
