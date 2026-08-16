"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/context/AuthContext';
import { orderAPI } from '@/lib/api';
import { downloadOrderPdf } from '@/lib/orderPdf';
import { statusColors, statusLabels } from '@/lib/orderStatus';
import OrderStatusStepper from '@/app/components/OrderStatusStepper';
import {
  ArrowLeft,
  Package,
  Calendar,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Loader2,
  Download,
  Hash,
} from 'lucide-react';

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
  deliveryType?: string;
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

const paymentMethodLabels: Record<string, string> = {
  cash: 'ნაღდი ფული',
  card: 'ბანკის ბარათი',
  bank_transfer: 'ბანკის გადარიცხვა'
};

const deliveryTypeLabels: Record<string, string> = {
  standard: 'სტანდარტული მიწოდება',
  express: 'ექსპრეს მიწოდება',
  pickup: 'თვითგატანა',
};

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-5 sm:p-6">
      <h3 className="text-base font-semibold text-slate-100 mb-4 flex items-center gap-2.5">
        <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-500/15 border border-orange-500/30 shrink-0">
          <Icon className="w-4.5 h-4.5 text-orange-400" />
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleDownloadPdf = () => {
    if (!order) return;
    downloadOrderPdf({
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      customer: order.customer,
      shippingAddress: order.shippingAddress,
      items: order.items,
      deliveryFee: order.deliveryFee || 0,
      totalAmount: order.totalAmount,
      deliveryType: order.deliveryType,
      paymentMethod: order.paymentMethod,
      notes: order.notes,
    });
  };

  useEffect(() => {
    if (authLoading) return;
    /*
     * RESTORE_ORDER_DETAIL_REQUIRES_LOGIN:
     * if (!user) {
     *   router.replace(`/login?redirect=/orders/${params.id}`);
     *   return;
     * }
     */

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
  }, [params.id, authLoading, router]);
  // RESTORE_ORDER_DETAIL_REQUIRES_LOGIN: add `user` to effect deps when re-enabling redirect above.
  // After fetch, you may also restore:
  // if (!user) return null;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
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
            href={user ? "/orders" : "/products"}
            // RESTORE_ORDER_DETAIL_REQUIRES_LOGIN: always href="/orders" + label "შეკვეთების სია" when login is required
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {user ? "შეკვეთების სია" : "პროდუქტებზე"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 ds-fade-in">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
        <Link
          href={user ? "/orders" : "/products"}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {user ? "უკან შეკვეთებზე" : "უკან პროდუქტებზე"}
        </Link>

        {/* Order Header */}
        <div className="relative overflow-hidden bg-slate-800 rounded-2xl border border-slate-700 p-5 sm:p-7 mb-6 ds-scale-in">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-orange-500 to-yellow-500" />
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
            <div className="flex items-start gap-4">
              <span className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-orange-500/15 border border-orange-500/30 shrink-0">
                <Package className="w-6 h-6 sm:w-7 sm:h-7 text-orange-400" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  შეკვეთის ნომერი
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-100 mb-2 tabular-nums">
                  {order.orderNumber}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                  <div className="flex items-center gap-1.5">
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
            </div>
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pl-16 sm:pl-0">
              <div className="text-left sm:text-right">
                <div className="text-3xl font-bold bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent tabular-nums">
                  ₾{order.totalAmount.toFixed(2)}
                </div>
                <div className="text-sm text-slate-400 mt-1">
                  {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="ds-btn-primary inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 text-sm font-semibold hover:bg-slate-700 min-h-[44px] shrink-0"
              >
                <Download className="w-4 h-4" />
                PDF / ბეჭდვა
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700/80">
            <OrderStatusStepper status={order.status} />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="md:col-span-2">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-100 mb-4">შეკვეთის პროდუქტები</h2>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-4 bg-slate-900 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
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
                    <div className="flex-1 min-w-0">
                      <Link
                        href={item.product ? `/products/${item.product._id}` : '#'}
                        className="font-semibold text-slate-100 hover:text-orange-400 transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      {item.product?.brand && (
                        <p className="text-xs text-orange-400 mt-1">{item.product.brand}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-slate-400 tabular-nums">
                          ₾{item.price.toFixed(2)} × {item.quantity}
                        </span>
                        <span className="font-semibold text-slate-100 tabular-nums">
                          ₾{item.subtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-slate-700 space-y-2">
                <div className="flex justify-between text-slate-300 text-sm">
                  <span>ქვეჯამი</span>
                  <span className="tabular-nums">₾{(order.totalAmount - order.deliveryFee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300 text-sm">
                  <span>
                    მიწოდების საფასური
                    {order.deliveryType && (
                      <span className="text-slate-500"> ({deliveryTypeLabels[order.deliveryType] || order.deliveryType})</span>
                    )}
                  </span>
                  <span className="tabular-nums">₾{order.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-100 pt-3 border-t border-slate-700">
                  <span>ჯამი</span>
                  <span className="bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent tabular-nums">
                    ₾{order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Info Sidebar */}
          <div className="space-y-5">
            <InfoCard icon={MapPin} title="მიწოდების მისამართი">
              <div className="text-sm text-slate-300 space-y-1">
                {order.shippingAddress.street && (
                  <p>{order.shippingAddress.street}</p>
                )}
                <p className="font-medium text-slate-100">{order.shippingAddress.city}</p>
                {order.shippingAddress.region && (
                  <p>{order.shippingAddress.region}</p>
                )}
                {order.shippingAddress.postalCode && (
                  <p>საფოსტო კოდი: {order.shippingAddress.postalCode}</p>
                )}
                <p className="text-slate-500 mt-2">{order.shippingAddress.country}</p>
              </div>
            </InfoCard>

            <InfoCard icon={Phone} title="კონტაქტის ინფორმაცია">
              <div className="space-y-2.5 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="truncate">{order.customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="tabular-nums">{order.customer.phone}</span>
                </div>
              </div>
            </InfoCard>

            <InfoCard icon={CreditCard} title="გადახდის ინფორმაცია">
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
            </InfoCard>

            {/* Notes */}
            {order.notes && (
              <InfoCard icon={Package} title="შენიშვნა">
                <p className="text-sm text-slate-300">{order.notes}</p>
              </InfoCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
