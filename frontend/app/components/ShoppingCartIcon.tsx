"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import Link from "next/link";

type ShoppingCartIconProps = {
  /** Show label next to icon (desktop nav). */
  showLabel?: boolean;
};

const ShoppingCartIcon = ({ showLabel = false }: ShoppingCartIconProps) => {
  const { cart } = useCart();

  return (
    <Link
      href="/cart"
      className={
        showLabel
          ? "relative cursor-pointer flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-orange-950/30 active:bg-orange-950/50 transition-all group touch-manipulation"
          : "relative cursor-pointer p-2.5 rounded-lg hover:bg-orange-950/30 active:bg-orange-950/50 transition-all group touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
      }>
      <span className="relative inline-flex shrink-0">
        <ShoppingCart className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-colors" />
        {cart.itemCount > 0 && (
          <span className="absolute -top-2 -right-2 z-10 bg-linear-to-r from-orange-500 to-yellow-500 text-white text-[9px] leading-none tabular-nums rounded-full min-w-[14px] min-h-[14px] h-[14px] px-0.5 flex items-center justify-center font-bold shadow-sm ring-1 ring-slate-900">
            {cart.itemCount > 99 ? "99+" : cart.itemCount}
          </span>
        )}
      </span>
      {showLabel && (
        <span className="text-sm font-medium text-slate-200 group-hover:text-orange-400 whitespace-nowrap">
          კალათა
        </span>
      )}
    </Link>
  );
};

export default ShoppingCartIcon;
