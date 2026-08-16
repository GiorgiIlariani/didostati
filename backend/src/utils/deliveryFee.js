/**
 * Server-side delivery fee guard.
 *
 * The frontend computes the fee either from a fixed city tariff table or
 * from the customer's GPS distance to the store (see
 * frontend/lib/utils/delivery.ts). The backend doesn't receive GPS
 * coordinates, so it can't recompute a GPS-based fee exactly — but it must
 * not blindly trust a client-supplied number, or a tampered request could
 * set deliveryFee to 0 (or any value) and steal delivery revenue.
 *
 * Strategy: for known cities, force the exact tariff (ignore the client
 * value entirely). For pickup, force 0. Otherwise (GPS-based fee for an
 * unlisted city), clamp the client value to the same [MIN, MAX] range the
 * frontend itself enforces. In every case, "express" adds the same fixed
 * surcharge the frontend adds on top of the base fee.
 */

// Keep in sync with frontend/lib/utils/delivery.ts CITY_TARIFFS.
// Frontend sends the Georgian display name (e.g. "თბილისი") as
// shippingAddress.city, so both the Georgian name and the English id must
// map to the same fee or the lookup below silently falls through to the
// GPS-based clamp range and undercharges known cities.
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

const MIN_DELIVERY_FEE = 2;
const MAX_DELIVERY_FEE = 25;
// Keep in sync with frontend/lib/utils/delivery.ts EXPRESS_FEE_EXTRA.
const EXPRESS_FEE_EXTRA = 5;

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

/**
 * Returns the delivery fee to charge, validated against server-known rules.
 * `clientFee` is only trusted (and only within a bounded range) when the
 * city isn't one of our known fixed-tariff cities.
 */
function getDeliveryFee(deliveryType, cityName, clientFee) {
  if (deliveryType === "pickup") return 0;

  const expressExtra = deliveryType === "express" ? EXPRESS_FEE_EXTRA : 0;

  const knownFee = getKnownCityFee(cityName);
  if (knownFee !== null) return knownFee + expressExtra;

  const fee = Number(clientFee);
  const minFee = MIN_DELIVERY_FEE + expressExtra;
  const maxFee = MAX_DELIVERY_FEE + expressExtra;
  if (!Number.isFinite(fee) || fee < 0) return minFee;
  return Math.min(maxFee, Math.max(minFee, fee));
}

module.exports = {
  getDeliveryFee,
  CITY_TARIFFS,
  MIN_DELIVERY_FEE,
  MAX_DELIVERY_FEE,
  EXPRESS_FEE_EXTRA,
};
