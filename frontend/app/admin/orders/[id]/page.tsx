"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { adminOrderAPI } from "@/lib/api";
import { isFullAdmin } from "@/lib/admin";
import { statusColors, statusLabels } from "@/lib/orderStatus";
import Select from "@/app/components/Select";
import {
  ArrowLeft,
  Loader2,
  Package,
  User,
  Truck,
  CreditCard,
  MessageSquare,
  History,
} from "lucide-react";

interface StatusHistoryEntry {
  status: string;
  note?: string;
  at: string;
  changedBy?: { name?: string; email?: string };
}

interface AdminOrder {
  _id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  deliveryFee: number;
  deliveryType?: string;
  notes?: string;
  customer: { name: string; email: string; phone: string };
  shippingAddress: {
    street?: string;
    city: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  statusHistory?: StatusHistoryEntry[];
  assignedManager?: { _id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

const paymentMethodLabels: Record<string, string> = {
  cash: "ნაღდი",
  card: "ბარათი",
  bank_transfer: "გადარიცხვა",
};

const deliveryLabels: Record<string, string> = {
  standard: "სტანდარტული",
  express: "ექსპრესი",
  pickup: "თვითგატანა",
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusNote, setStatusNote] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminOrderAPI.getById(orderId);
      if (res.status === "success") {
        setOrder(res.data.order);
      }
    } catch (err: any) {
      setError(err.message || "შეკვეთა ვერ ჩაიტვირთა");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isFullAdmin(user)) {
      router.replace("/");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, orderId, router]);

  const updateStatus = async (status: string) => {
    if (!order) return;
    if (
      !confirm(
        `სტატუსის შეცვლა: "${statusLabels[status] || status}"?`,
      )
    ) {
      return;
    }
    try {
      setSaving(true);
      const res = await adminOrderAPI.updateStatus(order._id, status, undefined, {
        note: statusNote || undefined,
      });
      if (res.status === "success") {
        setOrder(res.data.order);
        setStatusNote("");
      }
    } catch (err: any) {
      alert(err.message || "განახლება ვერ მოხერხდა");
    } finally {
      setSaving(false);
    }
  };

  const updatePayment = async (paymentStatus: string) => {
    if (!order) return;
    try {
      setSaving(true);
      const res = await adminOrderAPI.updateStatus(
        order._id,
        undefined,
        paymentStatus,
      );
      if (res.status === "success") {
        setOrder(res.data.order);
      }
    } catch (err: any) {
      alert(err.message || "გადახდის სტატუსი ვერ განახლდა");
    } finally {
      setSaving(false);
    }
  };

