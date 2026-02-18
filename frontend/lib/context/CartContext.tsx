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
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { CartItem, Cart, DeliveryType } from "../types/cart";
import {
  getDeliveryFromCoords,
  getLocationNameFromCoords,
  getDeliveryFeeForCity,
  EXPRESS_FEE_EXTRA,
} from "../utils/delivery";

interface CartContextType {
  cart: Cart;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
  deliveryType: DeliveryType;
  setDeliveryType: (t: DeliveryType) => void;
  deliveryCity: string;
  setDeliveryCity: (city: string) => void;
  requestDeliveryLocation: (showHelpOnDenied?: boolean) => void;
  locationStatus: "idle" | "loading" | "success" | "denied" | "error";
  permissionDeniedHelp: boolean;
  clearPermissionDeniedHelp: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

const CART_STORAGE_KEY = "didostati_cart";
const DELIVERY_PREFS_KEY = "didostati_delivery_prefs";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [deliveryType, setDeliveryTypeState] =
    useState<DeliveryType>("standard");
  const [deliveryCity, setDeliveryCityState] = useState<string>("");
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [userLocationName, setUserLocationName] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "success" | "denied" | "error"
  >("idle");
  const [permissionDeniedHelp, setPermissionDeniedHelp] = useState(false);

  const setDeliveryType = useCallback((t: DeliveryType) => {
    setDeliveryTypeState(t);
    if (typeof window !== "undefined") {
      try {
        const prefs = JSON.parse(
          localStorage.getItem(DELIVERY_PREFS_KEY) || "{}",
        );
        localStorage.setItem(
          DELIVERY_PREFS_KEY,
          JSON.stringify({ ...prefs, deliveryType: t }),
        );
      } catch (_) {}
    }
  }, []);

  const setDeliveryCity = useCallback((city: string) => {
    setDeliveryCityState(city);
    if (typeof window !== "undefined") {
      try {
        const prefs = JSON.parse(
          localStorage.getItem(DELIVERY_PREFS_KEY) || "{}",
        );
        localStorage.setItem(
          DELIVERY_PREFS_KEY,
          JSON.stringify({ ...prefs, deliveryCity: city }),
        );
      } catch (_) {}
    }
  }, []);

  const clearPermissionDeniedHelp = useCallback(
    () => setPermissionDeniedHelp(false),
    [],
  );

  const requestDeliveryLocation = useCallback((showHelpOnDenied = false) => {
    setPermissionDeniedHelp(false);
    if (!navigator.geolocation) {
      setLocationStatus("error");
      if (showHelpOnDenied) setPermissionDeniedHelp(true);
      return;
    }
    setLocationStatus("loading");
    setUserLocationName(null);
    // Defer so React can paint loading state before getCurrentPosition (which may fail instantly if denied)
    setTimeout(() => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setUserCoords(coords);
          setLocationStatus("success");
          const name = await getLocationNameFromCoords(coords.lat, coords.lng);
          setUserLocationName(name);
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) setLocationStatus("denied");
          else setLocationStatus("error");
          if (showHelpOnDenied) setPermissionDeniedHelp(true);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
      );
    }, 50);
  }, []);

  // Request location when cart has items (skip for pickup)
  useEffect(() => {
    if (
      items.length > 0 &&
      locationStatus === "idle" &&
      deliveryType !== "pickup"
    ) {
      requestDeliveryLocation();
    }
  }, [items.length, locationStatus, requestDeliveryLocation, deliveryType]);

  // Load cart and delivery prefs from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setItems(parsed);
      }
      const prefs = localStorage.getItem(DELIVERY_PREFS_KEY);
      if (prefs) {
        const p = JSON.parse(prefs);
        if (p.deliveryType) setDeliveryTypeState(p.deliveryType);
        if (p.deliveryCity) setDeliveryCityState(p.deliveryCity);
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [items]);

  const calculateCart = useCallback((): Cart => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    let baseFee = 0;
    let deliveryDistanceKm: number | undefined;
    let deliveryLocationName: string | undefined;
    let deliveryFeeResolved = false;

    if (deliveryType === "pickup") {
      deliveryFeeResolved = true;
    } else {
      const cityFee = deliveryCity ? getDeliveryFeeForCity(deliveryCity) : null;
      const coordsFee = userCoords
        ? getDeliveryFromCoords(userCoords.lat, userCoords.lng)
        : null;
      if (cityFee != null) {
        baseFee = cityFee;
        deliveryLocationName = deliveryCity;
        deliveryFeeResolved = true;
      } else if (coordsFee) {
        baseFee = coordsFee.fee;
        deliveryDistanceKm = coordsFee.distanceKm;
        deliveryLocationName = userLocationName ?? undefined;
        deliveryFeeResolved = true;
      }
      if (deliveryType === "express" && deliveryFeeResolved) {
        baseFee = baseFee + EXPRESS_FEE_EXTRA;
      }
    }

    const deliveryFee = Math.round(baseFee * 100) / 100;
    const total = subtotal + deliveryFee;

    return {
      items,
      subtotal,
      deliveryFee,
      total,
      itemCount,
      deliveryType,
      deliveryDistanceKm,
      deliveryLocationName,
      deliveryFeeResolved,
    };
  }, [items, userCoords, userLocationName, deliveryType, deliveryCity]);

  const cart = calculateCart();

  const addToCart = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: Math.min(i.quantity + 1, item.maxStock) }
            : i,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
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
        }),
      );
    },
    [removeFromCart],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback(
    (productId: string) => {
      return items.some((i) => i.productId === productId);
    },
    [items],
  );

  const getItemQuantity = useCallback(
    (productId: string) => {
      return items.find((i) => i.productId === productId)?.quantity || 0;
    },
    [items],
  );

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
        deliveryType,
        setDeliveryType,
        deliveryCity,
        setDeliveryCity,
        requestDeliveryLocation,
        locationStatus,
        permissionDeniedHelp,
        clearPermissionDeniedHelp,
      }}>
      {children}
    </CartContext.Provider>
  );
};
