/**
 * RealInfo Geospatial Seeding Utility
 * Designed for SW Brisbane initial launch with Global scalability.
 */

// Central coordinates for SW Brisbane (e.g., Oxley/Indooroopilly area)
export const LOCALE_CENTERS = {
  BRISBANE_SW: { lat: -27.5401, lng: 152.9351 },
  SYDNEY_CBD: { lat: -33.8688, lng: 151.2093 },
};

export function generateRandomCoordinate(center: { lat: number; lng: number }, radiusInKm: number) {
  const radiusInDegrees = radiusInKm / 111; // Crude but effective for seeding

  const u = Math.random();
  const v = Math.random();
  const w = radiusInDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);

  return {
    lat: center.lat + y,
    lng: center.lng + x,
  };
}
