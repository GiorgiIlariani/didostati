"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Truck, Package, Clock } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(249, 115, 22) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Orange Glow Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT - Text Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full">
              <Truck className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold text-orange-400">სწრაფი მიწოდება</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              <span className="block text-slate-100 mb-2">თქვენი სახლის</span>
              <span className="block bg-linear-to-r from-orange-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                სარემონტო
              </span>
              <span className="block text-slate-100">მასალების მაღაზია</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0">
              ხარისხიანი ინსტრუმენტები, მასალები და აღჭურვილობა — ყველაფერი ერთ ადგილზე, თქვენი შემდეგი პროექტისთვის.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                href="/products"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-bold text-lg rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 duration-300"
              >
                ყიდვა
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-lg rounded-lg border-2 border-slate-700 hover:border-orange-500/50 transition-all"
              >
                კატეგორიები
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-700">
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  1000+
                </div>
                <div className="text-sm text-slate-400">პროდუქტი</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  24სთ
                </div>
                <div className="text-sm text-slate-400">მიწოდება</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  500+
                </div>
                <div className="text-sm text-slate-400">კმაყოფილი კლიენტი</div>
              </div>
            </div>
          </div>

          {/* RIGHT - Image/Illustration */}
          <div className="relative lg:order-last order-first">
            <div className="relative">
              {/* Glow effect behind image */}
              <div className="absolute inset-0 bg-linear-to-r from-orange-500 to-yellow-500 rounded-2xl blur-2xl opacity-20 animate-pulse"></div>
              
              {/* Main Image */}
              <div className="relative bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-2xl">
                <Image
                  src="/assets/images/631621823_122122879629039514_6195940220482853538_n.png"
                  alt="Didostati - Home Improvement & Fast Delivery"
                  width={600}
                  height={600}
                  className="w-full h-auto rounded-lg"
                  priority
                />
              </div>

              {/* Floating Icons */}
              <div className="absolute -top-4 -right-4 bg-orange-500 text-white p-4 rounded-xl shadow-lg animate-bounce">
                <Package className="w-8 h-8" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-yellow-500 text-slate-900 p-4 rounded-xl shadow-lg" style={{ animation: 'bounce 2s infinite 0.5s' }}>
                <Clock className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
