import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import {
  CONTACT_PHONE_TEL,
  DEFAULT_WHATSAPP_MESSAGE,
  whatsappHref,
} from "@/lib/contact";

type Props = {
  /** Pre-filled WhatsApp text (e.g. product name) */
  whatsappMessage?: string;
  className?: string;
};

export default function ContactQuickActions({
  whatsappMessage = DEFAULT_WHATSAPP_MESSAGE,
  className = "",
}: Props) {
  const wa = whatsappHref(whatsappMessage);

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center gap-2.5 px-4 py-3 rounded-lg border border-emerald-500/35 bg-emerald-500/6 text-emerald-400 text-sm font-medium hover:bg-emerald-500/12 hover:border-emerald-500/50 transition-colors touch-manipulation min-h-[46px]">
        <MessageCircle className="w-[18px] h-[18px] shrink-0 opacity-90" aria-hidden />
        <span>WhatsApp</span>
      </a>
      <Link
        href={`tel:${CONTACT_PHONE_TEL}`}
        className="inline-flex w-full items-center justify-center gap-2.5 px-4 py-3 rounded-lg border border-slate-600 bg-slate-900/40 text-slate-200 text-sm font-medium hover:bg-slate-800 hover:border-slate-500 transition-colors touch-manipulation min-h-[46px]">
        <Phone className="w-[18px] h-[18px] text-orange-400/90 shrink-0" aria-hidden />
        <span>დარეკვა</span>
      </Link>
    </div>
  );
}
