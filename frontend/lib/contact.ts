/** Store contact — shared by FloatingContact, cart, product CTA */
export const CONTACT_PHONE_TEL = "+995551318202";
/** Human-readable, for UI (same number as CONTACT_PHONE_TEL) */
export const CONTACT_PHONE_DISPLAY = "+995 551 31 82 02";
export const CONTACT_WHATSAPP_DIGITS = "995551318202";

export const DEFAULT_WHATSAPP_MESSAGE =
  "გამარჯობა, მაქვს კითხვა Didostati-ზე.";

export function whatsappHref(message: string) {
  return `https://wa.me/${CONTACT_WHATSAPP_DIGITS}?text=${encodeURIComponent(message)}`;
}
