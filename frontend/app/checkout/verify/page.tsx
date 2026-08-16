"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { otpAPI, orderAPI } from "@/lib/api";
import { useCart } from "@/lib/context/CartContext";
import { useAuth } from "@/lib/context/AuthContext";
import {
  clearCheckoutDraft,
  loadCheckoutDraft,
  saveCheckoutSuccess,
} from "@/lib/checkoutDraft";
import { ArrowLeft, Loader2, Smartphone } from "lucide-react";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function CheckoutVerifyPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { clearCart } = useCart();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resendLeft, setResendLeft] = useState(RESEND_SECONDS);
  const [devCode, setDevCode] = useState<string | null>(null);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login?redirect=/checkout");
      return;
    }
    const draft = loadCheckoutDraft();
    if (!draft) {
      router.replace("/checkout");
      return;
    }
    setPhone(draft.phone);
    setDevCode(sessionStorage.getItem("didostati_otp_dev_code"));
  }, [router, user, authLoading]);

  useEffect(() => {
    if (resendLeft <= 0) return;
    const t = setTimeout(() => setResendLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendLeft]);

  const code = digits.join("");

  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    if (cleaned && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = Array(CODE_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, CODE_LENGTH) - 1]?.focus();
  };

  const handleResend = async () => {
    if (resendLeft > 0 || !phone) return;
    setError("");
    try {
      const res = await otpAPI.send(phone, "order");
      if (res.status !== "success") {
        setError(res.message || "ხელახლა გაგზავნა ვერ მოხერხდა");
        return;
      }
      setResendLeft(RESEND_SECONDS);
      if (res.data?.devCode) {
        sessionStorage.setItem("didostati_otp_dev_code", res.data.devCode);
        setDevCode(res.data.devCode);
      }
    } catch (err: any) {
      setError(err.message || "ხელახლა გაგზავნა ვერ მოხერხდა");
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    const draft = loadCheckoutDraft();
    if (!draft) {
      router.replace("/checkout");
      return;
    }
    if (code.length !== CODE_LENGTH) {
      setError("შეიყვანეთ 6-ციფრიანი კოდი");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const verifyRes = await otpAPI.verify(draft.phone, code, "order");
      if (verifyRes.status !== "success" || !verifyRes.data?.otpToken) {
        setError(verifyRes.message || "არასწორი კოდი");
        return;
      }

      const createRes = await orderAPI.create({
        ...draft,
        otpToken: verifyRes.data.otpToken,
      });

      if (createRes.status !== "success" || !createRes.data?.order) {
        setError(createRes.message || "შეკვეთის შექმნა ვერ მოხერხდა");
        return;
      }

      const order = createRes.data.order;
      clearCheckoutDraft();
      sessionStorage.removeItem("didostati_otp_dev_code");
      clearCart();
      saveCheckoutSuccess({
        _id: order._id,
        orderNumber: order.orderNumber,
      });
      router.replace("/checkout/success");
    } catch (err: any) {
      setError(err.message || "დადასტურება ვერ მოხერხდა");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-10 px-4">
      <div className="max-w-md mx-auto">
        <Link
          href="/checkout"
          className="inline-flex items-center gap-2 text-slate-300 hover:text-orange-400 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          ფორმაზე დაბრუნება
        </Link>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center shadow-lg">
          <Smartphone className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-100 mb-2">
            კოდის დადასტურება
          </h1>
          <p className="text-slate-400 text-sm mb-6">
            6-ციფრიანი კოდი გაიგზავნა ნომერზე{" "}
            <span className="text-slate-200 font-medium">{phone || "…"}</span>
          </p>

          {devCode && (
            <p className="mb-4 text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
              Dev რეჟიმი — კოდი: <strong>{devCode}</strong>
            </p>
          )}

          {error && (
            <p className="mb-4 text-sm text-red-400 border border-red-500/40 bg-red-500/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <form onSubmit={handleConfirm}>
            <div
              className="flex justify-center gap-2 mb-6"
              onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputsRef.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:border-orange-500 outline-none"
                  aria-label={`ციფრი ${i + 1}`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting || code.length !== CODE_LENGTH}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px]">
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  დადასტურება...
                </>
              ) : (
                "დადასტურება"
              )}
            </button>
          </form>

          <p className="mt-4 text-sm text-slate-400">
            {resendLeft > 0 ? (
              <>ხელახლა გაგზავნა {resendLeft} წმ-ში</>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-orange-400 hover:text-orange-300 underline underline-offset-2">
                კოდის ხელახლა გაგზავნა
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
