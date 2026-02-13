"use client";

import Link from "next/link";
import { Phone, MessageCircle } from "lucide-react";

const PHONE_TEL = "+995551318202";

const whatsappMessage = encodeURIComponent(
  "გამარჯობა, მაქვს კითხვა Didostati-ზე.",
);

const FloatingContact = () => {
  return (
    <div className="fixed bottom-32 md:bottom-22 right-4 md:right-6 z-40 flex flex-col items-end gap-2">
      {/* WhatsApp */}
      <a
        href={`https://wa.me/995551318202?text=${whatsappMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all touch-manipulation min-h-[44px]">
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>

      {/* Fast Call */}
      <Link
        href={`tel:${PHONE_TEL}`}
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-100 text-sm font-semibold shadow-lg hover:shadow-xl transition-all touch-manipulation min-h-[44px]">
        <Phone className="w-5 h-5 text-orange-400" />
        <span className="hidden sm:inline">სწრაფი ზარი</span>
      </Link>
    </div>
  );
};

export default FloatingContact;
