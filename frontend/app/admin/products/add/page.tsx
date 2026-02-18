"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { productAPI, categoryAPI } from "@/lib/api";
import { FormSelect, type FormSelectOption } from "@/app/components/FormSelect";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";

const BADGE_OPTIONS: FormSelectOption[] = [
  { value: "", label: "ბეიჯის გარეშე" },
  { value: "New", label: "ახალი" },
  { value: "Sale", label: "ფასდაკლება" },
  { value: "Popular", label: "პოპულარული" },
  { value: "Best Seller", label: "ყველაზე გაყიდვადი" },
];

const inputBase =
  "w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 outline-none transition-all";

export default function AddProductPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    rating: "4.5",
    reviews: "0",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(
        `/login?redirect=${encodeURIComponent("/admin/products/add")}`,
      );
      return;
    }
    if (user.role !== "admin") {
      router.replace("/");
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (authLoading) return;
    async function loadCategories() {
      try {
        const response = await categoryAPI.getAll();
        if (response.status === "success") {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    }
    loadCategories();
  }, [user, authLoading]);

  const categoryOptions: FormSelectOption[] = [
    { value: "", label: "Select category" },
    ...categories.map((cat) => ({
      value: cat._id,
      label: cat.parent ? `${cat.parent.name} › ${cat.name}` : cat.name,
    })),
  ];

  const setImageFromFileOrBlob = useCallback(
    async (file: File | Blob, filename?: string) => {
      setImageError("");
      setImageUploading(true);
      try {
        const { url } = await productAPI.uploadImage(file, filename);
        setImageUrl(url);
      } catch (e: any) {
        const msg = e?.message || "";
        const isAuthError =
          /authorized|log in|session expired|invalid token/i.test(msg);
        setImageError(
          isAuthError
            ? "სურათის ატვირთვა მოითხოვს ადმინისტრატორის შესვლას. ან ჩასვით სურათის ბმული ქვემოთ."
            : msg || "ატვირთვა ვერ მოხერხდა",
        );
      } finally {
        setImageUploading(false);
      }
    },
    [],
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError("გთხოვთ აირჩიოთ სურათი (JPEG, PNG, GIF, WebP).");
      return;
    }
    setImageFromFileOrBlob(file);
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : undefined,
        category: formData.category || undefined,
        brand: formData.brand,
        stock: parseInt(formData.stock),
        size: formData.size || undefined,
        purpose: formData.purpose || undefined,
        inStock: formData.inStock,
        rating: parseFloat(formData.rating),
        reviewsCount: parseInt(formData.reviews) || 0,
        badge: formData.badge || null,
        images: imageUrl ? [{ url: imageUrl, alt: formData.name }] : [],
        isActive: true,
      };
      const response = await productAPI.create(productData);
      if (response.status === "success") {
        alert("პროდუქტი წარმატებით შეიქმნა!");
        router.push("/admin/products");
      }
    } catch (error: any) {
      alert("შეცდომა პროდუქტის შექმნისას: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">იტვირთება...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            უკან პროდუქტებზე
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">
            <span className="bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              ახალი პროდუქტის დამატება
            </span>
          </h1>
          <p className="text-slate-400 mt-2">
            შეავსეთ დეტალები ახალი პროდუქტის დასამატებლად
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-800/80 rounded-2xl p-6 md:p-8 border border-slate-700 shadow-xl">
          <div className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-slate-300 font-semibold mb-2">
                პროდუქტის სახელი *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={inputBase}
                placeholder="მაგ., Bosch Professional Drill"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-300 font-semibold mb-2">
                აღწერა *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className={inputBase}
                placeholder="დეტალური აღწერა..."
              />
            </div>

            {/* Price & Original Price */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  ფასი (₾) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className={inputBase}
                  placeholder="99.99"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  ძველი ფასი (₾)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, originalPrice: e.target.value })
                  }
                  className={inputBase}
                  placeholder="129.99"
                />
              </div>
            </div>

            {/* Category & Brand */}
            <div className="grid md:grid-cols-2 gap-4">
              <FormSelect
                label="კატეგორია"
                value={formData.category}
                options={categoryOptions}
                onChange={(v) => setFormData({ ...formData, category: v })}
                required
                placeholder="აირჩიეთ კატეგორია"
              />
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  ბრენდი *
                </label>
                <input
                  type="text"
                  required
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  className={inputBase}
                  placeholder="მაგ., Bosch, DeWalt"
                />
              </div>
            </div>

            {/* Size & Purpose */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  ზომა
                </label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) =>
                    setFormData({ ...formData, size: e.target.value })
                  }
                  className={inputBase}
                  placeholder="მაგ., 13mm, 10L, 25kg"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  დანიშნულება
                </label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) =>
                    setFormData({ ...formData, purpose: e.target.value })
                  }
                  className={inputBase}
                  placeholder="მაგ., პროფესიონალური, შიდა სამუშაოები"
                />
              </div>
            </div>

            {/* Stock & Badge */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  ნაშთის რაოდენობა *
                </label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  className={inputBase}
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  ბეიჯი
                </label>
                <div className="flex flex-wrap gap-2">
                  {BADGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value || "none"}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, badge: opt.value }))
                      }
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        formData.badge === opt.value
                          ? "bg-orange-500 text-white ring-2 ring-orange-400"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Image: upload only */}
            <div>
              <label className="block text-slate-300 font-semibold mb-2">
                პროდუქტის სურათი
              </label>
              <div className="rounded-xl border-2 border-dashed border-slate-600 bg-slate-900/50 p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="shrink-0 w-32 h-32 rounded-lg bg-slate-800 overflow-hidden border border-slate-700 flex items-center justify-center">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-slate-500 text-sm">
                        სურათი არ არის
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={onFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={imageUploading}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                      <Upload className="w-4 h-4" />
                      {imageUploading ? "იტვირთება…" : "სურათის ატვირთვა"}
                    </button>
                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="text-slate-400 hover:text-slate-200 text-sm"
                        aria-label="სურათის წაშლა">
                        <X className="w-4 h-4 inline mr-1" />
                        წაშლა
                      </button>
                    )}
                    {imageError && (
                      <p className="text-red-400 text-sm">{imageError}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* In Stock */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="inStock"
                checked={formData.inStock}
                onChange={(e) =>
                  setFormData({ ...formData, inStock: e.target.checked })
                }
                className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-orange-500 focus:ring-orange-500"
              />
              <label htmlFor="inStock" className="text-slate-300 font-medium">
                პროდუქტი არის ნაშთში
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-6 border-t border-slate-700">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg disabled:opacity-50">
                {loading ? "იქმნება…" : "პროდუქტის შექმნა"}
              </button>
              <Link
                href="/admin/products"
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold rounded-xl transition-colors inline-flex items-center justify-center">
                გაუქმება
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
