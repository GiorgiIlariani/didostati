export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  brand: string;
  quantity: number;
  maxStock: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  /** Set when delivery fee is calculated from user location */
  deliveryDistanceKm?: number;
}
