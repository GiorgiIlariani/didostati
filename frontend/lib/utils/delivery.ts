/**
 * Delivery pricing based on distance from YOUR STORE to the user.
 *
 * How it works:
 * 1. User location: browser asks for GPS/Wi‑Fi (Geolocation API) when they have items in cart.
 * 2. Distance: Haversine formula – straight-line km between store coords and user coords.
 * 3. Fee: distance × GEL_PER_KM, capped by MIN/MAX (fallback when user denies location).
 *
 * To set your magazine/warehouse: get lat/lng from Google Maps (right‑click your place → “What’s here?”)
 * and set DELIVERY_BASE below.
 */
// Your store / magazine – replace with your exact coordinates (e.g. Gori center: 41.9842, 44.1158)
export const DELIVERY_BASE = { lat: 41.9842, lng: 44.1158 };

export const GEL_PER_KM = 0.2;
export const MIN_DELIVERY_FEE = 2;
export const MAX_DELIVERY_FEE = 25;
export const FALLBACK_DELIVERY_FEE = 5; // when location unavailable

/** Haversine distance in km between two lat/lng points */
export function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Delivery fee in GEL from distance in km (1 GEL/km, min/max capped) */
export function getDeliveryFeeFromDistanceKm(km: number): number {
  const fee = Math.max(MIN_DELIVERY_FEE, Math.min(MAX_DELIVERY_FEE, km * GEL_PER_KM));
  return Math.round(fee * 100) / 100;
}

/** Distance from base and delivery fee from user coords */
export function getDeliveryFromCoords(lat: number, lng: number): { distanceKm: number; fee: number } {
  const distanceKm = getDistanceKm(DELIVERY_BASE.lat, DELIVERY_BASE.lng, lat, lng);
  const fee = getDeliveryFeeFromDistanceKm(distanceKm);
  return { distanceKm: Math.round(distanceKm * 10) / 10, fee };
}
