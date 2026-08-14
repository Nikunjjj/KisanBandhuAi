export const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 };

export function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getCoordinates(query) {
  return {
    lat: toNumber(query.lat, DEFAULT_CENTER.lat),
    lng: toNumber(query.lng, DEFAULT_CENTER.lng)
  };
}

export function distanceKm(a, b) {
  const earthRadius = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const hav = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav));
}

export function withDistance(items, origin) {
  return items
    .map((item) => {
      const coordinates = item.location?.coordinates || [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat];
      const distance = distanceKm(origin, { lng: coordinates[0], lat: coordinates[1] });
      return {
        ...item,
        distanceKm: Number(distance.toFixed(1)),
        travelTimeMinutes: Math.max(4, Math.round((distance / 28) * 60))
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export async function geoFind(Model, query, origin, radiusKm, extra = {}) {
  const criteria = {
    ...extra,
    location: {
      $nearSphere: {
        $geometry: { type: "Point", coordinates: [origin.lng, origin.lat] },
        $maxDistance: radiusKm * 1000
      }
    }
  };

  const search = query.search || query.q;
  if (search) criteria.$text = { $search: search };

  return Model.find(criteria).limit(Math.min(Number(query.limit) || 50, 100)).lean();
}

export function buildPoint(lng, lat) {
  return { type: "Point", coordinates: [Number(lng), Number(lat)] };
}
