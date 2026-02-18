"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Plus, Video, Image as ImageIcon } from 'lucide-react';
import { advertisementAPI } from '@/lib/api';

interface Advertisement {
  _id: string;
  title: string;
  description?: string;
  type: 'video' | 'image' | 'banner';
  mediaUrl: string;
  position: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
}

export default function ManageAdvertisementsPage() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const data = await advertisementAPI.getAll();
      if (data.status === 'success') {
        setAds(data.data.advertisements);
      }
    } catch (error) {
      console.error('Failed to load advertisements:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAd = async (id: string) => {
    if (!confirm('Are you sure you want to delete this advertisement?')) {
      return;
    }

    try {
      const data = await advertisementAPI.delete(id);
      if (data.status === 'success') {
        alert('Advertisement deleted successfully!');
        fetchAds(); // Refresh list
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error: any) {
      alert('Error deleting advertisement: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                <span className="bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  Manage Advertisements
                </span>
              </h1>
              <p className="text-slate-400 mt-2">View and delete your advertisements</p>
            </div>
            <Link
              href="/admin/advertisements/add"
              className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add New
            </Link>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 mt-4">Loading advertisements...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && ads.length === 0 && (
          <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
            <Video className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No Advertisements</h3>
            <p className="text-slate-400 mb-6">Create your first advertisement to get started</p>
            <Link
              href="/admin/advertisements/add"
              className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Advertisement
            </Link>
          </div>
        )}

        {/* Ads List */}
        {!loading && ads.length > 0 && (
          <div className="grid gap-4">
            {ads.map((ad) => (
              <div
                key={ad._id}
                className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-orange-500/50 transition-colors"
              >
                <div className="flex gap-6">
                  {/* Preview */}
                  <div className="flex-shrink-0 w-48 h-32 rounded-lg overflow-hidden bg-slate-900">
                    {ad.type === 'video' ? (
                      <video
                        src={ad.mediaUrl}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <img
                        src={ad.mediaUrl}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-slate-100 mb-1">{ad.title}</h3>
                        {ad.description && (
                          <p className="text-slate-400 text-sm">{ad.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteAd(ad._id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 rounded-full text-xs text-slate-300">
                        {ad.type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                        {ad.type}
                      </span>
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium">
                        {ad.position}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ad.isActive 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {ad.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-3 py-1 bg-slate-900 text-slate-400 rounded-full text-xs">
                        Priority: {ad.priority}
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
