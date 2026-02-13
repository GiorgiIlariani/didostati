"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { adminSupportAPI } from '@/lib/api';
import { ArrowLeft, MessageSquare, Calendar, Phone, Mail, Loader2, RefreshCw, Package, User, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Product {
  _id: string;
  name: string;
  images?: Array<{ url: string }>;
  brand?: string;
}

interface SupportRequest {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  product?: Product;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'new' | 'in_progress' | 'resolved';
  adminResponse?: string;
  respondedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const statusLabels: Record<string, string> = {
  new: 'ახალი',
  in_progress: 'მუშავდება',
  resolved: 'დასრულებული'
};

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  resolved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
};

export default function AdminSupportPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<Record<string, string>>({});

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') {
      router.replace('/');
      return;
    }
    fetchRequests();
  }, [user, authLoading, statusFilter, router]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminSupportAPI.getAll({ 
        status: statusFilter || undefined,
        limit: 100 
      });
      if (response.status === 'success') {
        setRequests(response.data.supportRequests);
      }
    } catch (err: any) {
      setError(err.message || 'კონსულტაციების ჩატვირთვა ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      setUpdatingRequestId(requestId);
      const response = await adminSupportAPI.update(requestId, { status: newStatus });
      if (response.status === 'success') {
        setRequests(requests.map(req => 
          req._id === requestId ? response.data.supportRequest : req
        ));
      }
    } catch (err: any) {
      alert(err.message || 'სტატუსის განახლება ვერ მოხერხდა');
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const handleResponseSubmit = async (requestId: string) => {
    const response = responseText[requestId]?.trim();
    if (!response) {
      alert('გთხოვთ შეიყვანოთ პასუხი');
      return;
    }

    try {
      setUpdatingRequestId(requestId);
      const updateResponse = await adminSupportAPI.update(requestId, { 
        adminResponse: response,
        status: 'resolved'
      });
      if (updateResponse.status === 'success') {
        setRequests(requests.map(req => 
          req._id === requestId ? updateResponse.data.supportRequest : req
        ));
        setResponseText({ ...responseText, [requestId]: '' });
        setExpandedRequestId(null);
      }
    } catch (err: any) {
      alert(err.message || 'პასუხის გაგზავნა ვერ მოხერხდა');
    } finally {
      setUpdatingRequestId(null);
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
                კონსულტაციების მართვა
              </span>
            </h1>
            <p className="text-slate-400">ყველა კონსულტაციის მოთხოვნის სრული კონტროლი</p>
          </div>
          <button
            onClick={fetchRequests}
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

        {requests.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
            <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-300 mb-2">
              კონსულტაციები არ მოიძებნა
            </h2>
            <p className="text-slate-400">
              {statusFilter ? 'ამ სტატუსის კონსულტაციები არ არსებობს' : 'ჯერ არ არის კონსულტაციის მოთხოვნები'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request._id}
                className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-orange-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-100">
                        {request.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[request.status] || statusColors.new}`}>
                        {statusLabels[request.status] || request.status}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{request.phone}</span>
                      </div>
                      {request.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{request.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(request.createdAt).toLocaleDateString('ka-GE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                      {request.product && (
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span className="text-orange-400">{request.product.name}</span>
                        </div>
                      )}
                      {request.user && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>მომხმარებელი: {request.user.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-4">
                    <select
                      value={request.status}
                      onChange={(e) => handleStatusUpdate(request._id, e.target.value)}
                      disabled={updatingRequestId === request._id}
                      className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm focus:border-orange-500 outline-none disabled:opacity-50"
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="mb-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-300">მოთხოვნა:</span>
                  </div>
                  <p className="text-slate-300 whitespace-pre-wrap">{request.message}</p>
                </div>

                {/* Admin Response */}
                {request.adminResponse && (
                  <div className="mb-4 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-semibold text-emerald-400">ადმინისტრატორის პასუხი:</span>
                      {request.respondedBy && (
                        <span className="text-xs text-slate-400">
                          ({request.respondedBy.name})
                        </span>
                      )}
                      {request.respondedAt && (
                        <span className="text-xs text-slate-400 ml-auto">
                          {new Date(request.respondedAt).toLocaleDateString('ka-GE', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-emerald-300 whitespace-pre-wrap">{request.adminResponse}</p>
                  </div>
                )}

                {/* Response Form */}
                {!request.adminResponse && (
                  <div className="mt-4">
                    {expandedRequestId === request._id ? (
                      <div className="space-y-3">
                        <textarea
                          value={responseText[request._id] || ''}
                          onChange={(e) => setResponseText({ ...responseText, [request._id]: e.target.value })}
                          placeholder="დაწერეთ თქვენი პასუხი..."
                          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm focus:border-orange-500 outline-none min-h-[100px] resize-y"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResponseSubmit(request._id)}
                            disabled={updatingRequestId === request._id}
                            className="px-4 py-2 bg-linear-to-r from-orange-500 to-yellow-500 text-white text-sm font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingRequestId === request._id ? 'გაგზავნა...' : 'პასუხის გაგზავნა'}
                          </button>
                          <button
                            onClick={() => {
                              setExpandedRequestId(null);
                              setResponseText({ ...responseText, [request._id]: '' });
                            }}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 text-sm font-semibold rounded-lg transition-colors"
                          >
                            გაუქმება
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setExpandedRequestId(request._id)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 text-sm font-semibold rounded-lg transition-colors"
                      >
                        პასუხის დამატება
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
