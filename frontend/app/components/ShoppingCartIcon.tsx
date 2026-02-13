"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import Link from "next/link";

const ShoppingCartIcon = () => {
  const { cart } = useCart();

  return (
    <Link 
      href="/cart" 
      className="relative cursor-pointer p-2.5 rounded-lg hover:bg-orange-950/30 active:bg-orange-950/50 transition-all group touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
    >
      <ShoppingCart className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-colors" />
      {cart.itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-linear-to-r from-orange-500 to-yellow-500 text-white text-[10px] rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center font-bold shadow-md ring-2 ring-slate-900">
          {cart.itemCount > 99 ? '99+' : cart.itemCount}
        </span>
      )}
    </Link>
  );
};

export default ShoppingCartIcon;
