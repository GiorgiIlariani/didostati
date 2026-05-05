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

/** City row for /shipping wizard (რუკაზე lat/lng + ტარიფები). */
export type ShippingWizardCity = {
  id: string;
  name: string;
  /** გეოგრაფიული კოორდინატები — მიწოდების გვერდზე რუკაზე (Leaflet / OSM) */
  lat: number;
  lng: number;
  feeSmallTruck: number;
  feeBigTruck: number;
};

/**
 * ქალაქები მიწოდების კალკულატორისთვის.
 * Checkout-ში გამოიყენება feeSmallTruck (პატარა მანქანა).
 */
export const SHIPPING_WIZARD_CITIES: ShippingWizardCity[] = [
  { id: "zugdidi", name: "ზუგდიდი", lat: 42.5088, lng: 41.8709, feeSmallTruck: 280, feeBigTruck: 390 },
  { id: "poti", name: "ფოთი", lat: 42.1462, lng: 41.6718, feeSmallTruck: 230, feeBigTruck: 320 },
  { id: "kutaisi", name: "ქუთაისი", lat: 42.2679, lng: 42.6946, feeSmallTruck: 200, feeBigTruck: 280 },
  { id: "batumi", name: "ბათუმი", lat: 41.6423, lng: 41.6339, feeSmallTruck: 400, feeBigTruck: 560 },
  { id: "khashuri", name: "ხაშური", lat: 41.9941, lng: 43.5991, feeSmallTruck: 85, feeBigTruck: 118 },
  { id: "gori", name: "გორი", lat: 41.985, lng: 44.1098, feeSmallTruck: 30, feeBigTruck: 45 },
  { id: "telavi", name: "თელავი", lat: 41.9197, lng: 45.4732, feeSmallTruck: 150, feeBigTruck: 210 },
  { id: "mtskheta", name: "მცხეთა", lat: 41.8451, lng: 44.7186, feeSmallTruck: 70, feeBigTruck: 100 },
  { id: "tbilisi", name: "თბილისი", lat: 41.7151, lng: 44.8271, feeSmallTruck: 50, feeBigTruck: 72 },
  { id: "rustavi", name: "რუსთავი", lat: 41.5495, lng: 45.0111, feeSmallTruck: 150, feeBigTruck: 75 },
];

/**
 * Main city delivery rates (₾) — პატარა მანქანა; კალათა/ჩექაუთის სია.
 * ემთხვევა SHIPPING_WIZARD_CITIES-ს.
 */
export const DELIVERY_RATES_GUIDE: { name: string; fromGel: number }[] = [
  ...SHIPPING_WIZARD_CITIES,
]
  .slice()
  .sort((a, b) => a.feeSmallTruck - b.feeSmallTruck)
  .map(({ name, feeSmallTruck }) => ({ name, fromGel: feeSmallTruck }));

/** Fixed delivery fee (₾) by city. Keys: ქართული სახელი + id + ლათინური ალიასები. */
const CITY_TARIFFS: Record<string, number> = (() => {
  const m: Record<string, number> = {};
  for (const c of SHIPPING_WIZARD_CITIES) {
    m[c.name] = c.feeSmallTruck;
    m[c.id] = c.feeSmallTruck;
  }
  Object.assign(m, {
    gori: 30,
    tbilisi: 50,
    kutaisi: 200,
    batumi: 400,
    mtskheta: 70,
    telavi: 150,
    rustavi: 150,
    zugdidi: 280,
    poti: 230,
    khashuri: 85,
  });
  return m;
})();

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

/** Cities with fixed tariffs for dropdown (same set as DELIVERY_RATES_GUIDE) */
export const DELIVERY_CITIES: { name: string; fee: number }[] =
  DELIVERY_RATES_GUIDE.map(({ name, fromGel }) => ({ name, fee: fromGel }));

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
