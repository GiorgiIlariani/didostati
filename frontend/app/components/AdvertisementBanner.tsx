"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, ExternalLink } from 'lucide-react';

interface Advertisement {
  _id: string;
  title: string;
  description?: string;
  type: 'video' | 'image' | 'banner';
  mediaUrl: string;
  position: string;
  link?: string;
  linkText?: string;
}

interface AdvertisementBannerProps {
  position: 'hero' | 'sidebar-left' | 'sidebar-right' | 'center' | 'footer';
}

const AdvertisementBanner = ({ position }: AdvertisementBannerProps) => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function fetchAds() {
      try {
        const response = await fetch(`http://localhost:5001/api/advertisements?position=${position}`);
        const data = await response.json();
        if (data.status === 'success') {
          setAds(data.data.advertisements);
        }
      } catch (error) {
        console.error('Failed to load advertisements:', error);
      }
    }

    fetchAds();
  }, [position]);

  // Rotate ads every 10 seconds
  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [ads.length]);

  if (ads.length === 0 || dismissed) return null;

  const currentAd = ads[currentAdIndex];

  // Different layouts based on position
  if (position === 'center') {
    return (
      <section className="py-8 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="relative bg-gradient-to-r from-orange-950/30 to-yellow-950/20 rounded-2xl overflow-hidden border border-orange-500/20">
            {/* Close button */}
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-900/80 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid md:grid-cols-2 gap-8 items-center p-8 md:p-12">
              {/* Content */}
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  {currentAd.title}
                </h3>
                {currentAd.description && (
                  <p className="text-slate-300 mb-6 text-lg">
                    {currentAd.description}
                  </p>
                )}
                {currentAd.link && (
                  <Link
                    href={currentAd.link}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg"
                  >
                    {currentAd.linkText || 'Learn More'}
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {/* Media */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-800">
                {currentAd.type === 'video' ? (
                  <video
                    src={currentAd.mediaUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    onError={(e) => console.error('Video load error:', e)}
                    onLoadedData={() => console.log('Video loaded successfully')}
                  >
                    <source src={currentAd.mediaUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={currentAd.mediaUrl}
                    alt={currentAd.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>

            {/* Ad indicators */}
            {ads.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {ads.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentAdIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentAdIndex
                        ? 'bg-orange-500 w-6'
                        : 'bg-slate-600 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Sidebar layouts (left/right)
  if (position === 'sidebar-left' || position === 'sidebar-right') {
    return (
      <div className="sticky top-24 bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 z-10 p-1 bg-slate-900/80 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-3 h-3" />
        </button>

        <div className="p-4">
          <h4 className="text-sm font-bold text-orange-400 mb-2">{currentAd.title}</h4>
          
          <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 mb-3">
            {currentAd.type === 'video' ? (
              <video
                src={currentAd.mediaUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
                onError={(e) => console.error('Video load error:', e)}
              >
                <source src={currentAd.mediaUrl} type="video/mp4" />
              </video>
            ) : (
              <img
                src={currentAd.mediaUrl}
                alt={currentAd.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {currentAd.description && (
            <p className="text-slate-400 text-xs mb-3">{currentAd.description}</p>
          )}

          {currentAd.link && (
            <Link
              href={currentAd.link}
              className="block w-full text-center px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded transition-colors"
            >
              {currentAd.linkText || 'Learn More'}
            </Link>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default AdvertisementBanner;
