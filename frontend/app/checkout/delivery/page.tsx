"use client";

/**
 * Delivery selection step (between cart and checkout form).
 * Uses existing city tariffs from delivery.ts.
 */
import { useCart } from "@/lib/context/CartContext";
import { useAuth } from "@/lib/context/AuthContext";
import { DELIVERY_BASE_LABEL } from "@/lib/utils/delivery";
import DeliveryCitySelect from "@/app/components/DeliveryCitySelect";
import ContactQuickActions from "@/app/components/ContactQuickActions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CheckoutSteps from "@/app/components/CheckoutSteps";
import {
  ArrowLeft,
  MapPin,
  Truck,
  Zap,
  Store,
  ShoppingBag,
  Loader2,
  Check,
  Receipt,
  LocateFixed,
  ShieldCheck,
} from "lucide-react";

const DELIVERY_TYPE_OPTIONS = [
  {
    value: "standard" as const,
    icon: Truck,
    label: "სტანდარტული",
    hint: "7-10 დღეში",
    tag: "პოპულარული",
    accent: {
      border: "border-orange-500",
      ring: "shadow-[0_0_0_3px_rgba(249,115,22,0.14)]",
      bg: "bg-orange-500/10",
      iconBg: "bg-orange-500/15",
      iconText: "text-orange-400",
      tagBg: "bg-orange-500/15 text-orange-300",
      glow: "bg-orange-500/20",
    },
  },
  {
    value: "express" as const,
    icon: Zap,
    label: "ექსპრესი",
    hint: "24 საათში",
    tag: "+5₾",
    accent: {
      border: "border-violet-500",
      ring: "shadow-[0_0_0_3px_rgba(139,92,246,0.14)]",
      bg: "bg-violet-500/10",
      iconBg: "bg-violet-500/15",
      iconText: "text-violet-400",
      tagBg: "bg-violet-500/15 text-violet-300",
      glow: "bg-violet-500/20",
    },
  },
  {
    value: "pickup" as const,
    icon: Store,
    label: "თვითგატანა",
    hint: "მაღაზიიდან",
    tag: "უფასო",
    accent: {
      border: "border-emerald-500",
      ring: "shadow-[0_0_0_3px_rgba(16,185,129,0.14)]",
      bg: "bg-emerald-500/10",
      iconBg: "bg-emerald-500/15",
      iconText: "text-emerald-400",
      tagBg: "bg-emerald-500/15 text-emerald-300",
      glow: "bg-emerald-500/20",
    },
  },
];

