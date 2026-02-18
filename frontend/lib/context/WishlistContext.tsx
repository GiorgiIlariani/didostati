"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { wishlistAPI } from "../api";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
};

const GUEST_WISHLIST_KEY = "didostati_wishlist_guest";

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load wishlist on mount and whenever auth user changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true); // synchronous: avoid showing stale count for one frame when user changes

    async function load() {
      try {
        if (user) {
          // Logged in: load from backend
          const res = await wishlistAPI.get();
          if (!cancelled && res?.status === "success") {
            const ids: string[] = res.data.ids || [];
            setWishlistIds([...new Set(ids.map((id: any) => String(id)))]);
          }
        } else {
          // Guest: load from localStorage
          if (typeof window !== "undefined") {
            const saved = localStorage.getItem(GUEST_WISHLIST_KEY);
            if (saved) {
              try {
                const parsed = JSON.parse(saved) as string[];
                if (Array.isArray(parsed)) {
                  setWishlistIds([...new Set(parsed)]);
                } else {
                  setWishlistIds([]);
                }
              } catch {
                setWishlistIds([]);
              }
            } else {
              setWishlistIds([]);
            }
          }
        }
      } catch (error) {
        if (!cancelled) {
          setWishlistIds([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    // If not logged in, work purely in localStorage for easy UX
    if (!user) {
      setWishlistIds((prev) => {
        const next = prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId];
        if (typeof window !== "undefined") {
          localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(next));
        }
        return next;
      });
      return;
    }

    // Logged in: backend-driven wishlist
    setWishlistIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );

    try {
      const res = await wishlistAPI.toggle(productId);
      if (res?.status === "success" && Array.isArray(res.data.wishlistIds)) {
        const normalizedIds = Array.from(
          new Set(
            (res.data.wishlistIds as Array<string | number>).map((id) =>
              String(id),
            ),
          ),
        );
        setWishlistIds(normalizedIds);
      }
    } catch (error) {
      // Revert on error
      setWishlistIds((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId],
      );
      console.error("Failed to toggle wishlist:", error);
    }
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  const clearWishlist = () => {
    setWishlistIds([]);
    if (typeof window !== "undefined" && !user) {
      localStorage.removeItem(GUEST_WISHLIST_KEY);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        loading,
      }}>
      {children}
    </WishlistContext.Provider>
  );
};
