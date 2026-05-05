"use client";

import Link from "next/link";
import { Phone, MessageCircle } from "lucide-react";
import {
  CONTACT_PHONE_TEL,
  DEFAULT_WHATSAPP_MESSAGE,
  whatsappHref,
} from "@/lib/contact";

const FloatingContact = () => {
  return (
    <div className="fixed bottom-16 md:bottom-22 right-4 md:right-6 z-40 flex flex-col items-end gap-2">
      {/* WhatsApp */}
      <a
        href={whatsappHref(DEFAULT_WHATSAPP_MESSAGE)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-3 rounded-full border border-emerald-500/40 bg-emerald-500/12 backdrop-blur-sm text-emerald-300 text-sm font-medium hover:bg-emerald-500/20 hover:border-emerald-500/55 transition-colors touch-manipulation min-h-[44px] shadow-md shadow-black/20">
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>

      <Link
        href={`tel:${CONTACT_PHONE_TEL}`}
        className="flex items-center gap-2 px-4 py-3 rounded-full border border-slate-600 bg-slate-900/80 backdrop-blur-sm text-slate-200 text-sm font-medium hover:bg-slate-800 hover:border-slate-500 transition-colors touch-manipulation min-h-[44px] shadow-md shadow-black/20">
        <Phone className="w-5 h-5 text-orange-400/90" />
        <span className="hidden sm:inline">დარეკვა</span>
      </Link>
    </div>
  );
};

export default FloatingContact;