export default function CheckoutDeliveryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    cart,
    deliveryType,
    setDeliveryType,
    deliveryCity,
    setDeliveryCity,
    requestDeliveryLocation,
    locationStatus,
    permissionDeniedHelp,
    clearPermissionDeniedHelp,
  } = useCart();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login?redirect=/checkout/delivery");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (cart.itemCount === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-100 mb-3">
            კალათა ცარიელია
          </h1>
          <p className="text-slate-400 mb-6">
            მიწოდების ასარჩევად ჯერ დაამატეთ პროდუქტები.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all">
            <ArrowLeft className="w-4 h-4" />
            პროდუქტებზე დაბრუნება
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4 pb-28 lg:pb-8 ds-fade-in">
      <div className="max-w-6xl mx-auto">
        <CheckoutSteps current="delivery" />
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-slate-300 hover:text-orange-400 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          კალათაში დაბრუნება
        </Link>

        {/* Header banner */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-linear-to-br from-slate-800/90 via-slate-800/50 to-slate-800/10 p-5 sm:p-7 mb-6 sm:mb-8">
          <div
            className="absolute -right-10 -top-16 w-56 h-56 rounded-full bg-orange-500/10 blur-3xl"
            aria-hidden
          />
          <div
            className="absolute -left-16 bottom-0 w-40 h-40 rounded-full bg-yellow-500/5 blur-3xl"
            aria-hidden
          />
          <div className="relative flex items-start gap-4">
            <span className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-orange-500/15 border border-orange-500/30 shrink-0">
              <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-orange-400" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-1">
                მიწოდების არჩევა
              </h1>
              <p className="text-slate-400 text-sm sm:text-base">
                აირჩიეთ ტიპი და ქალაქი — ტარიფი ავტომატურად დაითვლება
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6 lg:gap-8 items-start">
          {/* Left: delivery type, city, contact */}
          <div className="space-y-6">
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 sm:p-6 ds-scale-in">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">
                მიწოდების ტიპი
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {DELIVERY_TYPE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = deliveryType === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={`relative flex flex-col items-center gap-2 p-5 rounded-xl border-2 cursor-pointer transition-all text-center overflow-hidden ${
                        active
                          ? `${opt.accent.border} ${opt.accent.bg} ${opt.accent.ring}`
                          : "border-slate-700 hover:border-slate-600 bg-slate-900/40"
                      }`}>
                      {active && (
                        <span
                          className={`absolute -right-6 -top-6 w-20 h-20 rounded-full blur-2xl ${opt.accent.glow}`}
                          aria-hidden
                        />
                      )}
                      <input
                        type="radio"
                        name="deliveryType"
                        value={opt.value}
                        checked={active}
                        onChange={() => setDeliveryType(opt.value)}
                        className="sr-only"
                      />
                      <span
                        className={`absolute top-2.5 right-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          active
                            ? opt.accent.tagBg
                            : "bg-slate-800 text-slate-500"
                        }`}>
                        {opt.tag}
                      </span>
                      {active && (
                        <span
                          className={`absolute top-2.5 left-2.5 flex items-center justify-center w-5 h-5 rounded-full text-white ${
                            opt.value === "standard"
                              ? "bg-orange-500"
                              : opt.value === "express"
                                ? "bg-violet-500"
                                : "bg-emerald-500"
                          }`}>
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                      <span
                        className={`relative flex items-center justify-center w-12 h-12 rounded-full mt-2 ${
                          active ? opt.accent.iconBg : "bg-slate-800"
                        }`}>
                        <Icon
                          className={`w-6 h-6 ${
                            active ? opt.accent.iconText : "text-slate-400"
                          }`}
                        />
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          active ? "text-slate-100" : "text-slate-200"
                        }`}>
                        {opt.label}
                      </span>
                      <span className="text-xs text-slate-500">
                        {opt.hint}
                      </span>
                    </label>
                  );
                })}
              </div>

              {deliveryType !== "pickup" && (
                <div className="mt-6 pt-6 border-t border-slate-700/80">
                  <label
                    htmlFor="checkout-delivery-city"
                    className="block text-slate-300 text-sm font-medium mb-2">
                    ქალაქი{" "}
                    <span className="text-slate-500 font-normal">
                      (მიწოდების ტარიფი)
                    </span>
                  </label>
                  <DeliveryCitySelect
                    id="checkout-delivery-city"
                    value={deliveryCity}
                    onChange={setDeliveryCity}
                  />
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2.5 leading-relaxed">
                    {locationStatus === "loading" ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                        <span>ან ველოდებით მდებარეობის დადგენას...</span>
                      </>
                    ) : (
                      <>
                        <LocateFixed className="w-3.5 h-3.5 shrink-0" />
                        <span>ან მდებარეობა ავტომატურად (ბრაუზერის ნებართვით).</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 sm:p-6">
              <p className="text-sm text-slate-300 mb-0.5 font-medium">
                დაგვიკავშირდით
              </p>
              <p className="text-xs text-slate-500 mb-3">
                მიწოდება, ტარიფი ან შეკვეთა
              </p>
              <ContactQuickActions />
            </div>
          </div>

          {/* Right: sticky order summary */}
          <aside className="lg:sticky lg:top-6">
            <div className="rounded-2xl border border-orange-500/25 bg-linear-to-b from-slate-800/80 to-slate-800/40 p-5 sm:p-6 shadow-xl shadow-black/20 space-y-3 text-sm">
              <p className="flex items-center gap-2 text-slate-300 text-xs font-medium uppercase tracking-wider mb-1">
                <Receipt className="w-3.5 h-3.5 text-orange-400" />
                შეკვეთის შეჯამება
              </p>
              <div className="flex justify-between text-slate-300">
                <span>ქვეჯამი ({cart.itemCount} ნივთი)</span>
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
                <p className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  თვითგატანა — მიწოდება ₾0
                </p>
              )}
              {cart.deliveryFeeResolved &&
                deliveryType !== "pickup" &&
                cart.deliveryLocationName && (
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
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
                <span className="text-2xl font-bold tabular-nums bg-linear-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent">
                  ₾{cart.total.toFixed(2)}
                </span>
              </div>

              {cart.deliveryFeeResolved ? (
                <Link
                  href="/checkout"
                  className="ds-btn-primary w-full text-center px-6 py-4 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-lg shadow-lg min-h-14 flex items-center justify-center text-base">
                  შემდეგი: შეკვეთის დეტალები
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full text-center px-6 py-4 bg-slate-700 text-slate-400 font-bold rounded-lg border border-slate-600 min-h-13 flex items-center justify-center cursor-not-allowed">
                  {deliveryType === "pickup"
                    ? "შეკვეთის გაფორმება"
                    : "აირჩიეთ ქალაქი ან მდებარეობა"}
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>

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
          </div>
          {cart.deliveryFeeResolved ? (
            <Link
              href="/checkout"
              className="shrink-0 px-5 py-2.5 bg-linear-to-r from-orange-500 to-yellow-500 text-white text-sm font-semibold rounded-lg">
              შეკვეთის გაფორმება
            </Link>
          ) : (
            <span className="shrink-0 text-xs text-slate-500">
              აირჩიეთ მიწოდება
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
