"use client";

import { useState, useEffect, useCallback } from "react";
import { adminActivityAPI } from "@/lib/api";
import { useAuth } from "@/lib/context/AuthContext";
import { isFullAdmin } from "@/lib/admin";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, History, Loader2, Plus, Pencil, Trash2, RotateCcw, ShieldCheck } from "lucide-react";

interface LogEntry {
  _id: string;
  user?: string | null;
  userName?: string;
  userRole?: string;
  action: string;
  resourceType: string;
  resourceName?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

const ACTION_META: Record<string, { label: string; icon: typeof Plus; color: string }> = {
  product_create: { label: "შექმნა", icon: Plus, color: "text-emerald-400" },
  product_update: { label: "რედაქტირება", icon: Pencil, color: "text-sky-400" },
  product_delete: { label: "სანაგვეში გადატანა", icon: Trash2, color: "text-amber-400" },
  product_restore: { label: "აღდგენა", icon: RotateCcw, color: "text-emerald-400" },
  product_permanent_delete: { label: "სამუდამო წაშლა", icon: Trash2, color: "text-red-400" },
  user_role_change: { label: "როლის შეცვლა", icon: ShieldCheck, color: "text-violet-400" },
};

function formatDate(d: string) {
  return new Date(d).toLocaleString("ka-GE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminActivityLogPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent("/admin/activity-log")}`);
      return;
    }
    if (!isFullAdmin(user)) {
      router.replace("/admin/products");
      return;
    }
  }, [user, authLoading, router]);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminActivityAPI.list({ limit: 100 });
      if (response.status === "success" && response.data?.logs) {
        setLogs(response.data.logs);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load activity log");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !isFullAdmin(user)) return;
    fetchLogs();
  }, [user, authLoading, fetchLogs]);

  if (authLoading || !isFullAdmin(user)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100 flex items-center gap-2">
            <History className="w-7 h-7 text-sky-400" />
            აქტივობის ისტორია
          </h1>
          <p className="text-slate-400 mt-1">ვინ, რა და როდის შეცვალა — ბოლო 100 ჩანაწერი</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center text-slate-400">
            აქტივობა ჯერ არ დაფიქსირებულა.
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => {
              const meta = ACTION_META[log.action] || {
                label: log.action,
                icon: History,
                color: "text-slate-400",
              };
              const Icon = meta.icon;
              return (
                <div
                  key={log._id}
                  className="flex items-start gap-3 bg-slate-800 rounded-lg border border-slate-700 px-4 py-3"
                >
                  <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${meta.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-100">
                      <span className="font-medium">{log.userName || "უცნობი"}</span>
                      {log.userRole && (
                        <span className="text-slate-500"> ({log.userRole})</span>
                      )}{" "}
                      — {meta.label}: <span className="text-slate-300">{log.resourceType}</span>
                      {log.resourceName ? (
                        <span className="text-slate-400"> "{log.resourceName}"</span>
                      ) : null}
                    </p>
                    {log.action === "user_role_change" && log.meta && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {String(log.meta.previousRole)} → {String(log.meta.newRole)}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-0.5">{formatDate(log.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
