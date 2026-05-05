"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Truck, ChevronRight, Phone, RotateCcw } from "lucide-react";
import {
  SHIPPING_WIZARD_CITIES,
  type ShippingWizardCity,
  DELIVERY_BASE_LABEL,
} from "@/lib/utils/delivery";
import {
  CONTACT_PHONE_TEL,
  CONTACT_PHONE_DISPLAY,
} from "@/lib/contact";

const GeorgiaShippingLeafletMap = dynamic(
  () => import("./GeorgiaShippingLeafletMap"),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[min(520px,70vh)] min-h-[280px] w-full items-center justify-center rounded-xl border border-slate-600/80 bg-slate-900 text-sm text-slate-500"
        aria-hidden>
        რუკა იტვირთება…
      </div>
    ),
  }
);

type TruckKind = "small" | "large";

const TRUCK_OPTIONS: {
  kind: TruckKind;
  title: string;
  hint: string;
}[] = [
  {
    kind: "small",
    title: "პატარა მანქანა",
    hint: "სტანდარტული შეკვეთა, ჩვეულებრივი მოცულობა",
  },
  {
    kind: "large",
    title: "დიდი მანქანა",
    hint: "მოცულობითი ან მძიმე მასალა — საჭიროების მიხედვით",
  },
];

function feeFor(city: ShippingWizardCity, truck: TruckKind): number {
  return truck === "large" ? city.feeBigTruck : city.feeSmallTruck;
}

