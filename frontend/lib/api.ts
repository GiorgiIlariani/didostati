// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const AUTH_TOKEN_KEY = 'didostati_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  else localStorage.removeItem(AUTH_TOKEN_KEY);
}

// Helper function for API requests – attaches JWT if present
async function apiRequest(endpoint: string, options?: RequestInit) {
  const url = `${API_URL}${endpoint}`;
  const token = getStoredToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Product API calls
export const productAPI = {
  // Get all products with optional filters
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    size?: string;
    purpose?: string;
    sort?: string;
    q?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const query = queryParams.toString();
    return apiRequest(`/products${query ? `?${query}` : ''}`);
  },

  // Get featured products
  getFeatured: async (limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    return apiRequest(`/products/featured${query}`);
  },

  // Get promotions/sale products
  getPromotions: async (limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    return apiRequest(`/products/promotions${query}`);
  },

  // Search products
  search: async (query: string, limit?: number) => {
    const params = new URLSearchParams({ q: query });
    if (limit) params.append('limit', String(limit));
    return apiRequest(`/products/search?${params.toString()}`);
  },

  // Get filter options (sizes, purposes)
  getFilterOptions: async () => {
    return apiRequest('/products/filters/options');
  },

  // Get single product
  getById: async (id: string) => {
    return apiRequest(`/products/${id}`);
  },

  // Get product by id; returns null on 404 without logging (e.g. for recently viewed with stale ids)
  getByIdOptional: async (id: string): Promise<{ status: string; data: { product: any } } | null> => {
    const url = `${API_URL}/products/${id}`;
    const token = getStoredToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    try {
      const response = await fetch(url, { headers });
      const data = await response.json();
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(data.message || 'API request failed');
      return data;
    } catch {
      return null;
    }
  },

  // Upload product image (admin) – multipart form, field name "image"
  uploadImage: async (file: File | Blob, filename?: string): Promise<{ url: string }> => {
    const url = `${API_URL}/products/upload-image`;
    const token = getStoredToken();
    const formData = new FormData();
    const name = filename || (file instanceof File ? file.name : 'image.png');
    formData.append('image', file, name);
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(url, { method: 'POST', body: formData, headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Upload failed');
    return data.data;
  },

  // Create product (admin)
  create: async (productData: any) => {
    return apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  // Update product (admin)
  update: async (id: string, productData: any) => {
    return apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  // Delete product (admin)
  delete: async (id: string) => {
    return apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Get all products for admin (includes inactive)
  getAdminAll: async () => {
    return apiRequest('/products/admin/all');
  },
};

// Category API calls
export const categoryAPI = {
  getAll: async () => {
    return apiRequest('/categories');
  },

  getById: async (id: string) => {
    return apiRequest(`/categories/${id}`);
  },
};

// Cart API calls
export const cartAPI = {
  get: async () => {
    return apiRequest('/cart');
  },

  // Add more cart methods as needed
};

// Order API calls
export const orderAPI = {
  // Get user's orders (requires auth)
  getAll: async () => {
    return apiRequest('/orders');
  },

  // Create new order
  create: async (orderData: {
    items: Array<{
      productId: string;
      quantity: number;
    }>;
    shippingAddress: {
      street?: string;
      city: string;
      region?: string;
      postalCode?: string;
      country?: string;
    };
    paymentMethod: 'cash' | 'card' | 'bank_transfer';
    deliveryFee?: number;
    deliveryType?: 'standard' | 'express' | 'pickup';
    phone?: string;
    customer?: {
      name?: string;
      email?: string;
      phone?: string;
    };
    notes?: string;
  }) => {
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Get single order by ID
  getById: async (id: string) => {
    return apiRequest(`/orders/${id}`);
  },
};

// Admin Order API calls
export const adminOrderAPI = {
  // Get all orders (admin only)
  getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return apiRequest(`/orders/admin/all${query ? `?${query}` : ''}`);
  },

  // Update order status (admin only)
  updateStatus: async (orderId: string, status?: string, paymentStatus?: string) => {
    return apiRequest(`/orders/admin/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, paymentStatus }),
    });
  },
};

// Wishlist API calls
export const wishlistAPI = {
  // Get current user's wishlist (full products + ids)
  get: async () => {
    return apiRequest('/wishlist');
  },

  // Toggle a product in the wishlist
  toggle: async (productId: string) => {
    return apiRequest(`/wishlist/toggle/${productId}`, {
      method: 'POST',
    });
  },
};

// Advertisement API calls
export const advertisementAPI = {
  // Get all advertisements with optional position filter
  getAll: async (position?: string) => {
    const query = position ? `?position=${position}` : '';
    return apiRequest(`/advertisements${query}`);
  },

  // Get single advertisement
  getById: async (id: string) => {
    return apiRequest(`/advertisements/${id}`);
  },

  // Upload media (image/video) for advertisement – returns { data: { url } }
  uploadMedia: async (file: File) => {
    const url = `${API_URL}/advertisements/upload`;
    const token = getStoredToken();
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const formData = new FormData();
    formData.append('media', file);
    const response = await fetch(url, { method: 'POST', headers, body: formData });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Upload failed');
    return data;
  },

  // Create advertisement (admin)
  create: async (adData: any) => {
    return apiRequest('/advertisements', {
      method: 'POST',
      body: JSON.stringify(adData),
    });
  },

  // Update advertisement (admin)
  update: async (id: string, adData: any) => {
    return apiRequest(`/advertisements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(adData),
    });
  },

  // Delete advertisement (admin)
  delete: async (id: string) => {
    return apiRequest(`/advertisements/${id}`, {
      method: 'DELETE',
    });
  },
};

// Auth API calls
export const authAPI = {
  register: async (name: string, email: string, password: string) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },
  login: async (email: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  getMe: async () => {
    return apiRequest('/auth/me');
  },
};

// Health check
export const healthCheck = async () => {
  return apiRequest('/health');
};

// Support / consultation API
export const supportAPI = {
  create: async (payload: {
    name: string;
    phone: string;
    email?: string;
    message: string;
    productId?: string;
    requestType?: 'general' | 'consultation' | 'technical';
  }) => {
    return apiRequest('/support', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// Admin Support API calls
export const adminSupportAPI = {
  // Get all support requests (admin only)
  getAll: async (params?: { status?: string; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return apiRequest(`/support/admin/all${query ? `?${query}` : ''}`);
  },

  // Update support request (admin only)
  update: async (id: string, data: { status?: string; adminResponse?: string }) => {
    return apiRequest(`/support/admin/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// Reviews API
export const reviewAPI = {
  addOrUpdate: async (productId: string, rating: number, comment: string) => {
    return apiRequest(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  },
};

// Notification API calls
export const notificationAPI = {
  // Get user's notifications
  getAll: async (params?: { read?: boolean; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return apiRequest(`/notifications${query ? `?${query}` : ''}`);
  },

  // Get unread count
  getUnreadCount: async () => {
    return apiRequest('/notifications/unread-count');
  },

  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    return apiRequest(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return apiRequest('/notifications/read-all', {
      method: 'PATCH',
    });
  },

  // Delete notification
  delete: async (notificationId: string) => {
    return apiRequest(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },
};

// Export API_URL for direct use if needed
export { API_URL };
