import type { LatLng } from "../services/golfDataService";

const EARTH_RADIUS_METERS = 6371000;
const METERS_TO_YARDS = 1.0936133;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const distanceInYards = (from: LatLng, to: LatLng): number => {
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distanceMeters = EARTH_RADIUS_METERS * c;
  return distanceMeters * METERS_TO_YARDS;
};
