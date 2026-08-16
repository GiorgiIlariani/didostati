"use client";

import Link from "next/link";
import { CheckCircle, ShoppingCart, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { triggerCartPulse } from "@/app/components/ShoppingCartIcon";

interface AddedToCartModalProps {
  open: boolean;
  onClose: () => void;
  productName?: string;
}

export default function AddedToCartModal({
  open,
  onClose,
  productName,
}: AddedToCartModalProps) {
  const checkRef = useRef<HTMLDivElement>(null);
  const flyRef = useRef<HTMLDivElement>(null);
  const [flying, setFlying] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setFlying(false);
      triggerCartPulse();
    }
  }, [open]);

  const closeWithFly = () => {
    if (flying) return;

    const startEl = checkRef.current;
    const cartEl = document.querySelector("[data-cart-icon]");
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!startEl || !cartEl || reduceMotion) {
      onClose();
      triggerCartPulse();
      return;
    }

    const s = startEl.getBoundingClientRect();
    const c = cartEl.getBoundingClientRect();
    const startX = s.left + s.width / 2 - 22;
    const startY = s.top + s.height / 2 - 22;
    const endX = c.left + c.width / 2 - 22;
    const endY = c.top + c.height / 2 - 22;
    const midX = (startX + endX) / 2;
    const midY = Math.min(startY, endY) - 90;

    setFlying(true);

    // Wait one frame so the fly node is in the DOM
    requestAnimationFrame(() => {
      const el = flyRef.current;
      if (!el) {
        onClose();
        setFlying(false);
        return;
      }

      const anim = el.animate(
        [
          {
            transform: `translate(${startX}px, ${startY}px) scale(1.2)`,
            opacity: 1,
          },
          {
            transform: `translate(${midX}px, ${midY}px) scale(1)`,
            opacity: 1,
            offset: 0.55,
          },
          {
            transform: `translate(${endX}px, ${endY}px) scale(0.35)`,
            opacity: 0.15,
          },
        ],
        {
          duration: 720,
          easing: "cubic-bezier(0.22, 0.61, 0.36, 1)",
          fill: "forwards",
        },
      );

      // Close modal mid-flight so user sees the arc clearly
      window.setTimeout(() => onClose(), 180);

      anim.onfinish = () => {
        triggerCartPulse();
        setFlying(false);
      };
    });
  };

  if (!open && !flying) return null;

  const flyNode =
    flying && mounted
      ? createPortal(
          <div
            ref={flyRef}
            className="pointer-events-none fixed left-0 top-0 z-[100] flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-r from-orange-500 to-yellow-500 text-white shadow-lg shadow-orange-500/40"
            aria-hidden>
            <ShoppingCart className="h-5 w-5" />
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {open && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ds-fade-in ${
            flying ? "pointer-events-none opacity-0 transition-opacity duration-200" : ""
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="added-to-cart-title"
          onClick={closeWithFly}>
          <div
            className="relative w-full max-w-sm bg-slate-800 border border-slate-700 rounded-xl p-6 sm:p-7 text-center shadow-xl ds-scale-in"
            onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={closeWithFly}
              className="absolute top-3 right-3 p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="დახურვა">
              <X className="w-5 h-5" />
            </button>

            <div ref={checkRef} className="inline-flex mx-auto mb-4">
              <CheckCircle className="w-16 h-16 text-emerald-400 ds-check-pop" />
            </div>
            <h2
              id="added-to-cart-title"
              className="text-xl sm:text-2xl font-bold text-slate-100 mb-2">
              დამატებულია კალათაში
            </h2>
            {productName && (
              <p className="text-base text-slate-300 mb-2 line-clamp-2">
                {productName}
              </p>
            )}
            <p className="text-sm text-slate-500 mb-6">
              შემდეგი ნაბიჯი: კალათა → მიწოდება → შეკვეთა
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href="/cart"
                onClick={() => {
                  triggerCartPulse();
                  onClose();
                }}
                className="ds-btn-primary w-full inline-flex items-center justify-center px-5 py-3.5 bg-linear-to-r from-orange-500 to-yellow-500 text-white text-base font-bold rounded-lg min-h-[52px]">
                კალათაში გადასვლა
              </Link>
              <button
                type="button"
                onClick={closeWithFly}
                className="w-full px-5 py-3 text-slate-300 hover:text-slate-100 text-base border border-slate-600 rounded-lg hover:bg-slate-700/50 min-h-[48px]">
                პროდუქტების არჩევის გაგრძელება
              </button>
            </div>
          </div>
        </div>
      )}
      {flyNode}
    </>
  );
}
