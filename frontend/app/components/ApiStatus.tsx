"use client";

import { useEffect, useState } from 'react';
import { healthCheck } from '@/lib/api';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const HIDE_AFTER_MS = 3000; // Hide "API Connected" after 3 seconds

const ApiStatus = () => {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [hideConnected, setHideConnected] = useState(false);

  useEffect(() => {
    async function checkApi() {
      try {
        const response = await healthCheck();
        if (response.status === 'success') {
          setStatus('connected');
          setMessage('Backend API is running!');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Failed to connect to backend');
      }
    }

    checkApi();
  }, []);

  // Hide the "connected" message after a few seconds
  useEffect(() => {
    if (status !== 'connected') return;
    const timer = setTimeout(() => setHideConnected(true), HIDE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="fixed bottom-4 right-4 bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
          <span className="text-sm text-slate-300">Connecting to API...</span>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed bottom-4 right-4 bg-slate-800 border border-red-500/50 rounded-lg p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-400" />
          <div>
            <p className="text-sm font-semibold text-red-400">API Disconnected</p>
            <p className="text-xs text-slate-400">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Connected: hide after a few seconds
  if (hideConnected) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 border border-green-500/50 rounded-lg p-4 shadow-lg">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-400" />
        <div>
          <p className="text-sm font-semibold text-green-400">API Connected</p>
          <p className="text-xs text-slate-400">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ApiStatus;
