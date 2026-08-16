"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authAPI } from '@/lib/api';
import { getStoredToken, setStoredToken } from '@/lib/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  authProvider?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phone: string, code: string, name?: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applyAuth = (res: any) => {
    if (res.status === 'success' && res.data?.token) {
      setStoredToken(res.data.token);
      setTokenState(res.data.token);
      setUser(res.data.user);
      return;
    }
    throw new Error(res.message || 'Auth failed');
  };

  const loadUser = useCallback(async () => {
    const stored = getStoredToken();
    if (!stored) {
      setUser(null);
      setTokenState(null);
      setLoading(false);
      return;
    }
    try {
      const res = await authAPI.getMe();
      if (res.status === 'success') {
        setUser(res.data.user);
        setTokenState(stored);
      } else {
        setStoredToken(null);
        setUser(null);
        setTokenState(null);
      }
    } catch {
      setStoredToken(null);
      setUser(null);
      setTokenState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    applyAuth(await authAPI.login(email, password));
  };

  const loginWithPhone = async (phone: string, code: string, name?: string) => {
    applyAuth(await authAPI.loginWithPhone(phone, code, name));
  };

  const loginWithGoogle = async (credential: string) => {
    applyAuth(await authAPI.loginWithGoogle(credential));
  };

  const register = async (name: string, email: string, password: string) => {
    applyAuth(await authAPI.register(name, email, password));
  };

  const logout = () => {
    setStoredToken(null);
    setTokenState(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    loginWithPhone,
    loginWithGoogle,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
