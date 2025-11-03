/**
 * Predefined Map Coordinates for TV Remote Navigation
 */

export interface MapCoordinate {
  id: string;
  name: string;
  lat: number;
  lng: number;
  zoom?: number;
}

export const MAP_COORDINATES: MapCoordinate[] = [
  { id: 'new-york', name: 'New York', lat: 40.7128, lng: -74.0060, zoom: 10 },
  { id: 'los-angeles', name: 'Los Angeles', lat: 34.0522, lng: -118.2437, zoom: 10 },
  { id: 'chicago', name: 'Chicago', lat: 41.8781, lng: -87.6298, zoom: 10 },
  { id: 'houston', name: 'Houston', lat: 29.7604, lng: -95.3698, zoom: 10 },
  { id: 'phoenix', name: 'Phoenix', lat: 33.4484, lng: -112.0740, zoom: 10 },
  { id: 'philadelphia', name: 'Philadelphia', lat: 39.9526, lng: -75.1652, zoom: 10 },
  { id: 'san-antonio', name: 'San Antonio', lat: 29.4241, lng: -98.4936, zoom: 10 },
  { id: 'san-diego', name: 'San Diego', lat: 32.7157, lng: -117.1611, zoom: 10 },
  { id: 'dallas', name: 'Dallas', lat: 32.7767, lng: -96.7970, zoom: 10 },
  { id: 'san-jose', name: 'San Jose', lat: 37.3382, lng: -121.8863, zoom: 10 },
];

export const getCoordinateByIndex = (index: number): MapCoordinate => {
  const safeIndex = ((index % MAP_COORDINATES.length) + MAP_COORDINATES.length) % MAP_COORDINATES.length;
  return MAP_COORDINATES[safeIndex];
};
