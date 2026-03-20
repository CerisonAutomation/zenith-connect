/**
 * Privacy-safe geolocation utilities.
 * All peer coordinates are fuzzed to a geohash ring (±~1km).
 * Never expose exact coordinates to other users.
 */

// Geohash precision 6 ≈ ±0.6km accuracy — sufficient for 'nearby' without exact location
const GEOHASH_PRECISION = 6

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz'

/**
 * Encode lat/lng to geohash string.
 * @param lat - Latitude
 * @param lng - Longitude
 * @param precision - Geohash precision (default 6 ≈ ±0.6km)
 */
export function encodeGeohash(lat: number, lng: number, precision = GEOHASH_PRECISION): string {
  let idx = 0
  let bit = 0
  let evenBit = true
  let geohash = ''

  let latMin = -90, latMax = 90
  let lngMin = -180, lngMax = 180

  while (geohash.length < precision) {
    if (evenBit) {
      const lngMid = (lngMin + lngMax) / 2
      if (lng >= lngMid) { idx = idx * 2 + 1; lngMin = lngMid }
      else { idx = idx * 2; lngMax = lngMid }
    } else {
      const latMid = (latMin + latMax) / 2
      if (lat >= latMid) { idx = idx * 2 + 1; latMin = latMid }
      else { idx = idx * 2; latMax = latMid }
    }
    evenBit = !evenBit
    if (++bit === 5) { geohash += BASE32[idx]; bit = 0; idx = 0 }
  }

  return geohash
}

/**
 * Add random offset within geohash cell for additional privacy fuzzing.
 * Returns coordinates displaced by up to ~500m in a random direction.
 */
export function fuzzCoordinates(lat: number, lng: number): { lat: number; lng: number } {
  // ~0.005 degrees ≈ 500m
  const FUZZ = 0.005
  return {
    lat: lat + (Math.random() - 0.5) * FUZZ * 2,
    lng: lng + (Math.random() - 0.5) * FUZZ * 2,
  }
}
