import Link from "next/link";
import {
  DELIVERY_RATES_GUIDE,
  DELIVERY_BASE_LABEL,
  EXPRESS_FEE_EXTRA,
} from "@/lib/utils/delivery";
import { MapPin, Truck } from "lucide-react";

type Props = {
  variant?: "compact" | "full";
  className?: string;
};

/**
 * ორიენტირებითი მიწოდების ტარიფები — იგივე რიცხვები რაც კალათაში/ქალაქის არჩევაში.
 */
export default function DeliveryRatesGuide({
  variant = "full",
  className = "",
}: Props) {
  if (variant === "compact") {
    return (
      <div className={`${className}`}>
        <div className="flex items-start gap-2.5 mb-3">
          <Truck
            className="w-4 h-4 text-slate-500 shrink-0 mt-0.5"
            aria-hidden
          />
          <div>
            <p className="text-sm font-medium text-slate-200">
              მიწოდების ფასები
            </p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              დიდი მანქანით, ქალაქის მიხედვით (₾-დან)
            </p>
          </div>
        </div>
        <ul className="text-sm divide-y divide-slate-700/80 border border-slate-700/80 rounded-lg overflow-hidden">
          {DELIVERY_RATES_GUIDE.map(({ name, fromGel }) => (
            <li
              key={name}
              className="flex items-center justify-between gap-4 px-3 py-2.5 bg-slate-900/20">
              <span className="text-slate-400">{name}</span>
              <span className="tabular-nums text-slate-200 text-[13px] shrink-0">
                ₾{fromGel}
                <span className="text-slate-500 font-normal text-xs ml-1">
                  -დან
                </span>
              </span>
            </li>
          ))}
        </ul>
        <Link
          href="/shipping"
          className="mt-2.5 inline-block text-xs text-slate-500 hover:text-orange-400 transition-colors">
          მიწოდების დეტალები
        </Link>
      </div>
    );
  }

  return (
    <section className={className}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-orange-500/15 border border-orange-500/30">
          <MapPin className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100">
            მიწოდების ფასები
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            დიდი მანქანით ორიენტირებითი ტარიფები ({DELIVERY_BASE_LABEL}-დან) —
            დიდი მანქანისთვის გამოიყენეთ კალკულატორი გვერდის ზედა ნაწილში
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {DELIVERY_RATES_GUIDE.map(({ name, fromGel }) => (
          <div
            key={name}
            className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-4 flex items-center justify-between gap-3 hover:border-orange-500/40 transition-colors">
            <span className="font-medium text-slate-100">{name}</span>
            <span className="text-right">
              <span className="text-lg font-bold tabular-nums bg-linear-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent">
                ₾{fromGel}
              </span>
              <span className="block text-xs text-slate-500">-დან</span>
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-slate-700 bg-slate-800/40 p-5 space-y-3 text-sm text-slate-300">
        <p className="flex items-start gap-2">
          <Truck className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-100">ექსპრეს მიწოდება:</strong> ზემოთ
            ჩამოთვლილ ტარიფს ემატება დაახლოებით{" "}
            <span className="text-orange-300 font-semibold">
              +₾{EXPRESS_FEE_EXTRA}
            </span>
            .
          </span>
        </p>
        <p className="text-slate-400 pl-6">
          თვითგატანა მაღაზიიდან — მიწოდების საფასური{" "}
          <span className="text-slate-200 font-medium">₾0</span>.
        </p>
        <p className="text-xs text-slate-500 pl-6 pt-1">
          სხვა ქალაქებისთვის აირჩიეთ სიიდან კალათაში ან დაგვიკავშირდით — ზუსტი
          ტარიფი შეიძლება განსხვავდებოდეს მისამართის მიხედვით.
        </p>
      </div>
    </section>
  );
}
