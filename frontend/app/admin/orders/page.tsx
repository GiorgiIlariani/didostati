"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { adminOrderAPI } from '@/lib/api';
import { ArrowLeft, Package, Calendar, MapPin, Phone, Mail, Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  user?: {
    _id: string;
    name: string;
    email: string;
  };
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

const paymentStatusColors: Record<string, string> = {
  pending: 'text-yellow-400',
  paid: 'text-emerald-400',
  failed: 'text-red-400'
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') {
      router.replace('/');
      return;
    }
    fetchOrders();
  }, [user, authLoading, statusFilter, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminOrderAPI.getAll({ 
        status: statusFilter || undefined,
        limit: 50 
      });
      if (response.status === 'success') {
        setOrders(response.data.orders);
      }
    } catch (err: any) {
      setError(err.message || 'შეკვეთების ჩატვირთვა ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    if (!confirm(`ნამდვილად გსურთ შეკვეთის სტატუსის შეცვლა "${statusLabels[newStatus]}"-ზე?`)) {
      return;
    }

    try {
      setUpdatingOrderId(orderId);
      const response = await adminOrderAPI.updateStatus(orderId, newStatus);
      if (response.status === 'success') {
        setOrders(orders.map(order => 
          order._id === orderId ? response.data.order : order
        ));
      }
    } catch (err: any) {
      alert(err.message || 'სტატუსის განახლება ვერ მოხერხდა');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handlePaymentStatusUpdate = async (orderId: string, newPaymentStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      const response = await adminOrderAPI.updateStatus(orderId, undefined, newPaymentStatus);
      if (response.status === 'success') {
        setOrders(orders.map(order => 
          order._id === orderId ? response.data.order : order
        ));
      }
    } catch (err: any) {
      alert(err.message || 'გადახდის სტატუსის განახლება ვერ მოხერხდა');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          მთავარი
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                შეკვეთების მართვა
              </span>
            </h1>
            <p className="text-slate-400">ყველა შეკვეთის სრული კონტროლი</p>
          </div>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            განახლება
          </button>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 outline-none"
          >
            <option value="">ყველა სტატუსი</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-300 mb-2">
              შეკვეთები არ მოიძებნა
            </h2>
            <p className="text-slate-400">
              {statusFilter ? 'ამ სტატუსის შეკვეთები არ არსებობს' : 'ჯერ არ არის შეკვეთები'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-orange-500/50 transition-all"
              >
                <div className="grid md:grid-cols-4 gap-6">
                  {/* Order Info */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-slate-100">
                        #{order.orderNumber}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[order.status] || statusColors.pending}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-slate-400 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(order.createdAt).toLocaleDateString('ka-GE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>{order.items.length} პროდუქტი</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{order.shippingAddress.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{order.customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{order.customer.phone}</span>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="text-xs text-slate-500">
                      {order.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="truncate">
                          {item.name} x{item.quantity}
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="text-slate-600">+{order.items.length - 2} მეტი...</div>
                      )}
                    </div>
                  </div>

                  {/* Status Controls */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">შეკვეთის სტატუსი</label>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        disabled={updatingOrderId === order._id}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm focus:border-orange-500 outline-none disabled:opacity-50"
                      >
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">გადახდის სტატუსი</label>
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => handlePaymentStatusUpdate(order._id, e.target.value)}
                        disabled={updatingOrderId === order._id}
                        className={`w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:border-orange-500 outline-none disabled:opacity-50 ${
                          paymentStatusColors[order.paymentStatus] || 'text-slate-100'
                        }`}
                      >
                        <option value="pending">მოლოდინში</option>
                        <option value="paid">გადახდილია</option>
                        <option value="failed">შეცდომა</option>
                      </select>
                    </div>
                  </div>

                  {/* Total & Actions */}
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent mb-2">
                      ₾{order.totalAmount.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-400 mb-4">
                      მიწოდება: ₾{order.deliveryFee.toFixed(2)}
                    </div>
                    <Link
                      href={`/orders/${order._id}`}
                      className="inline-block px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 text-sm font-medium rounded-lg transition-colors"
                    >
                      დეტალები
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
