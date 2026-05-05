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
// RESTORE_CHECKOUT_LOGIN_GATE:
// import { useAuth } from "@/lib/context/AuthContext";
import { DELIVERY_BASE_LABEL } from "@/lib/utils/delivery";
import DeliveryRatesGuide from "@/app/components/DeliveryRatesGuide";
import DeliveryCitySelect from "@/app/components/DeliveryCitySelect";
import ContactQuickActions from "@/app/components/ContactQuickActions";
import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  MapPin,
  Truck,
  Zap,
  Store,
} from "lucide-react";

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    deliveryType,
    setDeliveryType,
    deliveryCity,
    setDeliveryCity,
    requestDeliveryLocation,
    locationStatus,
    permissionDeniedHelp,
    clearPermissionDeniedHelp,
  } = useCart();
  // RESTORE_CHECKOUT_LOGIN_GATE:
  // const { user } = useAuth();

  if (cart.itemCount === 0) {
    return (
      <div className="min-h-screen bg-slate-900 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <ShoppingBag className="w-24 h-24 text-slate-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-slate-100 mb-4">
            კალათა ცარიელია
          </h1>
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
    <div className="min-h-screen bg-slate-900 py-8 px-4 pb-28 lg:pb-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-100 mb-8">კალათა</h1>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart items: 2-column compact grid on phone/tablet; single column on lg */}
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

          {/* Order summary first on mobile so totals are never below a long list */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <aside id="cart-summary" className="lg:sticky lg:top-4 scroll-mt-4">
              <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5 sm:p-6">
                <h2 className="text-base font-semibold text-slate-100 mb-5 pb-4 border-b border-slate-700/80">
                  შეკვეთის შეჯამება
                </h2>

                {/* Delivery type: standard / express / pickup */}
                {/* <div className="mb-4">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">მიწოდების ტიპი</p>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors border-slate-600 hover:border-slate-500 has-[:checked]:border-orange-500 has-[:checked]:bg-slate-700/50">
                    <input type="radio" name="deliveryType" value="standard" checked={deliveryType === "standard"} onChange={() => setDeliveryType("standard")} className="text-orange-500" />
                    <Truck className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-200">მიწოდება</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors border-slate-600 hover:border-slate-500 has-[:checked]:border-orange-500 has-[:checked]:bg-slate-700/50">
                    <input type="radio" name="deliveryType" value="express" checked={deliveryType === "express"} onChange={() => setDeliveryType("express")} className="text-orange-500" />
                    <Zap className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-200">ექსპრეს მიწოდება</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors border-slate-600 hover:border-slate-500 has-[:checked]:border-orange-500 has-[:checked]:bg-slate-700/50">
                    <input type="radio" name="deliveryType" value="pickup" checked={deliveryType === "pickup"} onChange={() => setDeliveryType("pickup")} className="text-orange-500" />
                    <Store className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-200">თვითგატანა (₾0)</span>
                  </label>
                </div>
              </div> */}

                {/* <DeliveryRatesGuide variant="compact" className="mb-6" /> */}

                {/* City selector when delivery (standard/express) and no GPS or user wants to choose city */}
                {deliveryType !== "pickup" && (
                  <div className="mb-6">
                    <label
                      htmlFor="cart-delivery-city"
                      className="block text-slate-300 text-sm font-medium mb-2">
                      ქალაქი{" "}
                      <span className="text-slate-500 font-normal">
                        (მიწოდების ტარიფი)
                      </span>
                    </label>
                    <DeliveryCitySelect
                      id="cart-delivery-city"
                      value={deliveryCity}
                      onChange={setDeliveryCity}
                    />
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      ან მდებარეობა ქვემოთ (ბრაუზერის ნებართვით).
                    </p>
                  </div>
                )}

                <div className="mb-6 space-y-2.5 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>ნივთები ({cart.itemCount})</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>ქვეჯამი</span>
                    <span className="tabular-nums text-slate-100 font-medium">
                      ₾{cart.subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-700/60">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                      <span className="text-sm">მიწოდება</span>
                      {deliveryType !== "pickup" &&
                        (locationStatus === "denied" ||
                          locationStatus === "error") &&
                        !deliveryCity && (
                          <button
                            type="button"
                            onClick={() => requestDeliveryLocation(true)}
                            className="text-xs text-orange-400 hover:text-orange-300 underline underline-offset-2">
                            განახლება
                          </button>
                        )}
                    </div>
                    {cart.deliveryFeeResolved ? (
                      <span className="tabular-nums text-slate-100 font-medium shrink-0">
                        ₾{cart.deliveryFee.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-500 shrink-0">—</span>
                    )}
                  </div>
                  {cart.deliveryFeeResolved && deliveryType === "pickup" && (
                    <p className="text-xs text-slate-500">
                      თვითგატანა — მიწოდება ₾0
                    </p>
                  )}
                  {cart.deliveryFeeResolved &&
                    deliveryType !== "pickup" &&
                    cart.deliveryLocationName && (
                      <p className="text-xs text-slate-500">
                        {DELIVERY_BASE_LABEL} → {cart.deliveryLocationName}
                        {cart.deliveryDistanceKm != null
                          ? ` · ~${cart.deliveryDistanceKm} km`
                          : ""}
                      </p>
                    )}

                  {deliveryType !== "pickup" && !cart.deliveryFeeResolved && (
                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-900/40 border border-slate-700/80">
                      <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-300 leading-relaxed">
                          აირჩიეთ ქალაქი ზემოთ ან მიუთითეთ მდებარეობა.
                        </p>
                        {permissionDeniedHelp && (
                          <p className="text-xs text-orange-400/90 mt-2">
                            ნებართვა უარყოფილია — ბრაუზერში ჩართეთ მდებარეობა და
                            სცადეთ ხელახლა.
                          </p>
                        )}
                      </div>
                      {permissionDeniedHelp && (
                        <button
                          type="button"
                          onClick={clearPermissionDeniedHelp}
                          className="text-slate-500 hover:text-slate-300 text-lg leading-none shrink-0"
                          aria-label="დახურვა">
                          ×
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-baseline pt-3 mt-1 border-t border-slate-700/80">
                    <span className="text-sm font-medium text-slate-200">
                      სულ
                    </span>
                    <span className="text-xl font-semibold tabular-nums text-orange-400">
                      ₾{cart.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mb-5 pt-5 border-t border-slate-700/80">
                  <p className="text-sm text-slate-300 mb-0.5">
                    დაგვიკავშირდით
                  </p>
                  <p className="text-xs text-slate-500 mb-3">
                    მიწოდება, ტარიფი ან შეკვეთა
                  </p>
                  <ContactQuickActions />
                </div>
                {/* 
              {cart.deliveryFeeResolved ? (
                <Link
                  href="/checkout"
                  // RESTORE_CHECKOUT_LOGIN_GATE: href={user ? "/checkout" : "/login?redirect=/checkout"}
                  className="w-full text-center px-6 py-4 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl min-h-[52px] flex items-center justify-center mb-3">
                  გადახდა
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full text-center px-6 py-4 bg-slate-700 text-slate-400 font-bold rounded-lg border border-slate-600 min-h-[52px] flex items-center justify-center mb-3 cursor-not-allowed">
                  {deliveryType === "pickup"
                    ? "გადახდა"
                    : "აირჩიეთ ქალაქი ან მდებარეობა"}
                </button>
              )} */}

                {/* Continue Shopping Link */}
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

      {/* Mobile: keep total in reach while scrolling long carts */}
      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-700/90 bg-slate-900/95 backdrop-blur-md px-4 py-3 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]"
        style={{
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
        }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-slate-500">სულ</p>
            <p className="text-lg font-semibold tabular-nums text-orange-400">
              ₾{cart.total.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {cart.itemCount} ნივთი
            </p>
          </div>
          <a
            href="#cart-summary"
            className="shrink-0 text-sm font-medium text-orange-400 hover:text-orange-300 underline underline-offset-2">
            სრული შეჯამება
          </a>
        </div>
      </div>
    </div>
  );
}
