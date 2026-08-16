"use client";

type Step = {
  key: string;
  label: string;
};

const STEPS: Step[] = [
  { key: "cart", label: "კალათა" },
  { key: "delivery", label: "მიწოდება" },
  { key: "details", label: "დეტალები" },
];

type CheckoutStepsProps = {
  current: "cart" | "delivery" | "details";
};

export default function CheckoutSteps({ current }: CheckoutStepsProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <nav
      aria-label="შეკვეთის ნაბიჯები"
      className="mb-6 sm:mb-8">
      <ol className="flex items-center justify-between gap-1 sm:gap-2 max-w-lg mx-auto">
        {STEPS.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <li key={step.key} className="flex-1 flex items-center gap-1 sm:gap-2 min-w-0">
              <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                <span
                  className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-sm font-bold border-2 transition-colors duration-200 ${
                    active
                      ? "bg-orange-500 border-orange-400 text-white"
                      : done
                        ? "bg-emerald-600/80 border-emerald-500 text-white"
                        : "bg-slate-800 border-slate-600 text-slate-400"
                  }`}>
                  {done ? "✓" : i + 1}
                </span>
                <span
                  className={`text-xs sm:text-sm font-medium truncate max-w-full ${
                    active
                      ? "text-orange-400"
                      : done
                        ? "text-emerald-400/90"
                        : "text-slate-500"
                  }`}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-full max-w-8 sm:max-w-12 mb-5 shrink-0 rounded ${
                    done ? "bg-emerald-600/70" : "bg-slate-700"
                  }`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
