"use client";

/**
 * Cart Page — items, quantities, subtotal.
 * Delivery is a separate step at /checkout/delivery.
 */
import { useCart } from "@/lib/context/CartContext";
import { useAuth } from "@/lib/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import CheckoutSteps from "@/app/components/CheckoutSteps";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Truck,
} from "lucide-react";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();

  const deliveryHref = user
    ? "/checkout/delivery"
    : "/login?redirect=/checkout/delivery";

  if (cart.itemCount === 0) {
    return (
      <div className="min-h-screen bg-slate-900 py-12 px-4 ds-fade-in">
        <div className="max-w-4xl mx-auto text-center">
          <ShoppingBag className="w-24 h-24 text-slate-600 mx-auto mb-6 ds-check-pop" />
          <h1 className="text-3xl font-bold text-slate-100 mb-4">
            კალათა ცარიელია
          </h1>
          <p className="text-slate-400 mb-8 text-lg">
            დაამატეთ პროდუქტები — შემდეგ მარტივად გააფორმებთ შეკვეთას
          </p>
          <Link
            href="/products"
            className="ds-btn-primary inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-orange-500 to-yellow-500 text-white text-base font-bold rounded-lg min-h-[52px]">
            <ArrowLeft className="w-5 h-5" />
            პროდუქტების დამატება
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4 pb-28 lg:pb-8 ds-fade-in">
      <div className="max-w-6xl mx-auto">
        <CheckoutSteps current="cart" />
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2">
          თქვენი კალათა ({cart.itemCount})
        </h1>
        <p className="text-slate-400 mb-6 sm:mb-8 text-base">
          შეცვალეთ რაოდენობა, შემდეგ აირჩიეთ მიწოდება
        </p>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <p className="text-sm text-slate-500 mb-3 lg:hidden">
              {cart.itemCount} ნივთი <span className="text-slate-600">·</span>{" "}
              ქვემოთ შეცვალეთ რაოდენობა
            </p>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:gap-4">
              {cart.items.map((item) => (
                <div
                  key={item.productId}
                  className="bg-slate-800 rounded-lg border border-slate-700 p-3 lg:p-6 flex flex-col lg:flex-row gap-3 lg:gap-4">
                  <div className="relative w-full h-[88px] lg:h-24 lg:w-24 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                    <Image
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=200&fit=crop"
                      }
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col gap-1.5 lg:gap-0">
                    <h3 className="text-sm lg:text-lg font-semibold text-slate-100 line-clamp-2 leading-snug lg:truncate lg:mb-1">
                      {item.name}
                    </h3>
                    <p className="text-xs lg:text-sm text-slate-400 line-clamp-1 lg:mb-2">
                      {item.brand}
                    </p>
                    <div className="flex flex-col gap-0.5 lg:flex-row lg:items-baseline lg:gap-2 mt-auto lg:mt-0">
                      <p className="text-xs lg:text-lg text-slate-400 tabular-nums">
                        ₾{item.price.toFixed(2)} × {item.quantity}
                      </p>
                      <p className="text-base lg:text-xl font-bold text-orange-400 tabular-nums">
                        = ₾{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-start gap-2 lg:gap-4 pt-1 border-t border-slate-700/60 lg:border-0 lg:pt-0 shrink-0">
                    <div className="flex items-center gap-1.5 lg:gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        className="w-9 h-9 lg:w-11 lg:h-11 flex items-center justify-center bg-slate-700 hover:bg-slate-600 active:bg-slate-500 rounded-lg transition-colors touch-manipulation"
                        aria-label="Decrease quantity">
                        <Minus className="w-4 h-4 lg:w-5 lg:h-5 text-slate-300" />
                      </button>
                      <span className="text-sm lg:text-lg font-semibold text-slate-100 w-8 lg:w-12 text-center tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.maxStock}
                        className="w-9 h-9 lg:w-11 lg:h-11 flex items-center justify-center bg-slate-700 hover:bg-slate-600 active:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors touch-manipulation"
                        aria-label="Increase quantity">
                        <Plus className="w-4 h-4 lg:w-5 lg:h-5 text-slate-300" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-2 text-slate-400 hover:text-red-400 active:text-red-500 transition-colors touch-manipulation min-w-[40px] min-h-[40px] lg:min-w-[44px] lg:min-h-[44px] flex items-center justify-center rounded-lg hover:bg-slate-700/50"
                      aria-label="Remove item">
                      <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 order-1 lg:order-2">
            <aside id="cart-summary" className="lg:sticky lg:top-4 scroll-mt-4">
              <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5 sm:p-6">
                <h2 className="text-base font-semibold text-slate-100 mb-5 pb-4 border-b border-slate-700/80">
                  შეკვეთის შეჯამება
                </h2>

                <div className="mb-6 space-y-2.5 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>ქვეჯამი ({cart.itemCount} ნივთი)</span>
                    <span className="tabular-nums text-slate-100 font-medium">
                      ₾{cart.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    მიწოდების საფასური შემდეგ ნაბიჯზე დაემატება.
                  </p>
                  <div className="flex justify-between items-baseline pt-3 mt-1 border-t border-slate-700/80">
                    <span className="text-sm font-medium text-slate-200">
                      ჯამი
                    </span>
                    <span className="text-xl font-semibold tabular-nums text-orange-400">
                      ₾{cart.subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Link
                  href={deliveryHref}
                  className="ds-btn-primary w-full text-center px-6 py-4 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-lg shadow-lg min-h-[56px] flex items-center justify-center gap-2 mb-3 text-base">
                  <Truck className="w-5 h-5" />
                  {user ? "შემდეგი: მიწოდების არჩევა" : "შესვლა და შეკვეთა"}
                </Link>

                <Link
                  href="/products"
                  className="w-full text-center px-4 py-2.5 text-slate-400 hover:text-slate-200 text-sm flex items-center justify-center gap-2 rounded-lg border border-transparent hover:border-slate-600 hover:bg-slate-900/30 transition-colors">
                  <ArrowLeft className="w-4 h-4 shrink-0" />
                  <span>გაგრძელება ყიდვა</span>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-700/90 bg-slate-900/95 backdrop-blur-md px-4 py-3 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]"
        style={{
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
        }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-slate-500">ჯამი</p>
            <p className="text-lg font-semibold tabular-nums text-orange-400">
              ₾{cart.subtotal.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {cart.itemCount} ნივთი
            </p>
          </div>
          <Link
            href={deliveryHref}
            className="ds-btn-primary shrink-0 px-5 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white text-sm font-bold rounded-lg min-h-[48px] flex items-center">
            {user ? "მიწოდება" : "შესვლა"}
          </Link>
        </div>
      </div>
    </div>
  );
}
