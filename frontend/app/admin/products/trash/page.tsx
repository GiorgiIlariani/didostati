"use client";

import { useState, useEffect, useCallback } from "react";
import { productAPI } from "@/lib/api";
import { useAuth } from "@/lib/context/AuthContext";
import { isFullAdmin } from "@/lib/admin";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Package, Loader2, RotateCcw, Trash2 } from "lucide-react";

interface TrashedProduct {
  _id: string;
  name: string;
  brand: string;
  price: number;
  images?: Array<{ url: string; alt?: string }>;
  category?: { _id: string; name: string; slug: string };
  deletedAt?: string;
  deletedBy?: { _id: string; name: string; email?: string } | null;
}

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("ka-GE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProductTrashPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<TrashedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [purgeConfirm, setPurgeConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent("/admin/products/trash")}`);
      return;
    }
    if (!isFullAdmin(user)) {
      router.replace("/admin/products");
      return;
    }
  }, [user, authLoading, router]);

  const fetchTrash = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await productAPI.getTrash();
      if (response.status === "success" && response.data?.products) {
        setProducts(response.data.products);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load trash");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !isFullAdmin(user)) return;
    fetchTrash();
  }, [user, authLoading, fetchTrash]);

  const handleRestore = async (product: TrashedProduct) => {
    setBusyId(product._id);
    try {
      await productAPI.restore(product._id);
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to restore product");
    } finally {
      setBusyId(null);
    }
  };

  const handlePurge = async (product: TrashedProduct) => {
    if (purgeConfirm !== product._id) {
      setPurgeConfirm(product._id);
      return;
    }
    setBusyId(product._id);
    try {
      await productAPI.permanentDelete(product._id);
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
      setPurgeConfirm(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to permanently delete product");
    } finally {
      setBusyId(null);
    }
  };

  if (authLoading || !isFullAdmin(user)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Manage Products
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100">სანაგვე</h1>
            <p className="text-slate-400 mt-1">
              წაშლილი პროდუქტები ინახება აქ და შესაძლებელია მათი აღდგენა. სულ: {products.length}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-400">{error}</div>
        ) : products.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
            <Trash2 className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">სანაგვე ცარიელია.</p>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-slate-400 font-medium text-sm px-4 py-4">Product</th>
                    <th className="text-left text-slate-400 font-medium text-sm px-4 py-4">წაშლის თარიღი</th>
                    <th className="text-left text-slate-400 font-medium text-sm px-4 py-4">წაშალა</th>
                    <th className="text-right text-slate-400 font-medium text-sm px-4 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="border-b border-slate-700/50 hover:bg-slate-800/80">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-700 shrink-0">
                            {product.images?.[0]?.url ? (
                              <Image
                                src={product.images[0].url}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                                unoptimized={
                                  product.images[0].url.startsWith("http://localhost") ||
                                  product.images[0].url.startsWith("https://localhost")
                                }
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-slate-500" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-100">{product.name}</p>
                            <p className="text-sm text-slate-500">{product.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{formatDate(product.deletedAt)}</td>
                      <td className="px-4 py-3 text-slate-300 text-sm">
                        {product.deletedBy?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRestore(product)}
                            disabled={busyId === product._id}
                            className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {busyId === product._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RotateCcw className="w-4 h-4" />
                            )}
                            აღდგენა
                          </button>
                          <button
                            onClick={() => handlePurge(product)}
                            disabled={busyId === product._id}
                            className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              purgeConfirm === product._id
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                            } disabled:opacity-50`}
                          >
                            <Trash2 className="w-4 h-4" />
                            {purgeConfirm === product._id ? "დარწმუნებული ხართ?" : "სამუდამო წაშლა"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
