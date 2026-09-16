/**
 * Server-side delivery fee computation.
 *
 * The frontend computes the fee either from a fixed city tariff table or
 * from the customer's GPS distance to the store (see
 * frontend/lib/utils/delivery.ts). The backend never trusts the client's
 * fee number — a tampered request could set deliveryFee to 0 and steal
 * delivery revenue. Instead the client tells us *how* it priced delivery:
 *
 *   - pickup                    → 0
 *   - tariff city (deliveryCity) → fixed tariff from CITY_TARIFFS
 *   - GPS (deliveryCoords)       → Haversine distance from the store,
 *                                  same formula/constants as the frontend
 *
 * If neither a known tariff city nor valid coordinates are provided, the fee
 * cannot be determined and `getDeliveryFee` returns null so the caller can
 * reject the order instead of guessing.
 */

// Keep in sync with frontend/lib/utils/delivery.ts CITY_TARIFFS.
// Frontend sends the Georgian display name (e.g. "თბილისი") as
// deliveryCity, so both the Georgian name and the English id must map to
// the same fee.
const CITY_TARIFFS = {
  zugdidi: 280,
  ზუგდიდი: 280,
  poti: 230,
  ფოთი: 230,
  kutaisi: 200,
  ქუთაისი: 200,
  batumi: 400,
  ბათუმი: 400,
  khashuri: 85,
  ხაშური: 85,
  gori: 30,
  გორი: 30,
  telavi: 150,
  თელავი: 150,
  mtskheta: 70,
  მცხეთა: 70,
  tbilisi: 50,
  თბილისი: 50,
  rustavi: 150,
  რუსთავი: 150,
};

// Keep in sync with frontend/lib/utils/delivery.ts (GEL_PER_KM, MIN/MAX,
// EXPRESS_FEE_EXTRA, DELIVERY_BASE). Store coordinates can be overridden via
// env to match NEXT_PUBLIC_DELIVERY_BASE_LAT/LNG on the frontend.
const GEL_PER_KM = 0.2;
const MIN_DELIVERY_FEE = 2;
const MAX_DELIVERY_FEE = 25;
const EXPRESS_FEE_EXTRA = 5;
const DELIVERY_BASE = {
  lat: parseFloat(process.env.DELIVERY_BASE_LAT || "41.9842"),
  lng: parseFloat(process.env.DELIVERY_BASE_LNG || "44.1158"),
};

// Georgia bounding box — anything outside is not a deliverable address and
// would only be sent by a tampered client trying to hit the min fee.
const GEORGIA_BOUNDS = { minLat: 41.0, maxLat: 43.6, minLng: 39.9, maxLng: 46.8 };

function normalizeCity(name) {
  return String(name || "")
    .trim()
    .toLowerCase();
}

function getKnownCityFee(cityName) {
  const key = normalizeCity(cityName);
  if (!key) return null;
  return Object.prototype.hasOwnProperty.call(CITY_TARIFFS, key)
    ? CITY_TARIFFS[key]
    : null;
}

/** Haversine distance in km — identical to the frontend implementation. */
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getDeliveryFeeFromDistanceKm(km) {
  const fee = Math.max(MIN_DELIVERY_FEE, Math.min(MAX_DELIVERY_FEE, km * GEL_PER_KM));
  return Math.round(fee * 100) / 100;
}

function parseCoords(coords) {
  if (!coords || typeof coords !== "object") return null;
  const lat = Number(coords.lat);
  const lng = Number(coords.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (
    lat < GEORGIA_BOUNDS.minLat ||
    lat > GEORGIA_BOUNDS.maxLat ||
    lng < GEORGIA_BOUNDS.minLng ||
    lng > GEORGIA_BOUNDS.maxLng
  ) {
    return null;
  }
  return { lat, lng };
}

/**
 * Returns the delivery fee to charge, or null if it cannot be determined.
 *
 * @param {'standard'|'express'|'pickup'} deliveryType
 * @param {{ city?: string, coords?: { lat: number, lng: number } }} pricing
 *   `city`   — tariff city chosen in the cart (cart.deliveryCity)
 *   `coords` — customer GPS position when the cart priced by distance
 */
function getDeliveryFee(deliveryType, pricing = {}) {
  if (deliveryType === "pickup") return 0;

  const expressExtra = deliveryType === "express" ? EXPRESS_FEE_EXTRA : 0;

  const knownFee = getKnownCityFee(pricing.city);
  if (knownFee !== null) return knownFee + expressExtra;

  const coords = parseCoords(pricing.coords);
  if (coords) {
    const km = getDistanceKm(DELIVERY_BASE.lat, DELIVERY_BASE.lng, coords.lat, coords.lng);
    return getDeliveryFeeFromDistanceKm(km) + expressExtra;
  }

  return null;
}

module.exports = {
  getDeliveryFee,
  getDistanceKm,
  CITY_TARIFFS,
  GEL_PER_KM,
  MIN_DELIVERY_FEE,
  MAX_DELIVERY_FEE,
  EXPRESS_FEE_EXTRA,
  DELIVERY_BASE,
};
