"use client";

import { useState } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddAdvertisementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'video',
    mediaUrl: '',
    position: 'center',
    link: '',
    linkText: 'Learn More',
    isActive: true,
    priority: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/advertisements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        alert('Advertisement created successfully!');
        router.push('/');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error: any) {
      alert('Error creating advertisement: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">
            <span className="bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Add Advertisement
            </span>
          </h1>
          <p className="text-slate-400 mt-2">Create a new advertisement banner or video</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-6 md:p-8 border border-slate-700">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-slate-300 font-semibold mb-2">Advertisement Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                placeholder="e.g., Summer Sale 2026"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-300 font-semibold mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                placeholder="Brief description (max 500 characters)"
              />
            </div>

            {/* Type & Position */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-2">Type *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                >
                  <option value="video">Video</option>
                  <option value="image">Image</option>
                  <option value="banner">Banner</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-2">Position *</label>
                <select
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                >
                  <option value="center">Center (Between sections)</option>
                  <option value="hero">Hero (Top of page)</option>
                  <option value="sidebar-left">Sidebar Left</option>
                  <option value="sidebar-right">Sidebar Right</option>
                  <option value="footer">Footer</option>
                </select>
              </div>
            </div>

            {/* Media URL */}
            <div>
              <label className="block text-slate-300 font-semibold mb-2">
                {formData.type === 'video' ? 'Video URL *' : 'Image URL *'}
              </label>
              <input
                type="url"
                required
                value={formData.mediaUrl}
                onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                placeholder={formData.type === 'video' 
                  ? "https://example.com/video.mp4" 
                  : "https://images.unsplash.com/photo-..."}
              />
              <p className="text-slate-500 text-sm mt-2">
                {formData.type === 'video' 
                  ? 'Provide a direct link to the video file (.mp4, .webm)'
                  : 'Provide a direct link to the image file'}
              </p>
            </div>

            {/* Link & Link Text */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-2">Call-to-Action Link</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  placeholder="https://example.com/promotion"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-2">Button Text</label>
                <input
                  type="text"
                  value={formData.linkText}
                  onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  placeholder="Learn More"
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-slate-300 font-semibold mb-2">Priority</label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                placeholder="0"
              />
              <p className="text-slate-500 text-sm mt-2">Higher priority ads are shown first (0 = lowest)</p>
            </div>

            {/* Active Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-orange-500 focus:ring-orange-500"
              />
              <label htmlFor="isActive" className="text-slate-300 font-medium">Advertisement is active</label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t border-slate-700">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Advertisement'}
              </button>
              <Link
                href="/"
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold rounded-lg transition-colors"
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
