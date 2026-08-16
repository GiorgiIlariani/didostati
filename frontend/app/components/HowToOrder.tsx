"use client";

import Link from "next/link";
import { Package, ShoppingCart, Truck } from "lucide-react";

/**
 * Simple 3-step guide for older users — how to order.
 */
export default function HowToOrder() {
  const steps = [
    {
      icon: Package,
      title: "აირჩიეთ პროდუქტი",
      text: "იპოვეთ საჭირო მასალა და დააჭირეთ „დამატება“",
      href: "/products",
    },
    {
      icon: ShoppingCart,
      title: "შეამოწმეთ კალათა",
      text: "ნახეთ რაოდენობა და ჯამი",
      href: "/cart",
    },
    {
      icon: Truck,
      title: "გააფორმეთ შეკვეთა",
      text: "აირჩიეთ მიწოდება და დაადასტურეთ",
      href: "/cart",
    },
  ];

  return (
    <section className="px-4 py-12 sm:py-16 border-t border-slate-800 bg-slate-900">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2">
            როგორ შევუკვეთო?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            სამი მარტივი ნაბიჯი — სწრაფად და გასაგებად
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.title}
                href={step.href}
                className="group relative flex flex-col rounded-2xl border border-slate-700 bg-slate-800/50 p-5 sm:p-6 hover:border-orange-500/60 hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-200 touch-manipulation">
                <div className="flex items-center justify-between mb-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20 group-hover:bg-orange-500/20 group-hover:border-orange-500/40 transition-colors duration-200">
                    <Icon className="w-5 h-5 text-orange-400" aria-hidden />
                  </span>
                  <span className="text-3xl font-bold text-slate-700 group-hover:text-orange-500/40 tabular-nums transition-colors duration-200">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-100 mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {step.text}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
