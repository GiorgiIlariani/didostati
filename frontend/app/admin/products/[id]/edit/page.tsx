"use client";

import { useState, useEffect } from "react";
import { productAPI, categoryAPI } from "@/lib/api";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    brand: "",
    stock: "",
    badge: "",
    size: "",
    purpose: "",
    inStock: true,
    isActive: true,
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(
        `/login?redirect=${encodeURIComponent(`/admin/products/${id}/edit`)}`
      );
      return;
    }
    if (user.role !== "admin") {
      router.replace("/");
      return;
    }
  }, [user, authLoading, router, id]);

  useEffect(() => {
    if (authLoading || !user || user.role !== "admin" || !id) return;

    async function load() {
      try {
        setFetching(true);
        const [productRes, categoriesRes] = await Promise.all([
          productAPI.getById(id),
          categoryAPI.getAll(),
        ]);

        if (categoriesRes.status === "success" && categoriesRes.data?.categories) {
          setCategories(categoriesRes.data.categories);
        }

        if (productRes.status === "success" && productRes.data?.product) {
          const p = productRes.data.product;
          setFormData({
            name: p.name ?? "",
            description: p.description ?? "",
            price: String(p.price ?? ""),
            originalPrice: p.originalPrice ? String(p.originalPrice) : "",
            category: p.category?._id ?? p.category ?? "",
            brand: p.brand ?? "",
            stock: String(p.stock ?? ""),
            badge: p.badge ?? "",
            size: p.size ?? "",
            purpose: p.purpose ?? "",
            inStock: p.inStock ?? true,
            isActive: p.isActive ?? true,
          });
          const firstImage = p.images?.[0];
          setImageUrl(firstImage?.url ?? "");
        }
      } catch (err) {
        console.error("Failed to load product:", err);
        alert("Product not found");
        router.push("/admin/products");
      } finally {
        setFetching(false);
      }
    }

    load();
  }, [user, authLoading, id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : undefined,
        category: formData.category,
        brand: formData.brand,
        stock: parseInt(formData.stock, 10),
        size: formData.size || undefined,
        purpose: formData.purpose || undefined,
        inStock: formData.inStock,
        isActive: formData.isActive,
        badge: formData.badge || null,
        images: imageUrl ? [{ url: imageUrl, alt: formData.name }] : [],
      };

      const response = await productAPI.update(id, productData);

      if (response.status === "success") {
        alert("Product updated successfully!");
        router.push("/admin/products");
      } else {
        alert(response.message || "Failed to update product");
      }
    } catch (error: unknown) {
      alert(
        error instanceof Error ? error.message : "Error updating product"
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
            Edit Product
          </h1>
          <p className="text-slate-400 mt-2">
            Update product details
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-800 rounded-xl p-6 md:p-8 border border-slate-700"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-slate-300 font-semibold mb-2">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                placeholder="e.g., Bosch Professional Drill"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                placeholder="Detailed product description..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  Price (₾) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  placeholder="99.99"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  Original Price (₾)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, originalPrice: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  placeholder="129.99 (for discount)"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.parent ? `${cat.parent.name} › ${cat.name}` : cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  Brand *
                </label>
                <input
                  type="text"
                  required
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  placeholder="e.g., Bosch, DeWalt"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  Size
                </label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) =>
                    setFormData({ ...formData, size: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  placeholder="e.g., 13mm, 10L, 25kg"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  Purpose (დანიშნულება)
                </label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) =>
                    setFormData({ ...formData, purpose: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  placeholder="e.g., პროფესიონალური"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  Badge
                </label>
                <select
                  value={formData.badge}
                  onChange={(e) =>
                    setFormData({ ...formData, badge: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                >
                  <option value="">No badge</option>
                  <option value="New">New</option>
                  <option value="Sale">Sale</option>
                  <option value="Popular">Popular</option>
                  <option value="Best Seller">Best Seller</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">
                Product Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                placeholder="https://images.unsplash.com/photo-..."
              />
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="inline-flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.inStock}
                  onChange={(e) =>
                    setFormData({ ...formData, inStock: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-slate-300 font-medium">
                  Product is in stock
                </span>
              </label>
              <label className="inline-flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-slate-300 font-medium">
                  Product is active (visible on site)
                </span>
              </label>
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-700">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
              <Link
                href="/admin/products"
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold rounded-lg transition-colors flex items-center"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
