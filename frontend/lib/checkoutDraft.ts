/**
 * Checkout draft helpers — sessionStorage between form → OTP → create order.
 */
export const CHECKOUT_DRAFT_KEY = "didostati_checkout_draft";
export const CHECKOUT_SUCCESS_KEY = "didostati_checkout_success";

export type CheckoutDraft = {
  items: Array<{ productId: string; quantity: number }>;
  shippingAddress: {
    street?: string;
    city: string;
    region?: string;
    postalCode?: string;
  };
  deliveryFee: number;
  deliveryType: "standard" | "express" | "pickup";
  phone: string;
  name: string;
  email?: string;
  customer: { name: string; email?: string; phone: string };
  paymentMethod: "cash" | "card" | "bank_transfer";
  notes?: string;
  total: number;
};

export function saveCheckoutDraft(draft: CheckoutDraft) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
}

export function loadCheckoutDraft(): CheckoutDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CheckoutDraft;
  } catch {
    return null;
  }
}

export function clearCheckoutDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
}

export function saveCheckoutSuccess(order: {
  _id: string;
  orderNumber: string;
}) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CHECKOUT_SUCCESS_KEY, JSON.stringify(order));
}

export function loadCheckoutSuccess(): {
  _id: string;
  orderNumber: string;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CHECKOUT_SUCCESS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearCheckoutSuccess() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CHECKOUT_SUCCESS_KEY);
}
