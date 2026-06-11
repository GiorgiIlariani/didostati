"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Video,
  Image as ImageIcon,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { advertisementAPI } from "@/lib/api";
import { useAuth } from "@/lib/context/AuthContext";
import { isAllowedAdmin } from "@/lib/admin";
import HeroMediaFrame from "@/app/components/HeroMediaFrame";

interface HeroSlide {
  _id: string;
  title: string;
  description?: string;
  type: "video" | "image" | "banner";
  mediaUrl: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
}

export default function AdminHeroPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent("/admin/hero")}`);
      return;
    }
    if (!isAllowedAdmin(user)) {
      router.replace("/");
      return;
    }
  }, [user, authLoading, router]);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const data = await advertisementAPI.getAdminAll("hero");
      if (data.status === "success") {
        setSlides(data.data.advertisements);
      }
    } catch (error) {
      console.error("Failed to load hero slides:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !isAllowedAdmin(user)) return;
    fetchSlides();
  }, [user, authLoading]);

  const toggleActive = async (slide: HeroSlide) => {
    setTogglingId(slide._id);
    try {
      await advertisementAPI.update(slide._id, {
        isActive: !slide.isActive,
      });
      setSlides((prev) =>
        prev.map((s) =>
          s._id === slide._id ? { ...s, isActive: !s.isActive } : s
        )
      );
    } catch (err: unknown) {
      alert(
        err instanceof Error ? err.message : "სტატუსის განახლება ვერ მოხერხდა"
      );
    } finally {
      setTogglingId(null);
    }
  };

  const deleteSlide = async (slide: HeroSlide) => {
    if (
      !confirm(`ნამდვილად გსურთ "${slide.title}" სლაიდის წაშლა?`)
    ) {
      return;
    }
    setDeletingId(slide._id);
    try {
      await advertisementAPI.delete(slide._id);
      setSlides((prev) => prev.filter((s) => s._id !== slide._id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "წაშლა ვერ მოხერხდა");
    } finally {
      setDeletingId(null);
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
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              მთავარი გვერდი
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100">
              Hero სლაიდები
            </h1>
            <p className="text-slate-400 mt-1">
              მართე მთავარი გვერდის ვიდეო/ანიმაციები. სულ: {slides.length}
            </p>
          </div>
          <Link
            href="/admin/hero/add"
            className="inline-flex items-center gap-2 px-4 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all">
            <Plus className="w-5 h-5" />
            ახალი სლაიდი
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          </div>
        ) : slides.length === 0 ? (
          <div className="text-center py-16 bg-slate-800 rounded-xl border border-slate-700">
            <Video className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              სლაიდები არ არის
            </h3>
            <p className="text-slate-400 mb-6">
              დაამატე პროდუქტის ანიმაცია ან ვიდეო. თუ სლაიდი არ არის, ნაგულისხმევი
              ანიმაცია გამოჩნდება.
            </p>
            <Link
              href="/admin/hero/add"
              className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all">
              <Plus className="w-5 h-5" />
              პირველი სლაიდის დამატება
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {slides.map((slide) => (
              <div
                key={slide._id}
                className="bg-slate-800 rounded-xl border border-slate-700 p-4 md:p-6 hover:border-orange-500/30 transition-colors">
                <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                  <div className="shrink-0 w-full sm:w-56">
                    <HeroMediaFrame
                      src={slide.mediaUrl}
                      type={slide.type === "image" ? "image" : "video"}
                      alt={slide.title}
                      autoPlay={slide.type === "video"}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-slate-100">
                          {slide.title}
                        </h3>
                        {slide.description && (
                          <p className="text-slate-400 text-sm mt-1">
                            {slide.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => toggleActive(slide)}
                          disabled={togglingId === slide._id}
                          className={`p-2 rounded-lg transition-colors ${
                            slide.isActive
                              ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                              : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                          }`}
                          title={slide.isActive ? "აქტიური" : "არააქტიური"}>
                          {togglingId === slide._id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : slide.isActive ? (
                            <Eye className="w-5 h-5" />
                          ) : (
                            <EyeOff className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteSlide(slide)}
                          disabled={deletingId === slide._id}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                          title="წაშლა">
                          {deletingId === slide._id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 rounded-full text-xs text-slate-300">
                        {slide.type === "video" ? (
                          <Video className="w-3 h-3" />
                        ) : (
                          <ImageIcon className="w-3 h-3" />
                        )}
                        {slide.type === "video" ? "ვიდეო" : "სურათი"}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          slide.isActive
                            ? "bg-green-500/20 text-green-400"
                            : "bg-slate-700 text-slate-400"
                        }`}>
                        {slide.isActive ? "აქტიური" : "არააქტიური"}
                      </span>
                      <span className="px-3 py-1 bg-slate-900 text-slate-400 rounded-full text-xs">
                        პრიორიტეტი: {slide.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
