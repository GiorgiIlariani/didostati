"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/context/AuthContext';
import { orderAPI } from '@/lib/api';
import { ArrowLeft, Package, Calendar, MapPin, Phone, Mail, CreditCard, Loader2, CheckCircle } from 'lucide-react';

interface OrderItem {
  product?: {
    _id: string;
    name: string;
    images?: Array<{ url: string }>;
    brand?: string;
  };
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  deliveryFee: number;
  items: OrderItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street?: string;
    city: string;
    region?: string;
    postalCode?: string;
    country: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
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

const paymentMethodLabels: Record<string, string> = {
  cash: 'ნაღდი ფული',
  card: 'ბანკის ბარათი',
  bank_transfer: 'ბანკის გადარიცხვა'
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/login?redirect=/orders/${params.id}`);
      return;
    }

    async function fetchOrder() {
      try {
        setLoading(true);
        const response = await orderAPI.getById(params.id as string);
        if (response.status === 'success') {
          setOrder(response.data.order);
        }
      } catch (err: any) {
        setError(err.message || 'შეკვეთის ჩატვირთვა ვერ მოხერხდა');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [params.id, user, authLoading, router]);

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

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-300 mb-2">
            შეკვეთა ვერ მოიძებნა
          </h2>
          <p className="text-slate-400 mb-6">{error || 'ასეთი შეკვეთა არ არსებობს'}</p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            შეკვეთების სია
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          უკან შეკვეთებზე
        </Link>

        {/* Order Header */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">
                შეკვეთა #{order.orderNumber}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(order.createdAt).toLocaleDateString('ka-GE', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[order.status] || statusColors.pending}`}>
                  {statusLabels[order.status] || order.status}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                ₾{order.totalAmount.toFixed(2)}
              </div>
              <div className="text-sm text-slate-400 mt-1">
                {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="md:col-span-2">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">შეკვეთის პროდუქტები</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-4 bg-slate-900 rounded-lg border border-slate-700"
                  >
                    {item.product?.images?.[0]?.url && (
                      <Link
                        href={`/products/${item.product._id}`}
                        className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0"
                      >
                        <Image
                          src={item.product.images[0].url}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </Link>
                    )}
                    <div className="flex-1">
                      <Link
                        href={item.product ? `/products/${item.product._id}` : '#'}
                        className="font-semibold text-slate-100 hover:text-orange-400 transition-colors"
                      >
                        {item.name}
                      </Link>
                      {item.product?.brand && (
                        <p className="text-xs text-orange-400 mt-1">{item.product.brand}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-slate-400">
                          რაოდენობა: {item.quantity}
                        </span>
                        <span className="font-semibold text-slate-100">
                          ₾{item.subtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-slate-700 space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>შუამდეგი</span>
                  <span>₾{(order.totalAmount - order.deliveryFee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>მიწოდების საფასური</span>
                  <span>₾{order.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-100 pt-2 border-t border-slate-700">
                  <span>ჯამი</span>
                  <span className="bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                    ₾{order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Info Sidebar */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-400" />
                მიწოდების მისამართი
              </h3>
              <div className="text-sm text-slate-300 space-y-1">
                {order.shippingAddress.street && (
                  <p>{order.shippingAddress.street}</p>
                )}
                <p>{order.shippingAddress.city}</p>
                {order.shippingAddress.region && (
                  <p>{order.shippingAddress.region}</p>
                )}
                {order.shippingAddress.postalCode && (
                  <p>საფოსტო კოდი: {order.shippingAddress.postalCode}</p>
                )}
                <p className="text-slate-400 mt-2">{order.shippingAddress.country}</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">კონტაქტის ინფორმაცია</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{order.customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{order.customer.phone}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-400" />
                გადახდის ინფორმაცია
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>მეთოდი:</span>
                  <span className="font-semibold">{paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>სტატუსი:</span>
                  <span className={`font-semibold ${
                    order.paymentStatus === 'paid' ? 'text-emerald-400' :
                    order.paymentStatus === 'failed' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {order.paymentStatus === 'paid' ? 'გადახდილია' :
                     order.paymentStatus === 'failed' ? 'შეცდომა' :
                     'მოლოდინში'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-100 mb-2">შენიშვნა</h3>
                <p className="text-sm text-slate-300">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
