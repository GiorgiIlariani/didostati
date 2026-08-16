"use client";

import { useState, useEffect, useCallback } from "react";
import { adminUserAPI } from "@/lib/api";
import { useAuth } from "@/lib/context/AuthContext";
import { isFullAdmin } from "@/lib/admin";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Search, ShieldCheck, UserCog } from "lucide-react";
import Select from "@/app/components/Select";

interface AdminUser {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  createdAt: string;
}

const ROLE_OPTIONS = [
  { value: "user", label: "user — ჩვეულებრივი" },
  { value: "staff", label: "staff — შეზღუდული ადმინი (მხოლოდ პროდუქტები)" },
  { value: "admin", label: "admin — სრული წვდომა" },
];

function roleBadgeClass(role: string) {
  if (role === "admin") return "bg-orange-500/20 text-orange-400";
  if (role === "staff") return "bg-sky-500/20 text-sky-400";
  return "bg-slate-700 text-slate-300";
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      router.replace(`/login?redirect=${encodeURIComponent("/admin/users")}`);
      return;
    }
    if (!isFullAdmin(currentUser)) {
      router.replace("/admin/products");
      return;
    }
  }, [currentUser, authLoading, router]);

  const fetchUsers = useCallback(async (q?: string) => {
    try {
      setLoading(true);
      setError("");
      const response = await adminUserAPI.list(q ? { q } : undefined);
      if (response.status === "success" && response.data?.users) {
        setUsers(response.data.users);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !isFullAdmin(currentUser)) return;
    fetchUsers();
  }, [currentUser, authLoading, fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(search.trim());
  };

  const handleRoleChange = async (targetUser: AdminUser, role: string) => {
    if (role === targetUser.role) return;
    setSavingId(targetUser._id);
    try {
      await adminUserAPI.updateRole(targetUser._id, role as "user" | "staff" | "admin");
      setUsers((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, role } : u))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setSavingId(null);
    }
  };

  if (authLoading || !isFullAdmin(currentUser)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100 flex items-center gap-2">
            <UserCog className="w-7 h-7 text-violet-400" />
            მომხმარებლები და როლები
          </h1>
          <p className="text-slate-400 mt-1 max-w-2xl">
            <span className="font-medium text-sky-300">staff</span> როლს შეუძლია მხოლოდ
            პროდუქტების დამატება/რედაქტირება — არ შეუძლია წაშლა, შეკვეთების, სტატისტიკის ან
            მომხმარებლების მართვა. <span className="font-medium text-orange-300">admin</span>-ს
            აქვს სრული წვდომა.
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-6 flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ძებნა სახელით, ემაილით ან ტელეფონით"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm placeholder:text-slate-500 focus:border-orange-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm hover:border-orange-500/40 transition-colors"
          >
            ძებნა
          </button>
        </form>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center text-slate-400">
            მომხმარებელი ვერ მოიძებნა.
          </div>
        ) : (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-slate-400 font-medium text-sm px-4 py-4">მომხმარებელი</th>
                    <th className="text-left text-slate-400 font-medium text-sm px-4 py-4">როლი</th>
                    <th className="text-right text-slate-400 font-medium text-sm px-4 py-4">როლის შეცვლა</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = u._id === currentUser?._id;
                    return (
                      <tr key={u._id} className="border-b border-slate-700/50 hover:bg-slate-800/80">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-100">{u.name}</p>
                          <p className="text-sm text-slate-500">{u.email || u.phone || "—"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleBadgeClass(
                              u.role
                            )}`}
                          >
                            {u.role === "admin" && <ShieldCheck className="w-3 h-3" />}
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            {isSelf ? (
                              <span className="text-xs text-slate-500 italic">საკუთარი თავი</span>
                            ) : (
                              <div className="w-64">
                                <Select
                                  value={u.role}
                                  onChange={(role) => handleRoleChange(u, role)}
                                  options={ROLE_OPTIONS}
                                  disabled={savingId === u._id}
                                  size="sm"
                                  aria-label={`${u.name}-ის როლი`}
                                />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
