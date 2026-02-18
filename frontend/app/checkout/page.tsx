"use client";

/**
 * Checkout Page
 * Simple order placement form:
 * - Contact information (phone)
 * - Shipping address (city, street, region, postalCode)
 * - Payment method (cash, card, bank_transfer)
 * - Notes
 * - Submits order via orderAPI.create, clears cart, redirects to order details
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { useCart } from "@/lib/context/CartContext";
import { orderAPI } from "@/lib/api";
import { ArrowLeft, CreditCard, CheckCircle, Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cart, clearCart } = useCart();

  const [formData, setFormData] = useState({
    phone: "",
    city: "",
    street: "",
    region: "",
    postalCode: "",
    paymentMethod: "cash" as "cash" | "card" | "bank_transfer",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login?redirect=/checkout");
      return;
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (cart.itemCount === 0 && !orderSuccess) {
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

  if (cart.itemCount > 0 && !cart.deliveryFeeResolved && !orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-100 mb-3">
            მიწოდების პარამეტრები
          </h1>
          <p className="text-slate-400 mb-6">
            კალათაში აირჩიეთ მიწოდების ტიპი (მიწოდება / ექსპრეს / თვითგატანა) და
            საჭიროების შემთხვევაში ქალაქი ან მდებარეობა.
          </p>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all">
            <ArrowLeft className="w-4 h-4" />
            კალათაში გადასვლა
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
    if (!user) return;

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        items: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: {
          city: formData.city,
          street: formData.street || undefined,
          region: formData.region || undefined,
          postalCode: formData.postalCode || undefined,
        },
        deliveryFee: cart.deliveryFee,
        deliveryType: cart.deliveryType,
        phone: formData.phone,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || undefined,
      };

      const res = await orderAPI.create(payload);
      if (res.status === "success") {
        setOrderSuccess(res.data.order);
        clearCart();
      } else {
        setError(res.message || "შეკვეთის გაფორმება ვერ მოხერხდა.");
      }
    } catch (err: any) {
      setError(err.message || "შეკვეთის გაფორმება ვერ მოხერხდა.");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-900 py-10 px-4">
        <div className="max-w-xl mx-auto bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-100 mb-2">
            შეკვეთა წარმატებით გაფორმდა!
          </h1>
          <p className="text-slate-400 mb-4">
            თქვენი შეკვეთის ნომერია{" "}
            <span className="font-semibold text-slate-100">
              {orderSuccess.orderNumber}
            </span>
            .
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
            <Link
              href={`/orders/${orderSuccess._id}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all">
              შეკვეთის დეტალები
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-800 text-slate-100 font-semibold rounded-lg border border-slate-600 hover:bg-slate-700 transition-all">
              გაგრძელება ყიდვა
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-slate-300 hover:text-orange-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            უკან დაბრუნება
          </button>
          <div className="flex items-center gap-2 text-slate-400">
            <CreditCard className="w-5 h-5" />
            <span className="text-sm">სულ: ₾{cart.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
          <h1 className="text-2xl font-bold text-slate-100 mb-4">
            შეკვეთის გაფორმება
          </h1>

          {error && (
            <p className="mb-4 text-sm text-red-400 border border-red-500/40 bg-red-500/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact */}
            <div>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">
                საკონტაქტო ინფორმაცია
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    ტელეფონი
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Shipping */}
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
                    className="w-full px-4 py-3 text-base bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    ქუჩა / მისამართი
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    რეგიონი
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    საფოსტო კოდი
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
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

            {/* Notes */}
            <div>
              <h2 className="text-lg font-semibold text-slate-100 mb-3">
                დამატებითი კომენტარი
              </h2>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 text-base bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 outline-none resize-none"
                placeholder="თუ გაქვთ რაიმე დამატებითი სურვილი ან მითითება, ჩაწერეთ აქ..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-4 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed min-h-[52px]">
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>გაფორმება...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>შეკვეთის გაფორმება</span>
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
