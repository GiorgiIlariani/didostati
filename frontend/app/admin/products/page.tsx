"use client";

import { useState, useEffect } from "react";
import { productAPI } from "@/lib/api";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Package,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  stock: number;
  inStock: boolean;
  isActive?: boolean;
  badge?: string | null;
  images?: Array<{ url: string; alt?: string }>;
  category?: { _id: string; name: string; slug: string };
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent("/admin/products")}`);
      return;
    }
    if (user.role !== "admin") {
      router.replace("/");
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (authLoading || !user || user.role !== "admin") return;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");
        const response = await productAPI.getAdminAll();
        if (response.status === "success" && response.data?.products) {
          setProducts(response.data.products);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [user, authLoading]);

  const handleDelete = async (product: Product) => {
    if (deleteConfirm !== product._id) {
      setDeleteConfirm(product._id);
      return;
    }

    setDeletingId(product._id);
    try {
      await productAPI.delete(product._id);
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
      setDeleteConfirm(null);
    } catch (err: unknown) {
      alert(
        err instanceof Error ? err.message : "Failed to delete product"
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100">
              Manage Products
            </h1>
            <p className="text-slate-400 mt-1">
              Edit or delete products. Total: {products.length}
            </p>
          </div>
          <Link
            href="/admin/products/add"
            className="inline-flex items-center gap-2 px-4 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-400">{error}</div>
        ) : products.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
            <Package className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No products yet.</p>
            <Link
              href="/admin/products/add"
              className="inline-flex items-center gap-2 px-4 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg"
            >
              <Plus className="w-5 h-5" />
              Add your first product
            </Link>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-slate-400 font-medium text-sm px-4 py-4">
                      Product
                    </th>
                    <th className="text-left text-slate-400 font-medium text-sm px-4 py-4">
                      Category
                    </th>
                    <th className="text-left text-slate-400 font-medium text-sm px-4 py-4">
                      Price
                    </th>
                    <th className="text-left text-slate-400 font-medium text-sm px-4 py-4">
                      Stock
                    </th>
                    <th className="text-left text-slate-400 font-medium text-sm px-4 py-4">
                      Status
                    </th>
                    <th className="text-right text-slate-400 font-medium text-sm px-4 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="border-b border-slate-700/50 hover:bg-slate-800/80"
                    >
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
                            <p className="font-medium text-slate-100">
                              {product.name}
                            </p>
                            <p className="text-sm text-slate-500">
                              {product.brand}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-sm">
                        {product.category?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-100 font-medium">
                        ₾{product.price.toFixed(2)}
                        {product.originalPrice &&
                          product.originalPrice > product.price && (
                            <span className="text-slate-500 line-through text-sm ml-1">
                              ₾{product.originalPrice.toFixed(2)}
                            </span>
                          )}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {product.stock}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            product.isActive === false
                              ? "bg-red-500/20 text-red-400"
                              : product.inStock
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {product.isActive === false ? (
                            <>
                              <EyeOff className="w-3 h-3" />
                              Inactive
                            </>
                          ) : product.inStock ? (
                            <>
                              <Eye className="w-3 h-3" />
                              In stock
                            </>
                          ) : (
                            "Out of stock"
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${product._id}/edit`}
                            className="inline-flex items-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg text-sm font-medium transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(product)}
                            disabled={deletingId === product._id}
                            className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              deleteConfirm === product._id
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                            } disabled:opacity-50`}
                          >
                            {deletingId === product._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                            {deleteConfirm === product._id ? "Confirm?" : "Delete"}
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
