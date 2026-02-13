"use client";

/**
 * Cart Page
 * Shopping cart functionality:
 * - Display all cart items
 * - Quantity controls (increase/decrease)
 * - Remove items
 * - Automatic price calculation:
 *   - Subtotal (sum of all items)
 *   - Delivery fee (location-based)
 *   - Total (subtotal + delivery)
 * - Price updates automatically when quantity changes
 * - Simple checkout button (redirects to /checkout)
 */
import { useCart } from "@/lib/context/CartContext";
import { useAuth } from "@/lib/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, MapPin } from "lucide-react";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, requestDeliveryLocation, locationStatus } = useCart();
  const { user } = useAuth();

  if (cart.itemCount === 0) {
    return (
      <div className="min-h-screen bg-slate-900 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <ShoppingBag className="w-24 h-24 text-slate-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-slate-100 mb-4">კალათა ცარიელია</h1>
          <p className="text-slate-400 mb-8">დაამატეთ პროდუქტები კალათაში</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all">
            <ArrowLeft className="w-5 h-5" />
            პროდუქტებზე დაბრუნება
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-100 mb-8">კალათა</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.productId}
                className="bg-slate-800 rounded-lg border border-slate-700 p-4 md:p-6 flex flex-col sm:flex-row gap-4">
                {/* Image */}
                <div className="relative w-full sm:w-24 h-24 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                  <Image
                    src={item.image || "/placeholder.jpg"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-100 mb-1 truncate">
                    {item.name}
                  </h3>
                  <p className="text-sm text-slate-400 mb-2">{item.brand}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-lg text-slate-400">
                      ₾{item.price.toFixed(2)} × {item.quantity}
                    </p>
                    <p className="text-xl font-bold text-orange-400">
                      = ₾{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-11 h-11 flex items-center justify-center bg-slate-700 hover:bg-slate-600 active:bg-slate-500 rounded-lg transition-colors touch-manipulation"
                      aria-label="Decrease quantity">
                      <Minus className="w-5 h-5 text-slate-300" />
                    </button>
                    <span className="text-lg font-semibold text-slate-100 w-12 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="w-11 h-11 flex items-center justify-center bg-slate-700 hover:bg-slate-600 active:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors touch-manipulation"
                      aria-label="Increase quantity">
                      <Plus className="w-5 h-5 text-slate-300" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-2 -m-2 text-slate-400 hover:text-red-400 active:text-red-500 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Remove item">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 sticky top-4">
              <h2 className="text-xl font-bold text-slate-100 mb-6">შეკვეთის შეჯამება</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-300 text-sm mb-2">
                  <span>ნივთები ({cart.itemCount}):</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>ქვეჯამი:</span>
                  <span className="font-semibold">₾{cart.subtotal.toFixed(2)}</span>
                </div>

                {/* Delivery Fee */}
                <div className="flex justify-between text-slate-300">
                  <div className="flex items-center gap-2">
                    <span>მიწოდების საფასური:</span>
                    {locationStatus === 'denied' && (
                      <button
                        onClick={requestDeliveryLocation}
                        className="text-xs text-orange-400 hover:text-orange-300 underline"
                        type="button">
                        განახლება
                      </button>
                    )}
                  </div>
                  <span className="font-semibold">₾{cart.deliveryFee.toFixed(2)}</span>
                </div>

                {locationStatus === 'denied' && (
                  <div className="flex items-start gap-2 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-400">
                      მიწოდების საფასურის გამოსათვლელად გთხოვთ მიუთითოთ თქვენი მდებარეობა.
                    </p>
                  </div>
                )}

                <div className="border-t border-slate-700 pt-4">
                  <div className="flex justify-between text-xl font-bold text-slate-100">
                    <span>სულ:</span>
                    <span className="bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                      ₾{cart.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href={user ? "/checkout" : "/login?redirect=/checkout"}
                className="w-full text-center px-6 py-4 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl min-h-[52px] flex items-center justify-center mb-3">
                გადახდა
              </Link>
              
              {/* Continue Shopping Link */}
              <Link
                href="/products"
                className="w-full text-center px-6 py-3 text-slate-300 hover:text-slate-100 border border-slate-700 rounded-lg hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>გაგრძელება ყიდვა</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
