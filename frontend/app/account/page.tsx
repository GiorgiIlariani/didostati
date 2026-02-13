"use client";

import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { Heart, Package, User } from "lucide-react";

export default function AccountPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="bg-slate-900 min-h-screen flex items-center justify-center">
        <p className="text-slate-300 text-sm">იტვირთება პროფილი...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-slate-900 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-8 text-center shadow-xl">
          <h1 className="text-2xl font-bold mb-3">ჩემი პროფილი</h1>
          <p className="text-slate-400 mb-6">
            პროფილის სანახავად და შეკვეთების შესანახად, გთხოვთ შეხვიდეთ სისტემაში.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login?redirect=/account"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold text-sm hover:from-orange-600 hover:to-yellow-600 transition-all shadow-md hover:shadow-lg"
            >
              შესვლა
            </Link>
            <Link
              href="/register"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-600 text-slate-200 font-semibold text-sm hover:border-orange-500 hover:text-orange-400 transition-all"
            >
              რეგისტრაცია
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          ჩემი პროფილი
        </h1>

        {/* Profile card */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 md:p-8 mb-8 shadow-xl">
          <div className="flex items-start gap-4 md:gap-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 border border-orange-500/40">
              <User className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-1">
                {user.name}
              </h2>
              <p className="text-slate-400 text-sm mb-1">
                {user.email}
              </p>
              {user.role && (
                <p className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-900/70 border border-slate-600 text-xs text-slate-300 mt-2">
                  როლი: <span className="ml-1 capitalize">{user.role}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <Link
            href="/wishlist"
            className="group bg-slate-800/80 border border-slate-700 rounded-2xl p-5 hover:border-orange-500/70 hover:shadow-lg hover:shadow-orange-500/10 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-pink-500/10 border border-pink-500/40">
                  <Heart className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-100">
                    რჩეული პროდუქტები
                  </p>
                  <p className="text-xs text-slate-400">
                    იხილეთ თქვენი Wishlist
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
              სწრაფი წვდომა თქვენს მიერ მონიშნულ პროდუქტებზე.
            </p>
          </Link>

          <Link
            href="/orders"
            className="group bg-slate-800/80 border border-slate-700 rounded-2xl p-5 hover:border-orange-500/70 hover:shadow-lg hover:shadow-orange-500/10 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-sky-500/10 border border-sky-500/40">
                  <Package className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-100">
                    შეკვეთების ისტორია
                  </p>
                  <p className="text-xs text-slate-400">
                    იხილეთ თქვენი შეკვეთები
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
              სწრაფი წვდომა თქვენს შეკვეთებზე, სტატუსებსა და დეტალებზე.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

