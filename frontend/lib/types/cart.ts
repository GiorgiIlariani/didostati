export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  brand: string;
  quantity: number;
  maxStock: number;
}

export type DeliveryType = 'standard' | 'express' | 'pickup';

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  deliveryType: DeliveryType;
  /** Set when delivery fee is calculated (from location or selected city) */
  deliveryDistanceKm?: number;
  /** City/place name (from geocode or manually selected) */
  deliveryLocationName?: string;
  /** True when user can proceed to checkout (pickup or fee known) */
  deliveryFeeResolved: boolean;
}
