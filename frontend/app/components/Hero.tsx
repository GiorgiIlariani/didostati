"use client";

import Link from "next/link";
import { ArrowRight, Truck } from "lucide-react";
import HeroSlider from "./HeroSlider";

const Hero = () => {
  return (
    <section className="relative bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgb(249, 115, 22) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}></div>
      </div>

      {/* Orange Glow Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-5 pb-0 sm:py-10 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-3 sm:gap-8 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="order-2 space-y-5 sm:space-y-6 text-center lg:order-1 lg:text-left">
            <div className="hidden lg:inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full">
              <Truck className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold text-orange-400">
                სწრაფი მიწოდება
              </span>
            </div>

            <h1 className="text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-[1.2]">
              <span className="block text-slate-100">
                პლატფორმა რომელიც რემონტის სირთულეს
              </span>
              <span className="block bg-linear-to-r from-orange-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                მარტივ და ორგანიზებულ
              </span>
              <span className="block text-slate-100">პროცესად აქცევს</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 leading-snug max-w-2xl mx-auto lg:mx-0">
              ყველაზე მარტივი რემონტი
            </p>

            <div className="flex flex-row gap-2 sm:gap-4 justify-center lg:justify-start">
              <Link
                href="/products"
                className="group inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:px-8 sm:py-4 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-bold text-sm sm:text-lg rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 duration-300">
                ყიდვა
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/categories"
                className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:px-8 sm:py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-sm sm:text-lg rounded-lg border-2 border-slate-700 hover:border-orange-500/50 transition-all">
                კატეგორიები
              </Link>
            </div>

            <div className="hidden lg:grid grid-cols-3 gap-4 pt-8 border-t border-slate-700">
              <div className="text-left">
                <div className="text-2xl md:text-3xl font-bold bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  1000+
                </div>
                <div className="text-sm text-slate-400">პროდუქტი</div>
              </div>
              <div className="text-left">
                <div className="text-2xl md:text-3xl font-bold bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  24სთ
                </div>
                <div className="text-sm text-slate-400">მიწოდება</div>
              </div>
              <div className="text-left">
                <div className="text-2xl md:text-3xl font-bold bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  500+
                </div>
                <div className="text-sm text-slate-400">კმაყოფილი კლიენტი</div>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="relative order-1 w-full lg:order-2">
            <HeroSlider />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
