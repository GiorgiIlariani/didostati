"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import Link from "next/link";
import { useEffect, useState } from "react";

type ShoppingCartIconProps = {
  showLabel?: boolean;
};

const CART_PULSE_EVENT = "didostati:cart-pulse";

export function triggerCartPulse() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_PULSE_EVENT));
  }
}

const ShoppingCartIcon = ({ showLabel = false }: ShoppingCartIconProps) => {
  const { cart } = useCart();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const handler = () => {
      setPulse(false);
      requestAnimationFrame(() => setPulse(true));
      setTimeout(() => setPulse(false), 550);
    };
    window.addEventListener(CART_PULSE_EVENT, handler);
    return () => window.removeEventListener(CART_PULSE_EVENT, handler);
  }, []);

  return (
    <Link
      href="/cart"
      className={
        showLabel
          ? "relative cursor-pointer flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-orange-950/30 active:bg-orange-950/50 transition-all group touch-manipulation"
          : "relative cursor-pointer p-2.5 rounded-lg hover:bg-orange-950/30 active:bg-orange-950/50 transition-all group touch-manipulation min-w-[48px] min-h-[48px] flex items-center justify-center"
      }>
      <span className={`relative inline-flex shrink-0 ${pulse ? "ds-cart-pulse" : ""}`} data-cart-icon>
        <ShoppingCart className="w-6 h-6 text-slate-200 group-hover:text-orange-500 transition-colors" />
        {cart.itemCount > 0 && (
          <span className="absolute -top-2 -right-2 z-10 bg-linear-to-r from-orange-500 to-yellow-500 text-white text-[10px] leading-none tabular-nums rounded-full min-w-[18px] min-h-[18px] h-[18px] px-0.5 flex items-center justify-center font-bold shadow-sm ring-1 ring-slate-900">
            {cart.itemCount > 99 ? "99+" : cart.itemCount}
          </span>
        )}
      </span>
      {showLabel && (
        <span className="text-sm font-semibold text-slate-100 group-hover:text-orange-400 whitespace-nowrap">
          კალათა
        </span>
      )}
    </Link>
  );
};

export default ShoppingCartIcon;
