"use client";

/**
 * CartContext
 * Manages shopping cart state and logic:
 * - Add/remove items
 * - Update quantities
 * - Automatic price calculation (subtotal + delivery fee)
 * - Location-based delivery fee calculation (using browser geolocation)
 * - Price updates automatically when quantity changes
 * - Persists cart in localStorage for guests
 */
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { CartItem, Cart } from '../types/cart';
import { getDeliveryFromCoords, FALLBACK_DELIVERY_FEE } from '../utils/delivery';

interface CartContextType {
  cart: Cart;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
  /** Ask for location again (e.g. user clicked "use my location") */
  requestDeliveryLocation: () => void;
  locationStatus: 'idle' | 'loading' | 'success' | 'denied' | 'error';
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'denied' | 'error'>('idle');

  const requestDeliveryLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('success');
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setLocationStatus('denied');
        else setLocationStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  // Request location when cart has items
  useEffect(() => {
    if (items.length > 0 && locationStatus === 'idle') {
      requestDeliveryLocation();
    }
  }, [items.length, locationStatus, requestDeliveryLocation]);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('didostati_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('didostati_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const calculateCart = useCallback((): Cart => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryResult = userCoords
      ? getDeliveryFromCoords(userCoords.lat, userCoords.lng)
      : { distanceKm: undefined, fee: FALLBACK_DELIVERY_FEE };
    const deliveryFee = deliveryResult.fee;
    const total = subtotal + deliveryFee;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      subtotal,
      deliveryFee,
      total,
      itemCount,
      deliveryDistanceKm: deliveryResult.distanceKm,
    };
  }, [items, userCoords]);

  const cart = calculateCart();

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: Math.min(i.quantity + 1, item.maxStock) }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.productId === productId) {
          return { ...i, quantity: Math.min(quantity, i.maxStock) };
        }
        return i;
      })
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback((productId: string) => {
    return items.some((i) => i.productId === productId);
  }, [items]);

  const getItemQuantity = useCallback((productId: string) => {
    return items.find((i) => i.productId === productId)?.quantity || 0;
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        getItemQuantity,
        requestDeliveryLocation,
        locationStatus,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
