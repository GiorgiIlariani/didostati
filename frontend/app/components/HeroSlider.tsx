"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Package, Clock } from "lucide-react";
import { advertisementAPI } from "@/lib/api";

interface HeroSlide {
  _id: string;
  title: string;
  type: "video" | "image" | "banner";
  mediaUrl: string;
  link?: string;
}

const DEFAULT_IMAGE = "/assets/images/hero-default.png";

function slideHref(link?: string): string | null {
  if (!link?.trim()) return null;
  return link.trim();
}

const HeroSlider = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const touchMoved = useRef(false);

  useEffect(() => {
    async function fetchSlides() {
      try {
        const data = await advertisementAPI.getAll("hero");
        if (data.status === "success" && data.data.advertisements.length > 0) {
          setSlides(data.data.advertisements);
        }
      } catch (error) {
        console.error("Failed to load hero slides:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSlides();
  }, []);

  const hasMultiple = slides.length > 1;

  const goTo = (index: number) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
  };
  const goPrev = () =>
    goTo((currentIndex - 1 + slides.length) % slides.length);
  const goNext = () => goTo((currentIndex + 1) % slides.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchMoved.current = false;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !hasMultiple) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      touchMoved.current = true;
      if (diff > 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  useEffect(() => {
    if (!hasMultiple) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [hasMultiple, slides.length]);

  const isDefault = !loading && slides.length === 0;

  if (loading) {
    return (
      <div className="relative">
        <div className="aspect-video w-full animate-pulse rounded-xl bg-slate-800 sm:aspect-[16/10] lg:aspect-video" />
      </div>
    );
  }

  if (isDefault) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-linear-to-r from-orange-500 to-yellow-500 rounded-2xl blur-2xl opacity-20 animate-pulse max-sm:scale-90" />

        <div className="relative bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-4 sm:p-8 border border-slate-700 shadow-2xl">
          <img
            src={DEFAULT_IMAGE}
            alt="Didostati"
            className="w-full h-auto rounded-lg"
          />
        </div>

        <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 bg-orange-500 text-white p-2 md:p-4 rounded-lg md:rounded-xl shadow-lg animate-bounce hidden sm:block">
          <Package className="w-5 h-5 md:w-8 md:h-8" />
        </div>

        <div
          className="absolute -bottom-2 -left-2 md:-bottom-4 md:-left-4 bg-yellow-500 text-slate-900 p-2 md:p-4 rounded-lg md:rounded-xl shadow-lg hidden sm:block"
          style={{ animation: "bounce 2s infinite 0.5s" }}>
          <Clock className="w-5 h-5 md:w-8 md:h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative rounded-xl border border-slate-700/80 p-1 sm:rounded-2xl sm:p-1.5">
        <div className="overflow-hidden rounded-lg sm:rounded-xl">
          <div className="relative">
            {slides.map((slide, index) => {
              const href = slideHref(slide.link);
              const media =
                slide.type === "image" ? (
                  <img
                    src={slide.mediaUrl}
                    alt={slide.title}
                    className="block w-full h-auto"
                  />
                ) : (
                  <video
                    src={slide.mediaUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="block w-full h-auto"
                    aria-label={slide.title}
                  />
                );

              return (
                <div
                  key={slide._id}
                  className={`transition-opacity duration-500 ease-in-out ${
                    index === currentIndex
                      ? "opacity-100 relative"
                      : "opacity-0 absolute inset-0 pointer-events-none"
                  }`}
                  aria-hidden={index !== currentIndex}>
                  {href ? (
                    href.startsWith("http://") || href.startsWith("https://") ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block cursor-pointer"
                        onClick={(e) => {
                          if (touchMoved.current) e.preventDefault();
                        }}
                        aria-label={slide.title}>
                        {media}
                      </a>
                    ) : (
                      <Link
                        href={href}
                        className="block cursor-pointer"
                        onClick={(e) => {
                          if (touchMoved.current) e.preventDefault();
                        }}
                        aria-label={slide.title}>
                        {media}
                      </Link>
                    )
                  ) : (
                    media
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {hasMultiple && (
        <div className="mt-2.5 flex justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide._id}
              onClick={() => goTo(index)}
              className="flex items-center justify-center p-1 touch-manipulation"
              aria-label={`სლაიდი ${index + 1}: ${slide.title}`}>
              <span
                className={`block rounded-full transition-all ${
                  index === currentIndex
                    ? "h-2.5 w-8 bg-orange-500"
                    : "h-2.5 w-2.5 bg-slate-500 hover:bg-slate-400"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
