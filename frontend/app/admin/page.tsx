"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  Users,
  UserPlus,
  Package,
  ShoppingBag,
  Wallet,
  UserCog,
  History,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { isFullAdmin } from "@/lib/admin";
import { adminStatsAPI } from "@/lib/api";

type Stats = {
  totalUsers: number;
  usersToday: number;
  totalOrders: number;
  ordersToday: number;
  totalProducts: number;
  revenueTotal: number;
  revenueToday: number;
};

function formatGel(n: number) {
  return `₾${Number(n || 0).toLocaleString("ka-GE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminStatsAPI.get();
      if (res.status === "success") {
        setStats(res.data);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "სტატისტიკის ჩატვირთვა ვერ მოხერხდა"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isFullAdmin(user)) {
      router.replace("/");
      return;
    }
    fetchStats();
  }, [user, authLoading, router, fetchStats]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!isFullAdmin(user)) return null;

  const cards = stats
    ? [
        {
          label: "სულ მომხმარებელი",
          value: stats.totalUsers.toLocaleString(),
          hint: "რეგისტრირებული აქაუნთები",
          icon: Users,
          accent: "text-sky-400",
          href: undefined as string | undefined,
        },
        {
          label: "დღეს ახალი",
          value: stats.usersToday.toLocaleString(),
          hint: "დღეს დარეგისტრირებული",
          icon: UserPlus,
          accent: "text-violet-400",
          href: undefined,
        },
        {
          label: "სულ შეკვეთები",
          value: stats.totalOrders.toLocaleString(),
          hint: "ყველა შეკვეთა",
          icon: Package,
          accent: "text-emerald-400",
          href: "/admin/orders",
        },
        {
          label: "დღევანდელი შეკვეთები",
          value: stats.ordersToday.toLocaleString(),
          hint: "დღეს შექმნილი",
          icon: Package,
          accent: "text-orange-400",
          href: "/admin/orders",
        },
        {
          label: "პროდუქტები",
          value: stats.totalProducts.toLocaleString(),
          hint: "კატალოგში",
          icon: ShoppingBag,
          accent: "text-yellow-400",
          href: "/admin/products",
        },
        {
          label: "შემოსავალი (სულ)",
          value: formatGel(stats.revenueTotal),
          hint: `დღეს: ${formatGel(stats.revenueToday)} · გაუქმებულის გარეშე`,
          icon: Wallet,
          accent: "text-emerald-300",
          href: undefined,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          მთავარი
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-slate-400 text-sm">
              სწრაფი მიმოხილვა — მომხმარებლები, შეკვეთები, შემოსავალი
            </p>
          </div>
          <button
            type="button"
            onClick={fetchStats}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-600 text-slate-200 text-sm hover:border-orange-500/50 hover:text-orange-300 transition-colors disabled:opacity-50">
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            განახლება
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading && !stats ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => {
              const Icon = card.icon;
              const body = (
                <>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <p className="text-sm text-slate-400 font-medium">
                      {card.label}
                    </p>
                    <Icon className={`w-5 h-5 shrink-0 ${card.accent}`} />
                  </div>
                  <p className="text-3xl font-bold text-slate-100 tabular-nums tracking-tight">
                    {card.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {card.hint}
                  </p>
                </>
              );

              const className =
                "rounded-xl border border-slate-700 bg-slate-800/50 p-5 transition-colors hover:border-slate-600";

              return card.href ? (
                <Link key={card.label} href={card.href} className={className}>
                  {body}
                </Link>
              ) : (
                <div key={card.label} className={className}>
                  {body}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 hover:border-orange-500/40 transition-colors">
            <Package className="w-4 h-4 text-emerald-400" />
            შეკვეთები
          </Link>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 hover:border-orange-500/40 transition-colors">
            <ShoppingBag className="w-4 h-4 text-orange-400" />
            პროდუქტები
          </Link>
          <Link
            href="/admin/products/trash"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 hover:border-orange-500/40 transition-colors">
            <Trash2 className="w-4 h-4 text-red-400" />
            სანაგვე
          </Link>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 hover:border-orange-500/40 transition-colors">
            <UserCog className="w-4 h-4 text-violet-400" />
            მომხმარებლები და როლები
          </Link>
          <Link
            href="/admin/activity-log"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 hover:border-orange-500/40 transition-colors">
            <History className="w-4 h-4 text-sky-400" />
            აქტივობის ისტორია
          </Link>
        </div>
      </div>
    </div>
  );
}