  const assignToMe = async () => {
    if (!order || !user?._id) return;
    try {
      setSaving(true);
      const res = await adminOrderAPI.updateStatus(
        order._id,
        undefined,
        undefined,
        { assignedManager: user._id },
      );
      if (res.status === "success") {
        setOrder(res.data.order);
      }
    } catch (err: any) {
      alert(err.message || "მინიჭება ვერ მოხერხდა");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!isFullAdmin(user)) return null;

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-900 py-12 px-4 text-center">
        <p className="text-red-400 mb-4">{error || "შეკვეთა ვერ მოიძებნა"}</p>
        <Link href="/admin/orders" className="text-orange-400 hover:underline">
          უკან სიაში
        </Link>
      </div>
    );
  }

  const subtotal = order.totalAmount - (order.deliveryFee || 0);

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          შეკვეთების სია
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">
              #{order.orderNumber}
            </h1>
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${
                statusColors[order.status] || statusColors.pending
              }`}>
              {statusLabels[order.status] || order.status}
            </span>
          </div>
          <p className="text-sm text-slate-500">
            {new Date(order.createdAt).toLocaleString("ka-GE")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Order info + actions */}
          <section className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-100 mb-4">
              <Package className="w-5 h-5 text-orange-400" />
              შეკვეთის ინფორმაცია
            </h2>
            <dl className="space-y-2 text-sm mb-5">
              <div className="flex justify-between">
                <dt className="text-slate-400">ქვეჯამი</dt>
                <dd className="text-slate-100 tabular-nums">
                  ₾{subtotal.toFixed(2)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">მიწოდება</dt>
                <dd className="text-slate-100 tabular-nums">
                  ₾{(order.deliveryFee || 0).toFixed(2)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-slate-700 pt-2">
                <dt className="text-slate-300 font-medium">სულ</dt>
                <dd className="text-orange-400 font-bold tabular-nums">
                  ₾{order.totalAmount.toFixed(2)}
                </dd>
              </div>
            </dl>

            <label className="block text-xs text-slate-400 mb-1">
              სტატუსის შეცვლა
            </label>
            <div className="mb-3">
              <Select
                value={order.status}
                disabled={saving}
                onChange={updateStatus}
                size="sm"
                className="rounded-lg bg-slate-900"
                options={Object.entries(statusLabels).map(
                  ([value, label]) => ({ value, label }),
                )}
              />
            </div>
            <input
              type="text"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="შენიშვნა ისტორიისთვის (ოფციონალური)"
              className="w-full mb-4 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm focus:border-orange-500 outline-none"
            />

            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-slate-400">მენეჯერი:</span>
              <span className="text-sm text-slate-200">
                {order.assignedManager?.name || "მინიჭებული არ არის"}
              </span>
              <button
                type="button"
                onClick={assignToMe}
                disabled={saving}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-600 text-orange-400 hover:bg-slate-700 disabled:opacity-50">
                მე მივიღო
              </button>
            </div>
          </section>

          {/* Customer */}
          <section className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-100 mb-4">
              <User className="w-5 h-5 text-orange-400" />
              კლიენტი
            </h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-slate-500 text-xs">სახელი</dt>
                <dd className="text-slate-100">{order.customer.name}</dd>
              </div>
              <div>
                <dt className="text-slate-500 text-xs">ტელეფონი</dt>
                <dd className="text-slate-100 tabular-nums">
                  {order.customer.phone}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 text-xs">ელფოსტა</dt>
                <dd className="text-slate-100">{order.customer.email}</dd>
              </div>
            </dl>
          </section>

          {/* Products */}
          <section className="bg-slate-800 border border-slate-700 rounded-xl p-5 lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">
              პროდუქტების სია
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="text-left py-2 pr-4">პროდუქტი</th>
                    <th className="text-right py-2 px-2">რაოდ.</th>
                    <th className="text-right py-2 px-2">ფასი</th>
                    <th className="text-right py-2 pl-2">ჯამი</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i} className="border-b border-slate-700/60">
                      <td className="py-3 pr-4 text-slate-200">{item.name}</td>
                      <td className="py-3 px-2 text-right text-slate-400 tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-2 text-right text-slate-400 tabular-nums">
                        ₾{item.price.toFixed(2)}
                      </td>
                      <td className="py-3 pl-2 text-right text-slate-100 tabular-nums">
                        ₾{item.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Delivery */}
          <section className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-100 mb-4">
              <Truck className="w-5 h-5 text-orange-400" />
              მიწოდება
            </h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-slate-500 text-xs">ტიპი</dt>
                <dd className="text-slate-100">
                  {deliveryLabels[order.deliveryType || "standard"] ||
                    order.deliveryType}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 text-xs">ქალაქი</dt>
                <dd className="text-slate-100">{order.shippingAddress.city}</dd>
              </div>
              {order.shippingAddress.street && (
                <div>
                  <dt className="text-slate-500 text-xs">მისამართი</dt>
                  <dd className="text-slate-100">
                    {order.shippingAddress.street}
                  </dd>
                </div>
              )}
              {(order.shippingAddress.region ||
                order.shippingAddress.postalCode) && (
                <div>
                  <dt className="text-slate-500 text-xs">რეგიონი / კოდი</dt>
                  <dd className="text-slate-100">
                    {[order.shippingAddress.region, order.shippingAddress.postalCode]
                      .filter(Boolean)
                      .join(" · ")}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {/* Payment */}
          <section className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-100 mb-4">
              <CreditCard className="w-5 h-5 text-orange-400" />
              გადახდა
            </h2>
            <dl className="space-y-3 text-sm mb-4">
              <div>
                <dt className="text-slate-500 text-xs">მეთოდი</dt>
                <dd className="text-slate-100">
                  {paymentMethodLabels[order.paymentMethod] ||
                    order.paymentMethod}
                </dd>
              </div>
            </dl>
            <label className="block text-xs text-slate-400 mb-1">
              გადახდის სტატუსი
            </label>
            <Select
              value={order.paymentStatus}
              disabled={saving}
              onChange={updatePayment}
              size="sm"
              className="rounded-lg bg-slate-900"
              options={[
                { value: "pending", label: "მოლოდინში" },
                { value: "paid", label: "გადახდილია" },
                { value: "failed", label: "შეცდომა" },
              ]}
            />
          </section>

          {/* Comments */}
          <section className="bg-slate-800 border border-slate-700 rounded-xl p-5 lg:col-span-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-100 mb-3">
              <MessageSquare className="w-5 h-5 text-orange-400" />
              კომენტარი
            </h2>
            <p className="text-sm text-slate-300 whitespace-pre-wrap">
              {order.notes?.trim() || "კომენტარი არ არის"}
            </p>
          </section>

          {/* Status history */}
          <section className="bg-slate-800 border border-slate-700 rounded-xl p-5 lg:col-span-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-100 mb-4">
              <History className="w-5 h-5 text-orange-400" />
              სტატუსის ისტორია
            </h2>
            {!order.statusHistory?.length ? (
              <p className="text-sm text-slate-500">ისტორია ცარიელია</p>
            ) : (
              <ul className="space-y-3">
                {[...order.statusHistory].reverse().map((entry, i) => (
                  <li
                    key={`${entry.at}-${i}`}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm border-b border-slate-700/60 pb-3">
                    <div>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border mr-2 ${
                          statusColors[entry.status] || statusColors.pending
                        }`}>
                        {statusLabels[entry.status] || entry.status}
                      </span>
                      {entry.note && (
                        <span className="text-slate-400">{entry.note}</span>
                      )}
                      {entry.changedBy?.name && (
                        <span className="text-slate-500 text-xs ml-2">
                          · {entry.changedBy.name}
                        </span>
                      )}
                    </div>
                    <time className="text-xs text-slate-500 tabular-nums">
                      {new Date(entry.at).toLocaleString("ka-GE")}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
