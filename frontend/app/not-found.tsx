import Link from "next/link";
import { Package, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 border border-slate-700">
          <Package className="w-10 h-10 text-slate-400" />
        </div>
        <h1 className="text-6xl font-bold text-slate-100 mb-2">404</h1>
        <p className="text-xl font-semibold text-slate-300 mb-2">
          გვერდი ვერ მოიძებნა
        </p>
        <p className="text-slate-400 mb-8">
          სამწუხაროდ, მოთხოვნილი გვერდი არ არსებობს ან გადატანილია.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all"
          >
            <Home className="w-5 h-5" />
            მთავარი გვერდი
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-700 bg-slate-800 text-slate-100 font-semibold rounded-lg hover:bg-slate-700 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            პროდუქტები
          </Link>
        </div>
      </div>
    </div>
  );
}
