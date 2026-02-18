/**
 * Delivery pricing based on distance from YOUR STORE to the user.
 *
 * How it works:
 * 1. User location: browser asks for GPS/Wi‑Fi (Geolocation API) when they have items in cart.
 * 2. Distance: Haversine formula – straight-line km between store coords and user coords.
 * 3. Fee: distance × GEL_PER_KM, capped by MIN/MAX. No fee until user allows location.
 *
 * To set your magazine/warehouse: get lat/lng from Google Maps (right‑click your place → “What’s here?”)
 * and set DELIVERY_BASE below.
 */
// Your store/warehouse – configurable via environment variables
// Set NEXT_PUBLIC_DELIVERY_BASE_LAT, NEXT_PUBLIC_DELIVERY_BASE_LNG, NEXT_PUBLIC_DELIVERY_BASE_LABEL in .env.local
// Or edit the fallback values below
const DELIVERY_BASE_LAT = parseFloat(process.env.NEXT_PUBLIC_DELIVERY_BASE_LAT || '41.9842');
const DELIVERY_BASE_LNG = parseFloat(process.env.NEXT_PUBLIC_DELIVERY_BASE_LNG || '44.1158');
export const DELIVERY_BASE = { lat: DELIVERY_BASE_LAT, lng: DELIVERY_BASE_LNG };
/** Label shown in UI for "from" */
export const DELIVERY_BASE_LABEL = process.env.NEXT_PUBLIC_DELIVERY_BASE_LABEL || "გორი";

export const GEL_PER_KM = 0.2;
export const MIN_DELIVERY_FEE = 2;
export const MAX_DELIVERY_FEE = 25;

/** Extra fee (₾) for express delivery, added to base fee */
export const EXPRESS_FEE_EXTRA = 5;

export type DeliveryType = 'standard' | 'express' | 'pickup';

/** Fixed delivery fee (₾) by city. Keys normalized (lowercase). */
const CITY_TARIFFS: Record<string, number> = {
  'გორი': 2, 'gori': 2,
  'თბილისი': 10, 'tbilisi': 10,
  'ქუთაისი': 15, 'kutaisi': 15,
  'ბათუმი': 20, 'batumi': 20,
  'რუსთავი': 12, 'rustavi': 12,
  'ზესტაფონი': 5, 'zestaponi': 5,
  'მარნეული': 8, 'marneuli': 8,
  'ბორჯომი': 8, 'borjomi': 8,
  'ქობულეთი': 22, 'kobuleti': 22,
  'სამტრედია': 12, 'samtredia': 12,
  'ფოთი': 18, 'poti': 18,
  'თელავი': 14, 'telavi': 14,
  'მცხეთა': 8, 'mtskheta': 8,
};

function normalizeCity(name: string): string {
  return (name || '').trim().toLowerCase();
}

/** Get fixed delivery fee for a city (₾), or null if not in list */
export function getDeliveryFeeForCity(cityName: string): number | null {
  const key = normalizeCity(cityName);
  if (!key) return null;
  for (const [city, fee] of Object.entries(CITY_TARIFFS)) {
    if (normalizeCity(city) === key) return fee;
  }
  return null;
}

/** Cities with fixed tariffs for dropdown (name + fee) */
export const DELIVERY_CITIES: { name: string; fee: number }[] = [
  { name: 'გორი', fee: 2 }, { name: 'თბილისი', fee: 10 }, { name: 'ქუთაისი', fee: 15 },
  { name: 'ბათუმი', fee: 20 }, { name: 'რუსთავი', fee: 12 }, { name: 'მცხეთა', fee: 8 },
  { name: 'ზესტაფონი', fee: 5 }, { name: 'მარნეული', fee: 8 }, { name: 'ბორჯომი', fee: 8 },
  { name: 'სამტრედია', fee: 12 }, { name: 'ფოთი', fee: 18 }, { name: 'ქობულეთი', fee: 22 }, { name: 'თელავი', fee: 14 },
];

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

/** Reverse geocode: get place name (city/town) from lat/lng via Nominatim. Returns null on error. */
export async function getLocationNameFromCoords(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "ka,en", "User-Agent": "DidostatiApp/1.0" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const a = data?.address || {};
    return a.city || a.town || a.village || a.municipality || a.state || data.display_name || null;
  } catch {
    return null;
  }
}
