"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { orderAPI } from '@/lib/api';
import { Package, ArrowLeft, Loader2, Calendar, MapPin } from 'lucide-react';

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  deliveryFee: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  shippingAddress: {
    city: string;
    street?: string;
  };
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  pending: 'მოლოდინში',
  confirmed: 'დადასტურებული',
  processing: 'მომზადებაში',
  shipped: 'გაგზავნილია',
  delivered: 'მიწოდებულია',
  cancelled: 'გაუქმებული'
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  processing: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  shipped: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50',
  delivered: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/50'
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login?redirect=/orders');
      return;
    }

    async function fetchOrders() {
      try {
        setLoading(true);
        const response = await orderAPI.getAll();
        if (response.status === 'success') {
          setOrders(response.data.orders);
        }
      } catch (err: any) {
        setError(err.message || 'შეკვეთების ჩატვირთვა ვერ მოხერხდა');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          უკან პროფილში
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <span className="bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
            შეკვეთების ისტორია
          </span>
        </h1>
        <p className="text-slate-400 mb-8">თქვენი ყველა შეკვეთა ერთ ადგილზე</p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-300 mb-2">
              შეკვეთები ჯერ არ გაქვთ
            </h2>
            <p className="text-slate-400 mb-6">
              დაიწყეთ შოპინგი და შექმენით თქვენი პირველი შეკვეთა
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all"
            >
              პროდუქტების ნახვა
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order._id}
                href={`/orders/${order._id}`}
                className="block bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-orange-500/50 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-100">
                        შეკვეთა #{order.orderNumber}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[order.status] || statusColors.pending}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(order.createdAt).toLocaleDateString('ka-GE')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span>{order.items.length} პროდუქტი</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{order.shippingAddress.city}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                      ₾{order.totalAmount.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      მიწოდება: ₾{order.deliveryFee.toFixed(2)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
