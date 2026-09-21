import { Coordinates } from '../types';

/**
 * Calculates the great-circle distance between two points using the Haversine formula.
 * Returns distance in kilometers rounded to 1 decimal place.
 */
export function calculateHaversineDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return Math.round(d * 10) / 10;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates estimated time of arrival in minutes based on distance.
 */
export function calculateETA(distanceKm: number): number {
  // Average urban speed ~25 km/h + 2 min prep/dispatch buffer
  const minutes = Math.ceil((distanceKm / 25) * 60) + 2;
  return Math.max(3, minutes);
}

/**
 * Formats Indian Rupee currency
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generates intermediate waypoints between start and end for smooth route simulation
 */
export function generateRoutePoints(
  start: Coordinates,
  end: Coordinates,
  steps = 20
): Coordinates[] {
  const points: Coordinates[] = [];
  // Add subtle curved jitter for realistic roadway simulation
  const midLat = (start.lat + end.lat) / 2;
  const midLng = (start.lng + end.lng) / 2;
  const perpLat = -(end.lng - start.lng) * 0.15;
  const perpLng = (end.lat - start.lat) * 0.15;

  const controlPoint: Coordinates = {
    lat: midLat + perpLat,
    lng: midLng + perpLng,
  };

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Quadratic Bezier curve
    const lat =
      (1 - t) * (1 - t) * start.lat + 2 * (1 - t) * t * controlPoint.lat + t * t * end.lat;
    const lng =
      (1 - t) * (1 - t) * start.lng + 2 * (1 - t) * t * controlPoint.lng + t * t * end.lng;
    points.push({ lat, lng });
  }

  return points;
}

export interface PresetCity {
  id: string;
  name: string;
  coords: Coordinates;
  address: string;
}

export const PRESET_LOCATIONS: PresetCity[] = [
  {
    id: 'vijayawada-mg-road',
    name: 'Vijayawada (M.G. Road)',
    coords: { lat: 16.5062, lng: 80.648 },
    address: 'Near Benz Circle, M.G. Road, Vijayawada, AP',
  },
  {
    id: 'hyderabad-hitech',
    name: 'Hyderabad (Hitec City)',
    coords: { lat: 17.4435, lng: 78.3772 },
    address: 'Near Cyber Towers, Hitec City, Hyderabad, TS',
  },
  {
    id: 'bangalore-koramangala',
    name: 'Bangalore (Koramangala)',
    coords: { lat: 12.9352, lng: 77.6245 },
    address: '80ft Road, 4th Block, Koramangala, Bengaluru, KA',
  },
  {
    id: 'delhi-connaught',
    name: 'New Delhi (Connaught Place)',
    coords: { lat: 28.6315, lng: 77.2167 },
    address: 'Outer Circle, Connaught Place, New Delhi, DL',
  },
];

export const calculateDistanceKm = calculateHaversineDistance;

