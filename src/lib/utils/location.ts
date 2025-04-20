export interface Location {
  lat: number;
  lng: number;
}

export function calculateDistance(location1: Location, location2: Location): number {
  // Haversine formula to calculate distance between two points on earth
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(location2.lat - location1.lat);
  const dLng = deg2rad(location2.lng - location1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(location1.lat)) * Math.cos(deg2rad(location2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function isWithinRadius(centerLocation: Location, targetLocation: Location, radiusInKm: number): boolean {
  const distance = calculateDistance(centerLocation, targetLocation);
  return distance <= radiusInKm;
}

export function formatLocation(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
} 