export default function ShippingPriceWizard() {
  const [city, setCity] = useState<ShippingWizardCity | null>(null);
  const [truck, setTruck] = useState<TruckKind | null>(null);

  const step = useMemo(() => {
    if (!city) return 1;
    if (!truck) return 2;
    return 3;
  }, [city, truck]);

  const price =
    city && truck ? feeFor(city, truck) : null;

  function resetAll() {
    setCity(null);
    setTruck(null);
  }

  function pickCity(c: ShippingWizardCity) {
    setCity(c);
    setTruck(null);
  }

  return (
    <div className="space-y-8">
      {/* Step indicator */}
      <ol className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
        {[
          { n: 1, label: "ქალაქი" },
          { n: 2, label: "ტრანსპორტი" },
          { n: 3, label: "ფასი" },
        ].map((s, i) => (
          <li key={s.n} className="flex items-center gap-2 sm:gap-4">
            <span
              className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0 ${
                step >= s.n
                  ? "bg-linear-to-r from-orange-500 to-yellow-500 text-slate-900"
                  : "bg-slate-800 text-slate-500 border border-slate-600"
              }`}>
              {s.n}
            </span>
            <span
              className={
                step >= s.n ? "text-slate-200 font-medium" : "text-slate-500"
              }>
              {s.label}
            </span>
            {i < 2 && (
              <ChevronRight
                className="w-4 h-4 text-slate-600 hidden sm:block"
                aria-hidden
              />
            )}
          </li>
        ))}
      </ol>

      {/* Step 1 — map + city list */}
      <section
        aria-labelledby="ship-step1-title"
        className="rounded-2xl border border-slate-700 bg-slate-800/40 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700/80 flex items-center justify-between gap-2">
          <h2
            id="ship-step1-title"
            className="text-base font-semibold text-slate-100">
            ნაბიჯი 1 — აირჩიეთ ქალაქი
          </h2>
          {city && (
            <span className="text-xs text-orange-300 truncate max-w-[50%]">
              არჩეული: {city.name}
            </span>
          )}
        </div>

        <div className="p-4 md:p-6">
          <div className="relative">
            <div className="mb-3">
              <p className="text-xs text-slate-400 mb-2">სწრაფი არჩევა:</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {SHIPPING_WIZARD_CITIES.map((c) => {
                  const selected = city?.id === c.id;
                  return (
                    <button
                      key={`quick-${c.id}`}
                      type="button"
                      onClick={() => pickCity(c)}
                      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors touch-manipulation ${
                        selected
                          ? "border-orange-500/70 bg-orange-500/15 text-orange-200"
                          : "border-slate-600 bg-slate-900/60 text-slate-300 hover:border-slate-500"
                      }`}>
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              რეალური რუკა (OpenStreetMap) — დააჭირეთ ქალაქის წერტილს ან აირჩიეთ სიიდან
            </p>
            <GeorgiaShippingLeafletMap
              cities={SHIPPING_WIZARD_CITIES}
              selected={city}
              onSelect={pickCity}
              className="h-[min(520px,70vh)] min-h-[280px] w-full shadow-inner"
            />
            <p className="text-[10px] text-slate-600 mt-2 leading-relaxed">
              ქვედა კუთხეში — წყაროს მითითება. გადიდება: მარჯვენა +/- ღილაკები ან ორი თითი
              მობილურზე. გვერდის გადახვევა რუკაზე არ ზრდის მასშტაბს (განზრახ).
            </p>
          </div>
        </div>
      </section>

      {/* Step 2 */}
      {city && (
        <section
          aria-labelledby="ship-step2-title"
          className="rounded-2xl border border-slate-700 bg-slate-800/40 p-4 md:p-6">
          <h2
            id="ship-step2-title"
            className="text-base font-semibold text-slate-100 mb-1">
            ნაბიჯი 2 — აირჩიეთ ტრანსპორტი
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            მიწოდება: <strong className="text-slate-200">{city.name}</strong>{" "}
            — რა ტიპის მანქანა გჭირდებათ?
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {TRUCK_OPTIONS.map((opt) => {
              const selected = truck === opt.kind;
              return (
                <button
                  key={opt.kind}
                  type="button"
                  onClick={() => setTruck(opt.kind)}
                  className={`text-left rounded-xl border p-4 transition-all touch-manipulation flex gap-3 ${
                    selected
                      ? "border-orange-500/70 bg-orange-500/10 ring-1 ring-orange-500/30"
                      : "border-slate-600 bg-slate-900/40 hover:border-slate-500"
                  }`}>
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      selected ? "bg-orange-500/20" : "bg-slate-800"
                    }`}>
                    <Truck
                      className={`w-6 h-6 ${
                        selected ? "text-orange-400" : "text-slate-400"
                      }`}
                      aria-hidden
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">{opt.title}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {opt.hint}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              setCity(null);
              setTruck(null);
            }}
            className="mt-4 text-sm text-slate-500 hover:text-orange-400 inline-flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" aria-hidden />
            სხვა ქალაქის არჩევა
          </button>
        </section>
      )}

      {/* Step 3 — price + contact */}
      {city && truck && price !== null && (
        <section
          aria-labelledby="ship-step3-title"
          className="rounded-2xl border border-orange-500/30 bg-linear-to-br from-slate-800/80 to-slate-900/80 p-5 md:p-8 space-y-6">
          <h2 id="ship-step3-title" className="sr-only">
            ნაბიჯი 3 — ორიენტირებითი ფასი
          </h2>
          <div className="text-center space-y-2">
            <p className="text-sm text-slate-400">ორიენტირებითი მიწოდება</p>
            <p className="text-lg text-slate-100">
              {city.name} ·{" "}
              {truck === "small"
                ? TRUCK_OPTIONS[0].title
                : TRUCK_OPTIONS[1].title}
            </p>
            <p className="text-4xl md:text-5xl font-bold tabular-nums bg-linear-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent pt-2">
              ₾{price}
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto pt-2 leading-relaxed">
              ეს არის საორიენტაციო ტარიფი. ზუსტი თანხა შეიძლება განსხვავდებოდეს
              შეკვეთის შიგთავსისა და მისამართის მიხედვით. გამოგზავნა{" "}
              {DELIVERY_BASE_LABEL}-დან.
            </p>
          </div>

          <div className="rounded-xl border border-slate-600 bg-slate-900/50 p-4 space-y-4">
            <p className="text-sm font-medium text-slate-200 text-center">
              დეტალებისთვის დაგვიკავშირდით
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <a
                href={`tel:${CONTACT_PHONE_TEL}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-linear-to-r from-orange-500 to-yellow-500 text-slate-900 font-semibold text-sm hover:from-orange-400 hover:to-yellow-300 transition-colors touch-manipulation">
                <Phone className="w-4 h-4 shrink-0" aria-hidden />
                {CONTACT_PHONE_DISPLAY}
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-slate-600 text-slate-200 text-sm font-medium hover:border-orange-500/50 hover:text-orange-300 transition-colors">
                კონტაქტის გვერდი
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setTruck(null)}
              className="text-sm text-slate-400 hover:text-orange-400">
              ტრანსპორტის ხელახლა არჩევა
            </button>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <button
              type="button"
              onClick={resetAll}
              className="text-sm text-slate-400 hover:text-orange-400 inline-flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5" aria-hidden />
              თავიდან დაწყება
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
