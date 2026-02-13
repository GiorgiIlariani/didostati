"use client";

import Link from 'next/link';
import { Plus, Video, List, Package, MessageSquare } from 'lucide-react';
import { useState } from 'react';

const AdminNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Admin Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-linear-to-r from-orange-500 to-yellow-500 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-transform touch-manipulation min-w-[56px] min-h-[56px] flex items-center justify-center"
        title="Admin Menu"
      >
        <Plus className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-45' : ''}`} />
      </button>

      {/* Admin Menu */}
      {isOpen && (
        <div className="fixed bottom-24 md:bottom-24 right-4 md:right-6 z-50 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden w-[calc(100vw-2rem)] max-w-sm">
          <div className="p-4">
            <h3 className="text-slate-300 font-bold mb-3 text-sm uppercase tracking-wider">Admin Panel</h3>
            <div className="space-y-2">
              <Link
                href="/admin/products/add"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 bg-slate-900 hover:bg-slate-700 active:bg-slate-600 rounded-lg transition-colors text-slate-100 touch-manipulation min-h-[44px]"
              >
                <Plus className="w-5 h-5 text-orange-400" />
                <span className="font-medium">Add Product</span>
              </Link>
              <Link
                href="/admin/advertisements/add"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 bg-slate-900 hover:bg-slate-700 active:bg-slate-600 rounded-lg transition-colors text-slate-100 touch-manipulation min-h-[44px]"
              >
                <Video className="w-5 h-5 text-yellow-400" />
                <span className="font-medium">Add Advertisement</span>
              </Link>
              <Link
                href="/admin/advertisements"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 bg-slate-900 hover:bg-slate-700 active:bg-slate-600 rounded-lg transition-colors text-slate-100 touch-manipulation min-h-[44px]"
              >
                <List className="w-5 h-5 text-blue-400" />
                <span className="font-medium">Manage Ads</span>
              </Link>
              <Link
                href="/admin/orders"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 bg-slate-900 hover:bg-slate-700 active:bg-slate-600 rounded-lg transition-colors text-slate-100 touch-manipulation min-h-[44px]"
              >
                <Package className="w-5 h-5 text-emerald-400" />
                <span className="font-medium">Manage Orders</span>
              </Link>
              <Link
                href="/admin/support"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 bg-slate-900 hover:bg-slate-700 active:bg-slate-600 rounded-lg transition-colors text-slate-100 touch-manipulation min-h-[44px]"
              >
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <span className="font-medium">Support Requests</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default AdminNav;
