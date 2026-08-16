"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  clearCheckoutSuccess,
  loadCheckoutSuccess,
} from "@/lib/checkoutDraft";
import { orderAPI } from "@/lib/api";
import { downloadOrderPdf } from "@/lib/orderPdf";
import { CheckCircle, Download, Loader2 } from "lucide-react";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [orderMeta, setOrderMeta] = useState<{
    _id: string;
    orderNumber: string;
  } | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const data = loadCheckoutSuccess();
    if (!data) {
      router.replace("/");
      return;
    }
    setOrderMeta(data);
  }, [router]);

  const handlePdf = async () => {
    if (!orderMeta) return;
    setDownloading(true);
    try {
      const res = await orderAPI.getById(orderMeta._id);
      if (res.status === "success" && res.data?.order) {
        const o = res.data.order;
        downloadOrderPdf({
          orderNumber: o.orderNumber,
          createdAt: o.createdAt,
          customer: o.customer,
          shippingAddress: o.shippingAddress,
          items: o.items,
          deliveryFee: o.deliveryFee || 0,
          totalAmount: o.totalAmount,
          deliveryType: o.deliveryType,
          paymentMethod: o.paymentMethod,
          notes: o.notes,
        });
      }
    } catch {
      alert("შეკვეთის ჩამოტვირთვა ვერ მოხერხდა. სცადეთ დეტალების გვერდიდან.");
    } finally {
      setDownloading(false);
    }
  };

  if (!orderMeta) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 ds-fade-in">
      <div className="max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-xl p-8 text-center shadow-lg ds-scale-in">
        <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-5 ds-check-pop" />
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2">
          შეკვეთა დადასტურდა!
        </h1>
        <p className="text-slate-400 mb-6 text-base">
          დეტალები გამოგეგზავნათ. შეგიძლიათ ჩამოტვირთოთ PDF-ადაც.
        </p>

        <div className="mb-8 px-4 py-4 rounded-lg bg-slate-900 border border-slate-600">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
            შეკვეთის ნომერი
          </p>
          <p className="text-xl font-bold text-orange-400 tabular-nums">
            #{orderMeta.orderNumber}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handlePdf}
            disabled={downloading}
            className="ds-btn-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-900 text-slate-100 font-bold rounded-lg border border-slate-600 hover:bg-slate-700 min-h-[52px] disabled:opacity-50">
            {downloading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            ჩამოტვირთვა (PDF / ბეჭდვა)
          </button>
          <Link
            href={`/orders/${orderMeta._id}`}
            className="ds-btn-primary w-full inline-flex items-center justify-center px-5 py-3.5 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-lg min-h-[52px]">
            შეკვეთის დეტალები
          </Link>
          <Link
            href="/"
            onClick={() => clearCheckoutSuccess()}
            className="w-full inline-flex items-center justify-center px-5 py-3 text-slate-300 font-medium rounded-lg border border-slate-600 hover:bg-slate-700/50 min-h-[48px]">
            მთავარზე დაბრუნება
          </Link>
        </div>
      </div>
    </div>
  );
}
