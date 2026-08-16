"use client";

import { Check, X } from "lucide-react";
import { statusLabels } from "@/lib/orderStatus";

/** Normal lifecycle order — "cancelled" is handled separately as a terminal state. */
const STATUS_FLOW = [
  "pending",
  "confirmed",
  "processing",
  "ready_to_ship",
  "shipped",
  "delivered",
] as const;

type Props = {
  status: string;
  className?: string;
};

/** Visual progress tracker for an order's lifecycle status. */
export default function OrderStatusStepper({ status, className = "" }: Props) {
  if (status === "cancelled") {
    return (
      <div
        className={`flex items-center gap-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3.5 ${className}`}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/20 border border-red-500/50">
          <X className="w-4 h-4 text-red-400" />
        </span>
        <p className="text-sm font-medium text-red-300">
          {statusLabels.cancelled}
        </p>
      </div>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(status as (typeof STATUS_FLOW)[number]);
  const total = STATUS_FLOW.length;

  return (
    <div className={className}>
      {/* Mobile: compact progress bar — full 6-label row doesn't fit small screens */}
      <div className="sm:hidden">
        <div className="flex items-center gap-1.5 mb-2.5">
          {STATUS_FLOW.map((step, i) => {
            const done = currentIndex >= 0 && i < currentIndex;
            const active = i === currentIndex;
            return (
              <div
                key={step}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${
                  active
                    ? "bg-orange-500"
                    : done
                      ? "bg-emerald-500/80"
                      : "bg-slate-700"
                }`}
                aria-hidden
              />
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <span className="shrink-0 flex h-6 min-w-6 px-1.5 items-center justify-center rounded-full bg-orange-500/15 text-[11px] font-bold text-orange-400">
            {Math.max(currentIndex, 0) + 1}/{total}
          </span>
          <p className="text-sm font-semibold text-slate-100 truncate">
            {statusLabels[currentIndex >= 0 ? STATUS_FLOW[currentIndex] : status]}
          </p>
        </div>
      </div>

      {/* sm and up: full stepper with icons and labels */}
      <ol className="hidden sm:flex items-start">
        {STATUS_FLOW.map((step, i) => {
          const done = currentIndex >= 0 && i < currentIndex;
          const active = i === currentIndex;
          const isLast = i === STATUS_FLOW.length - 1;
          return (
            <li
              key={step}
              className={`flex items-center ${isLast ? "" : "flex-1"} min-w-0`}>
              <div className="flex flex-col items-center gap-1.5 shrink-0 w-20">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors duration-200 ${
                    active
                      ? "bg-orange-500 border-orange-400 text-white shadow-[0_0_0_4px_rgba(249,115,22,0.15)]"
                      : done
                        ? "bg-emerald-600/80 border-emerald-500 text-white"
                        : "bg-slate-800 border-slate-600 text-slate-500"
                  }`}>
                  {done ? <Check className="w-4 h-4" /> : i + 1}
                </span>
                <span
                  className={`text-xs text-center leading-tight ${
                    active
                      ? "text-orange-400 font-semibold"
                      : done
                        ? "text-emerald-400/90"
                        : "text-slate-500"
                  }`}>
                  {statusLabels[step]}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`h-0.5 flex-1 min-w-2 rounded mb-4.5 ${
                    done ? "bg-emerald-600/70" : "bg-slate-700"
                  }`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
