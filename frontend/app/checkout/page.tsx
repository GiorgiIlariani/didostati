"use client";

/**
 * Checkout form — saves draft + sends OTP, then redirects to /checkout/verify.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { useCart } from "@/lib/context/CartContext";
import { otpAPI, orderAPI } from "@/lib/api";
import {
  saveCheckoutDraft,
  saveCheckoutSuccess,
  clearCheckoutDraft,
} from "@/lib/checkoutDraft";
import CheckoutSteps from "@/app/components/CheckoutSteps";
import ContactQuickActions from "@/app/components/ContactQuickActions";
import { ArrowLeft, CreditCard, Loader2, Smartphone, CheckCircle } from "lucide-react";

function normalizePhoneDigits(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (/^5\d{8}$/.test(digits)) return digits;
  if (/^9955\d{8}$/.test(digits)) return digits.slice(3);
  return null;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cart, clearCart } = useCart();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    street: "",
    paymentMethod: "cash" as "cash" | "card" | "bank_transfer",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login?redirect=/checkout");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (authLoading || !user) return;
    setFormData((prev) => ({
      ...prev,
      name: prev.name || user.name || "",
      email: prev.email || user.email || "",
      phone: prev.phone || user.phone || "",
    }));
  }, [user, authLoading]);

  // Prefill city from cart delivery selection
  useEffect(() => {
    if (cart.deliveryLocationName && !formData.city) {
      setFormData((prev) => ({
        ...prev,
        city: cart.deliveryLocationName || prev.city,
      }));
    }
  }, [cart.deliveryLocationName, formData.city]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (cart.itemCount === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-100 mb-3">
            კალათა ცარიელია
          </h1>
          <p className="text-slate-400 mb-6">
            შეკვეთის გასაფორმებლად ჯერ დაამატეთ პროდუქტები კალათაში.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all">
            <ArrowLeft className="w-4 h-4" />
            პროდუქტებზე დაბრუნება
          </Link>
        </div>
      </div>
    );
  }

  if (!cart.deliveryFeeResolved) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-100 mb-3">
            მიწოდების პარამეტრები
          </h1>
          <p className="text-slate-400 mb-6">
            ჯერ აირჩიეთ მიწოდების ტიპი და ქალაქი.
          </p>
          <Link
            href="/checkout/delivery"
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all">
            <ArrowLeft className="w-4 h-4" />
            მიწოდების არჩევა
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const draft = {
        items: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: {
          city: formData.city.trim(),
          street: formData.street.trim() || undefined,
        },
        deliveryFee: cart.deliveryFee,
        deliveryType: cart.deliveryType,
        phone: formData.phone.trim(),
        name: formData.name.trim(),
        // Omit rather than send "" — express-validator's optional() treats
        // an empty string as present, so it must be entirely absent to be
        // truly optional.
        email: formData.email.trim() || undefined,
        customer: {
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim(),
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes.trim() || undefined,
        total: cart.total,
      };

      const formPhone = normalizePhoneDigits(draft.phone);
      const userPhone = user?.phone
        ? normalizePhoneDigits(user.phone)
        : null;
      const phoneAlreadyVerified =
        !!formPhone && !!userPhone && formPhone === userPhone;

      // Phone login users: skip second OTP, place order directly
      if (phoneAlreadyVerified) {
        const createRes = await orderAPI.create(draft);
        if (createRes.status !== "success" || !createRes.data?.order) {
          setError(createRes.message || "შეკვეთის შექმნა ვერ მოხერხდა");
          return;
        }
        clearCheckoutDraft();
        clearCart();
        saveCheckoutSuccess({
          _id: createRes.data.order._id,
          orderNumber: createRes.data.order.orderNumber,
        });
        router.replace("/checkout/success");
        return;
      }

      const res = await otpAPI.send(draft.phone, "order");
      if (res.status !== "success") {
        setError(res.message || "OTP გაგზავნა ვერ მოხერხდა");
        return;
      }

      saveCheckoutDraft(draft);
      if (res.data?.devCode) {
        sessionStorage.setItem("didostati_otp_dev_code", res.data.devCode);
      } else {
        sessionStorage.removeItem("didostati_otp_dev_code");
      }
      router.push("/checkout/verify");
    } catch (err: any) {
      setError(err.message || "შეკვეთა ვერ გაფორმდა");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4 ds-fade-in">
      <div className="max-w-4xl mx-auto">
        <CheckoutSteps current="details" />
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/checkout/delivery"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-orange-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            მიწოდებაზე დაბრუნება
          </Link>
          <div className="flex items-center gap-2 text-slate-300">
            <CreditCard className="w-5 h-5" />
            <span className="text-base font-semibold tabular-nums">
              სულ: ₾{cart.total.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 sm:p-6 shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2">
            შეკვეთის დეტალები
          </h1>
          <p className="text-base text-slate-400 mb-4">
            {user?.phone
              ? "შეავსეთ მისამართი და დაადასტურეთ — თუ ნომერი ემთხვევა ანგარიშს, SMS აღარ დაგჭირდებათ."
              : "შეავსეთ ფორმა — შემდეგ SMS კოდით დავადასტურებთ ტელეფონს."}
          </p>

          {error && (
            <p className="mb-4 text-sm text-red-400 border border-red-500/40 bg-red-500/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">
                საკონტაქტო ინფორმაცია
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm text-slate-300 mb-1">
                    სახელი და გვარი
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    className="w-full px-4 py-3 text-base bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    ელფოსტა (არასავალდებულო)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    className="w-full px-4 py-3 text-base bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    ტელეფონი (5XX XXX XXX)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    placeholder="5XXXXXXXX"
                    className="w-full px-4 py-3 text-base bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">
                მიწოდების მისამართი
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    ქალაქი
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="მაგ: თბილისი, გორი"
                    className="w-full px-4 py-3 text-base bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    რაიონი ან ქუჩა
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="რაიონი / ქუჩა / სოფელი"
                    className="w-full px-4 py-3 text-base bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 outline-none"
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                ქალაქში — მიუთითეთ რაიონი ან ქუჩა; სოფელში — სოფლის/რაიონის სახელი
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">
                გადახდის მეთოდი
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                {[
                  { value: "cash", label: "ნაღდი ფული" },
                  { value: "card", label: "ბარათით გადახდა" },
                  { value: "bank_transfer", label: "ბანკის გადარიცხვა" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer text-sm ${
                      formData.paymentMethod === opt.value
                        ? "border-orange-500 bg-slate-800 text-slate-100"
                        : "border-slate-700 bg-slate-900 text-slate-300"
                    }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={opt.value}
                      checked={formData.paymentMethod === opt.value}
                      onChange={handleChange}
                      className="w-5 h-5 text-orange-500 focus:ring-orange-500 border-slate-600 bg-slate-900"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">
                კომენტარი (არასავალდებულო)
              </h2>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 text-base bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 outline-none resize-none"
                placeholder="დამატებითი მითითება..."
              />
            </div>

            <div className="pt-4 border-t border-slate-700">
              <p className="text-base font-medium text-slate-200 mb-1">
                დახმარება გჭირდებათ?
              </p>
              <p className="text-sm text-slate-500 mb-3">
                დაგვირეკეთ ან მოგვწერეთ WhatsApp-ზე — დაგეხმარებით შეკვეთაში
              </p>
              <ContactQuickActions
                whatsappMessage="გამარჯობა, შეკვეთის გაფორმებაში მჭირდება დახმარება — Didostati."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="ds-btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-orange-500 to-yellow-500 text-white text-base font-bold rounded-lg shadow-lg disabled:opacity-60 disabled:cursor-not-allowed min-h-[56px]">
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>დამუშავება...</span>
                  </>
                ) : user?.phone ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>შეკვეთის დადასტურება</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-5 h-5" />
                    <span>შეკვეთის დადასტურება</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
