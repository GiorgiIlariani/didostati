"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { adminOrderAPI } from "@/lib/api";
import {
  ArrowLeft,
  Package,
  Loader2,
  RefreshCw,
  Eye,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { isFullAdmin } from "@/lib/admin";
import { SHIPPING_WIZARD_CITIES } from "@/lib/utils/delivery";
import { statusColors, statusLabels } from "@/lib/orderStatus";
import Select from "@/app/components/Select";

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  deliveryFee: number;
  deliveryType?: "standard" | "express" | "pickup";
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street?: string;
    city: string;
  };
  assignedManager?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
}

const deliveryLabels: Record<string, string> = {
  standard: "სტანდარტული",
  express: "ექსპრესი",
  pickup: "თვითგატანა",
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminOrderAPI.getAll({
        status: statusFilter || undefined,
        city: cityFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        search: search || undefined,
        limit: 50,
      });
      if (response.status === "success") {
        setOrders(response.data.orders);
      }
    } catch (err: any) {
      setError(err.message || "შეკვეთების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, cityFilter, dateFrom, dateTo, search]);

  useEffect(() => {
    if (authLoading) return;
    if (!isFullAdmin(user)) {
      router.replace("/");
      return;
    }
    fetchOrders();
  }, [user, authLoading, router, fetchOrders]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!isFullAdmin(user)) return null;

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          მთავარი
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                შეკვეთები
              </span>
            </h1>
            <p className="text-slate-400">ყველა შეკვეთის სრული კონტროლი</p>
          </div>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-100 transition-colors">
            <RefreshCw className="w-4 h-4" />
            განახლება
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="ყველა სტატუსი"
            size="sm"
            className="rounded-lg"
            options={Object.entries(statusLabels).map(([value, label]) => ({
              value,
              label,
            }))}
          />

          <Select
            value={cityFilter}
            onChange={setCityFilter}
            placeholder="ყველა ქალაქი"
            size="sm"
            className="rounded-lg"
            options={SHIPPING_WIZARD_CITIES.map((c) => ({
              value: c.name,
              label: c.name,
            }))}
          />

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:border-orange-500 outline-none"
            aria-label="თარიღიდან"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:border-orange-500 outline-none"
            aria-label="თარიღამდე"
          />

          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(searchInput.trim());
            }}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="ნომერი, სახელი, ტელეფონი..."
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:border-orange-500 outline-none"
              />
            </div>
          </form>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-300 mb-2">
              შეკვეთები არ მოიძებნა
            </h2>
            <p className="text-slate-400">შეცვალეთ ფილტრები ან დაელოდეთ ახალ შეკვეთებს</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800/60">
            <table className="w-full text-sm text-left min-w-[900px]">
              <thead className="text-xs uppercase text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 font-medium">ნომერი</th>
                  <th className="px-4 py-3 font-medium">თარიღი</th>
                  <th className="px-4 py-3 font-medium">კლიენტი</th>
                  <th className="px-4 py-3 font-medium">ტელეფონი</th>
                  <th className="px-4 py-3 font-medium">ქალაქი</th>
                  <th className="px-4 py-3 font-medium">ჯამი</th>
                  <th className="px-4 py-3 font-medium">მიწოდება</th>
                  <th className="px-4 py-3 font-medium">სტატუსი</th>
                  <th className="px-4 py-3 font-medium">მენეჯერი</th>
                  <th className="px-4 py-3 font-medium">ნახვა</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-slate-700/80 hover:bg-slate-800 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-100 tabular-nums">
                      #{order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleString("ka-GE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-slate-200">
                      {order.customer.name}
                    </td>
                    <td className="px-4 py-3 text-slate-400 tabular-nums">
                      {order.customer.phone}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {order.shippingAddress.city}
                    </td>
                    <td className="px-4 py-3 text-orange-400 font-semibold tabular-nums">
                      ₾{order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {deliveryLabels[order.deliveryType || "standard"] ||
                        order.deliveryType}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          statusColors[order.status] || statusColors.pending
                        }`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {order.assignedManager?.name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="inline-flex p-2 rounded-lg text-slate-300 hover:text-orange-400 hover:bg-slate-700 transition-colors"
                        aria-label="დეტალები">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Status legend */}
        <div className="mt-8 flex flex-wrap gap-3 text-xs">
          {Object.entries(statusLabels).map(([key, label]) => (
            <span
              key={key}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusColors[key]}`}>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
