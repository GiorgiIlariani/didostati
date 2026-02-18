"use client";

/**
 * Support = Help / FAQ page. Self-service first; "Still need help?" → Contact.
 */
import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Phone, MessageCircle, Truck, CreditCard, Package, ArrowRight } from "lucide-react";

const faqs: { q: string; a: string; icon: React.ReactNode }[] = [
  {
    q: "როგორ ხდება მიწოდება და რა ღირს?",
    a: "მიწოდება ხდება საქართველოში. ფასი დამოკიდებულია ქალაქზე ან მანძილზე — კალათაში აირჩევთ ქალაქს ან მიწოდების ტიპს (სტანდარტული, ექსპრესი ან თვითგატანა). დეტალები: მიწოდების ინფო გვერდზე.",
    icon: <Truck className="w-5 h-5 text-orange-400 shrink-0" />,
  },
  {
    q: "როგორ შემიძლია გადახდა?",
    a: "მიღებულია ნაღდი გადახდა, ბარათით და ბანკის გადარიცხვა. გადახდის მეთოდს ირჩევთ შეკვეთის გაფორმებისას.",
    icon: <CreditCard className="w-5 h-5 text-orange-400 shrink-0" />,
  },
  {
    q: "როგორ შემიძლია შეკვეთის მიწოდების მიმდინარეობის შემოწმება?",
    a: "შეკვეთის გაფორმების შემდეგ გამოგიგზავნებათ შეკვეთის ნომერი. სტატუსის შესახებ დაგვირეკეთ ან დაგვიგზავნეთ შეტყობინება კონტაქტის გვერდიდან.",
    icon: <Package className="w-5 h-5 text-orange-400 shrink-0" />,
  },
  {
    q: "პროდუქტის ან შეკვეთის შესახებ კითხვა მაქვს — როგორ დავუკავშირდე?",
    a: "პროდუქტის გვერდზე შეგიძლიათ დააჭიროთ „კონსულტაცია ამ პროდუქტზე“ ან გამოგვიგზავნოთ შეტყობინება კონტაქტის გვერდიდან. ასევე შეგიძლიათ დაგვირეკოთ ან დაგვიწეროთ WhatsApp-ით.",
    icon: <MessageCircle className="w-5 h-5 text-orange-400 shrink-0" />,
  },
];

export default function SupportPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-orange-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 relative">
          <p className="text-orange-400 font-medium text-sm uppercase tracking-wider mb-2">
            დახმარება
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-100 mb-4">
            <span className="text-slate-100">ხშირი </span>
            <span className="bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              კითხვები
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl">
            იპოვეთ პასუხები მიწოდებაზე, გადახდასა და შეკვეთებზე. კითხვა დარჩა? დაგვიკავშირდით.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl bg-slate-800/60 border border-slate-700/80 overflow-hidden transition-all duration-200 hover:border-slate-600/80"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center gap-4 p-5 md:p-6 text-left group"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-700/80 text-slate-300 group-hover:bg-orange-500/10 group-hover:text-orange-400 transition-colors">
                      {faq.icon}
                    </span>
                    <span className="flex-1 text-slate-100 font-semibold text-base md:text-lg pr-2">
                      {faq.q}
                    </span>
                    <span
                      className={`shrink-0 p-1.5 rounded-lg bg-slate-700/80 text-slate-400 transition-all duration-200 ${isOpen ? "rotate-180 bg-orange-500/10 text-orange-400" : "group-hover:bg-slate-600/80"}`}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </span>
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-200 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-5 md:px-6 md:pb-6 pt-0">
                        <p className="text-slate-400 leading-relaxed pl-4 ml-10 border-l-2 border-orange-500/30">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-14 md:mt-16 rounded-2xl border border-slate-700/80 bg-linear-to-br from-slate-800/80 to-slate-800/40 p-8 md:p-10 text-center shadow-xl shadow-black/20">
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 mb-2">
              კითხვა ვერ იპოვეთ?
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              დაგვირეკეთ, გამოგვიგზავნეთ შეტყობინება ან დაგვიწერეთ WhatsApp-ით — პასუხობთ სწრაფად.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+995551318202"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-slate-700/80 hover:bg-slate-600 border border-slate-600 text-slate-100 font-semibold transition-all hover:border-slate-500"
              >
                <Phone className="w-5 h-5 text-orange-400" />
                +995 551 31 82 02
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg shadow-orange-500/20"
              >
                კონტაქტის ფორმა
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Links */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm">
            <Link
              href="/shipping"
              className="text-slate-400 hover:text-orange-400 transition-colors py-1 border-b border-transparent hover:border-orange-400/50"
            >
              მიწოდების ინფო
            </Link>
            <Link
              href="/terms"
              className="text-slate-400 hover:text-orange-400 transition-colors py-1 border-b border-transparent hover:border-orange-400/50"
            >
              მომსახურების პირობები
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}