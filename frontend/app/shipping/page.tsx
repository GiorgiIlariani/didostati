import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DeliveryRatesGuide from "@/app/components/DeliveryRatesGuide";
import ShippingPriceWizard from "@/app/components/ShippingPriceWizard";

export const metadata: Metadata = {
  title: "მიწოდების ფასები | დიდოსტატი",
  description:
    "ქალაქის, შემდეგ ტრანსპორტის არჩევა — ორიენტირებითი ტარიფი ₾-ში. საქართველოს ძირითადი ქალაქები.",
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-slate-900 py-10 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors text-sm mb-8">
          <ArrowLeft className="w-4 h-4" />
          მთავარზე დაბრუნება
        </Link>

        <header className="mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">
            მიწოდების ფასები
          </h1>
          <p className="mt-3 text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl">
            სამი მარტივი ნაბიჯი: აირჩიეთ ქალაქი რუკაზე ან სიიდან, შემდეგ მიუთითეთ
            გჭირდებათ თუ არა დიდი მანქანა — გიჩვენებთ ორიენტირებით ფასს. დეტალებზე
            დაგვირეკეთ ან გადადით კონტაქტის გვერდზე.
          </p>
        </header>

        <ShippingPriceWizard />

        <div className="mt-14 pt-10 border-t border-slate-700/80">
          <DeliveryRatesGuide variant="full" />
        </div>
      </div>
    </div>
  );
}
