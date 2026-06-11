"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Video, ImageIcon, Loader2 } from "lucide-react";
import { advertisementAPI } from "@/lib/api";
import { useAuth } from "@/lib/context/AuthContext";
import { isAllowedAdmin } from "@/lib/admin";
import { FormSelect, type FormSelectOption } from "@/app/components/FormSelect";
import HeroMediaFrame from "@/app/components/HeroMediaFrame";

const TYPE_OPTIONS: FormSelectOption[] = [
  { value: "video", label: "ვიდეო / ანიმაცია" },
  { value: "image", label: "სურათი" },
];

export default function AddHeroSlidePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "video",
    mediaUrl: "",
    position: "hero",
    isActive: true,
    priority: 0,
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent("/admin/hero/add")}`);
      return;
    }
    if (!isAllowedAdmin(user)) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await advertisementAPI.uploadMedia(file);
      if (res.status === "success" && res.data?.url) {
        setFormData((prev) => ({ ...prev, mediaUrl: res.data.url }));
      }
    } catch (err: unknown) {
      alert(
        "ატვირთვა ვერ მოხერხდა: " +
          (err instanceof Error ? err.message : "უცნობი შეცდომა")
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mediaUrl.trim()) {
      alert("გთხოვთ ატვირთოთ ვიდეო ან სურათი.");
      return;
    }
    setLoading(true);
    try {
      const response = await advertisementAPI.create(formData);
      if (response.status === "success") {
        router.push("/admin/hero");
      } else {
        alert("შეცდომა: " + (response as { message?: string }).message);
      }
    } catch (err: unknown) {
      alert(
        "შეცდომა: " +
          (err instanceof Error ? err.message : "სლაიდის შექმნა ვერ მოხერხდა")
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAllowedAdmin(user)) {
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
            href="/admin/hero"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Hero სლაიდები
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100">
            ახალი Hero სლაიდი
          </h1>
          <p className="text-slate-400 mt-2">
            ატვირთე პროდუქტის ანიმაცია ან ვიდეო — გამოჩნდება მთავარი გვერდის Hero
            სექციაში
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-800 rounded-xl p-6 md:p-8 border border-slate-700">
          <div className="space-y-6">
            <div>
              <label className="block text-slate-300 font-semibold mb-2">
                სათაური <span className="text-orange-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                placeholder="მაგ: ტბოიზოლაცია — პროდუქტის ანიმაცია"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">
                აღწერა (არასავალდებულო)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
                maxLength={500}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                placeholder="მოკლე აღწერა"
              />
            </div>

            <FormSelect
              label="ტიპი"
              value={formData.type}
              options={TYPE_OPTIONS}
              onChange={(value) => setFormData({ ...formData, type: value })}
              required
            />

            <div>
              <label className="block text-slate-300 font-semibold mb-2">
                {formData.type === "video" ? "ვიდეო" : "სურათი"}{" "}
                <span className="text-orange-400">*</span>
              </label>
              <label className="flex flex-col items-center justify-center gap-2 w-full px-4 py-10 bg-slate-900 border border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-orange-500/50 transition-colors">
                <span className="text-slate-400">
                  {formData.type === "video" ? (
                    <Video className="w-10 h-10" />
                  ) : (
                    <ImageIcon className="w-10 h-10" />
                  )}
                </span>
                <span className="text-slate-300 text-sm font-medium flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {uploading
                    ? "იტვირთება…"
                    : "დააჭირე ფაილის ასარჩევად"}
                </span>
                <span className="text-slate-500 text-xs">
                  {formData.type === "video"
                    ? "MP4, WebM (მაქს. 50MB) · ნებისმიერი პропორცია — საიტზე ავტომატურად მოერგება"
                    : "JPEG, PNG, GIF, WebP (მაქს. 50MB) · ნებისმიერი პропორცია — საიტზე ავტომატურად მოერგება"}
                </span>
                <input
                  type="file"
                  accept={
                    formData.type === "video"
                      ? "video/mp4,video/webm,video/quicktime"
                      : "image/jpeg,image/png,image/gif,image/webp"
                  }
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              {formData.mediaUrl && (
                <div className="mt-4">
                  <p className="text-slate-400 text-sm mb-2">
                    ასე გამოჩნდება საიტზე:
                  </p>
                  <HeroMediaFrame
                    src={formData.mediaUrl}
                    type={formData.type === "image" ? "image" : "video"}
                    alt={formData.title || "Preview"}
                    autoPlay={formData.type === "video"}
                    controls={formData.type === "video"}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">
                პრიორიტეტი
              </label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                placeholder="0"
              />
              <p className="text-slate-500 text-sm mt-2">
                მაღალი პრიორიტეტი = უფრო ადრე გამოჩნდება სლაიდერში
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-orange-500 focus:ring-orange-500"
              />
              <label htmlFor="isActive" className="text-slate-300 font-medium">
                სლაიდი აქტიურია (გამოჩნდება საიტზე)
              </label>
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-700">
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 px-6 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg disabled:opacity-50">
                {loading ? "იქმნება…" : "სლაიდის შექმნა"}
              </button>
              <Link
                href="/admin/hero"
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold rounded-lg transition-colors inline-flex items-center justify-center">
                გაუქმება
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
