"use client";

import { useState } from "react";
import { ArrowLeft, Link2, Upload, ImageIcon, Video } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { advertisementAPI } from "@/lib/api";
import { FormSelect, type FormSelectOption } from "@/app/components/FormSelect";

const TYPE_OPTIONS: FormSelectOption[] = [
  { value: "video", label: "Video" },
  { value: "image", label: "Image" },
  { value: "banner", label: "Banner" },
];

const POSITION_OPTIONS: FormSelectOption[] = [
  { value: "center", label: "Center (between sections)" },
  { value: "hero", label: "Hero (top of page)" },
  { value: "sidebar-left", label: "Sidebar left" },
  { value: "sidebar-right", label: "Sidebar right" },
  { value: "footer", label: "Footer" },
];

type MediaSource = "url" | "upload";

export default function AddAdvertisementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaSource, setMediaSource] = useState<MediaSource>("url");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "video",
    mediaUrl: "",
    position: "center",
    link: "",
    linkText: "Learn More",
    isActive: true,
    priority: 0,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await advertisementAPI.uploadMedia(file);
      if (res.status === "success" && res.data?.url) {
        setFormData((prev) => ({ ...prev, mediaUrl: res.data.url }));
      }
    } catch (err: any) {
      alert("Upload failed: " + (err.message || "Unknown error"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mediaUrl.trim()) {
      alert("Please add a media URL or upload a file.");
      return;
    }
    setLoading(true);
    try {
      const response = await advertisementAPI.create(formData);
      if (response.status === "success") {
        alert("Advertisement created successfully!");
        router.push("/admin/advertisements");
      } else {
        alert("Error: " + (response as any).message);
      }
    } catch (error: any) {
      alert("Error creating advertisement: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/admin/advertisements"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Advertisements
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">
            <span className="bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Add Advertisement
            </span>
          </h1>
          <p className="text-slate-400 mt-2">
            Create a new advertisement banner or video
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-800 rounded-xl p-6 md:p-8 border border-slate-700"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-slate-300 font-semibold mb-2">
                Advertisement Title <span className="text-orange-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                placeholder="e.g., Summer Sale 2026"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                placeholder="Brief description (max 500 characters)"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormSelect
                label="Type"
                value={formData.type}
                options={TYPE_OPTIONS}
                onChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
                required
              />
              <FormSelect
                label="Position"
                value={formData.position}
                options={POSITION_OPTIONS}
                onChange={(value) =>
                  setFormData({ ...formData, position: value })
                }
                required
              />
            </div>

            {/* Media: URL or Upload */}
            <div>
              <label className="block text-slate-300 font-semibold mb-2">
                {formData.type === "video"
                  ? "Video"
                  : "Image"}{" "}
                <span className="text-orange-400">*</span>
              </label>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setMediaSource("url")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                    mediaSource === "url"
                      ? "bg-orange-500/20 border-orange-500 text-orange-400"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <Link2 className="w-4 h-4" />
                  Use URL
                </button>
                <button
                  type="button"
                  onClick={() => setMediaSource("upload")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                    mediaSource === "upload"
                      ? "bg-orange-500/20 border-orange-500 text-orange-400"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload file
                </button>
              </div>

              {mediaSource === "url" ? (
                <div>
                  <input
                    type="url"
                    value={formData.mediaUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, mediaUrl: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                    placeholder={
                      formData.type === "video"
                        ? "https://example.com/video.mp4"
                        : "https://images.unsplash.com/photo-..."
                    }
                  />
                  <p className="text-slate-500 text-sm mt-2">
                    {formData.type === "video"
                      ? "Direct link to video (.mp4, .webm)"
                      : "Direct link to image"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="flex flex-col items-center justify-center gap-2 w-full px-4 py-8 bg-slate-900 border border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-orange-500/50 transition-colors">
                    <span className="text-slate-400">
                      {formData.type === "video" ? (
                        <Video className="w-10 h-10" />
                      ) : (
                        <ImageIcon className="w-10 h-10" />
                      )}
                    </span>
                    <span className="text-slate-300 text-sm font-medium">
                      {uploading
                        ? "Uploading…"
                        : "Click to choose image or video"}
                    </span>
                    <span className="text-slate-500 text-xs">
                      JPEG, PNG, GIF, WebP or MP4, WebM (max 50MB)
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
                    <p className="text-slate-400 text-sm truncate">
                      Current: {formData.mediaUrl}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  Call-to-action link
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  placeholder="https://example.com/promotion"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  Button text
                </label>
                <input
                  type="text"
                  value={formData.linkText}
                  onChange={(e) =>
                    setFormData({ ...formData, linkText: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  placeholder="Learn More"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">
                Priority
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
                Higher priority ads are shown first (0 = lowest)
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
              <label
                htmlFor="isActive"
                className="text-slate-300 font-medium"
              >
                Advertisement is active
              </label>
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-700">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? "Creating…" : "Create Advertisement"}
              </button>
              <Link
                href="/admin/advertisements"
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold rounded-lg transition-colors inline-flex items-center justify-center"
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
