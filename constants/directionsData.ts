/**
 * Predefined Routes and Directions Data
 * Contains sample routes between major US cities with coordinates and distances
 */

export interface RouteCoordinate {
  lat: number;
  lng: number;
  name: string;
}

export interface RouteSegment {
  start: RouteCoordinate;
  end: RouteCoordinate;
  distance: number; // in miles
  duration: string; // estimated time
}

export interface Route {
  id: string;
  name: string;
  from: string;
  to: string;
  distance: number; // total miles
  duration: string; // total time
  segments: RouteSegment[];
  coordinates: [number, number][]; // [lat, lng] pairs for polyline
}

// Major US Cities Coordinates
export const MAJOR_CITIES: Record<string, RouteCoordinate> = {
  'New York': { lat: 40.7128, lng: -74.006, name: 'New York, NY' },
  'Los Angeles': { lat: 34.0522, lng: -118.2437, name: 'Los Angeles, CA' },
  'Chicago': { lat: 41.8781, lng: -87.6298, name: 'Chicago, IL' },
  'Houston': { lat: 29.7604, lng: -95.3698, name: 'Houston, TX' },
  'Phoenix': { lat: 33.4484, lng: -112.074, name: 'Phoenix, AZ' },
  'Philadelphia': { lat: 39.9526, lng: -75.1652, name: 'Philadelphia, PA' },
  'San Antonio': { lat: 29.4241, lng: -98.4936, name: 'San Antonio, TX' },
  'San Diego': { lat: 32.7157, lng: -117.1611, name: 'San Diego, CA' },
  'Dallas': { lat: 32.7767, lng: -96.797, name: 'Dallas, TX' },
  'San Jose': { lat: 37.3382, lng: -121.8863, name: 'San Jose, CA' },
  'Austin': { lat: 30.2672, lng: -97.7431, name: 'Austin, TX' },
  'Jacksonville': { lat: 30.3322, lng: -81.6557, name: 'Jacksonville, FL' },
  'Fort Worth': { lat: 32.7555, lng: -97.3308, name: 'Fort Worth, TX' },
  'Columbus': { lat: 39.9612, lng: -82.9988, name: 'Columbus, OH' },
  'Indianapolis': { lat: 39.7684, lng: -86.1581, name: 'Indianapolis, IN' },
  'Seattle': { lat: 47.6062, lng: -122.3321, name: 'Seattle, WA' },
  'Denver': { lat: 39.7392, lng: -104.9903, name: 'Denver, CO' },
  'Boston': { lat: 42.3601, lng: -71.0589, name: 'Boston, MA' },
  'Miami': { lat: 25.7617, lng: -80.1918, name: 'Miami, FL' },
  'Atlanta': { lat: 33.749, lng: -84.388, name: 'Atlanta, GA' },
};

// Predefined USA Routes
export const PREDEFINED_ROUTES: Route[] = [
  {
    id: 'route-1',
    name: 'New York to Los Angeles (Coast to Coast)',
    from: 'New York',
    to: 'Los Angeles',
    distance: 2789,
    duration: '40 hours 30 min',
    segments: [
      {
        start: MAJOR_CITIES['New York'],
        end: MAJOR_CITIES['Philadelphia'],
        distance: 95,
        duration: '1 hour 30 min',
      },
      {
        start: MAJOR_CITIES['Philadelphia'],
        end: MAJOR_CITIES['Columbus'],
        distance: 370,
        duration: '5 hours 30 min',
      },
      {
        start: MAJOR_CITIES['Columbus'],
        end: MAJOR_CITIES['Indianapolis'],
        distance: 175,
        duration: '2 hours 45 min',
      },
      {
        start: MAJOR_CITIES['Indianapolis'],
        end: MAJOR_CITIES['Dallas'],
        distance: 900,
        duration: '13 hours',
      },
      {
        start: MAJOR_CITIES['Dallas'],
        end: MAJOR_CITIES['Phoenix'],
        distance: 1050,
        duration: '15 hours',
      },
      {
        start: MAJOR_CITIES['Phoenix'],
        end: MAJOR_CITIES['Los Angeles'],
        distance: 399,
        duration: '6 hours',
      },
    ],
    coordinates: [
      [40.7128, -74.006],
      [39.9526, -75.1652],
      [39.9612, -82.9988],
      [39.7684, -86.1581],
      [32.7767, -96.797],
      [33.4484, -112.074],
      [34.0522, -118.2437],
    ],
  },
  {
    id: 'route-2',
    name: 'San Jose to New York (West to East)',
    from: 'San Jose',
    to: 'New York',
    distance: 2900,
    duration: '42 hours',
    segments: [
      {
        start: MAJOR_CITIES['San Jose'],
        end: MAJOR_CITIES['Denver'],
        distance: 1200,
        duration: '17 hours',
      },
      {
        start: MAJOR_CITIES['Denver'],
        end: MAJOR_CITIES['Chicago'],
        distance: 920,
        duration: '13 hours',
      },
      {
        start: MAJOR_CITIES['Chicago'],
        end: MAJOR_CITIES['Boston'],
        distance: 980,
        duration: '14 hours',
      },
      {
        start: MAJOR_CITIES['Boston'],
        end: MAJOR_CITIES['New York'],
        distance: 215,
        duration: '3 hours 30 min',
      },
    ],
    coordinates: [
      [37.3382, -121.8863],
      [39.7392, -104.9903],
      [41.8781, -87.6298],
      [42.3601, -71.0589],
      [40.7128, -74.006],
    ],
  },
  {
    id: 'route-3',
    name: 'Miami to Seattle (South to North)',
    from: 'Miami',
    to: 'Seattle',
    distance: 3300,
    duration: '48 hours',
    segments: [
      {
        start: MAJOR_CITIES['Miami'],
        end: MAJOR_CITIES['Atlanta'],
        distance: 660,
        duration: '9 hours 30 min',
      },
      {
        start: MAJOR_CITIES['Atlanta'],
        end: MAJOR_CITIES['Chicago'],
        distance: 720,
        duration: '10 hours 30 min',
      },
      {
        start: MAJOR_CITIES['Chicago'],
        end: MAJOR_CITIES['Denver'],
        distance: 920,
        duration: '13 hours',
      },
      {
        start: MAJOR_CITIES['Denver'],
        end: MAJOR_CITIES['Seattle'],
        distance: 1300,
        duration: '18 hours',
      },
    ],
    coordinates: [
      [25.7617, -80.1918],
      [33.749, -84.388],
      [41.8781, -87.6298],
      [39.7392, -104.9903],
      [47.6062, -122.3321],
    ],
  },
  {
    id: 'route-4',
    name: 'Los Angeles to Houston (Southwest Route)',
    from: 'Los Angeles',
    to: 'Houston',
    distance: 1547,
    duration: '22 hours 30 min',
    segments: [
      {
        start: MAJOR_CITIES['Los Angeles'],
        end: MAJOR_CITIES['Phoenix'],
        distance: 399,
        duration: '6 hours',
      },
      {
        start: MAJOR_CITIES['Phoenix'],
        end: MAJOR_CITIES['Dallas'],
        distance: 1050,
        duration: '15 hours',
      },
      {
        start: MAJOR_CITIES['Dallas'],
        end: MAJOR_CITIES['Houston'],
        distance: 240,
        duration: '3 hours 30 min',
      },
    ],
    coordinates: [
      [34.0522, -118.2437],
      [33.4484, -112.074],
      [32.7767, -96.797],
      [29.7604, -95.3698],
    ],
  },
  {
    id: 'route-5',
    name: 'Boston to Miami (Northeast to Southeast)',
    from: 'Boston',
    to: 'Miami',
    distance: 1540,
    duration: '22 hours',
    segments: [
      {
        start: MAJOR_CITIES['Boston'],
        end: MAJOR_CITIES['Philadelphia'],
        distance: 305,
        duration: '5 hours',
      },
      {
        start: MAJOR_CITIES['Philadelphia'],
        end: MAJOR_CITIES['Atlanta'],
        distance: 640,
        duration: '9 hours 30 min',
      },
      {
        start: MAJOR_CITIES['Atlanta'],
        end: MAJOR_CITIES['Jacksonville'],
        distance: 345,
        duration: '5 hours',
      },
      {
        start: MAJOR_CITIES['Jacksonville'],
        end: MAJOR_CITIES['Miami'],
        distance: 350,
        duration: '5 hours',
      },
    ],
    coordinates: [
      [42.3601, -71.0589],
      [39.9526, -75.1652],
      [33.749, -84.388],
      [30.3322, -81.6557],
      [25.7617, -80.1918],
    ],
  },
  {
    id: 'route-6',
    name: 'Chicago to Los Angeles (Midwest to West)',
    from: 'Chicago',
    to: 'Los Angeles',
    distance: 2015,
    duration: '29 hours',
    segments: [
      {
        start: MAJOR_CITIES['Chicago'],
        end: MAJOR_CITIES['Denver'],
        distance: 920,
        duration: '13 hours',
      },
      {
        start: MAJOR_CITIES['Denver'],
        end: MAJOR_CITIES['Phoenix'],
        distance: 600,
        duration: '8 hours 30 min',
      },
      {
        start: MAJOR_CITIES['Phoenix'],
        end: MAJOR_CITIES['Los Angeles'],
        distance: 399,
        duration: '6 hours',
      },
    ],
    coordinates: [
      [41.8781, -87.6298],
      [39.7392, -104.9903],
      [33.4484, -112.074],
      [34.0522, -118.2437],
    ],
  },
  {
    id: 'route-7',
    name: 'Dallas to Seattle (Texas to Pacific Northwest)',
    from: 'Dallas',
    to: 'Seattle',
    distance: 2100,
    duration: '30 hours',
    segments: [
      {
        start: MAJOR_CITIES['Dallas'],
        end: MAJOR_CITIES['Denver'],
        distance: 780,
        duration: '11 hours',
      },
      {
        start: MAJOR_CITIES['Denver'],
        end: MAJOR_CITIES['Seattle'],
        distance: 1300,
        duration: '18 hours',
      },
    ],
    coordinates: [
      [32.7767, -96.797],
      [39.7392, -104.9903],
      [47.6062, -122.3321],
    ],
  },
  {
    id: 'route-8',
    name: 'Atlanta to San Diego (Southeast to Southwest)',
    from: 'Atlanta',
    to: 'San Diego',
    distance: 2350,
    duration: '34 hours',
    segments: [
      {
        start: MAJOR_CITIES['Atlanta'],
        end: MAJOR_CITIES['Dallas'],
        distance: 780,
        duration: '11 hours',
      },
      {
        start: MAJOR_CITIES['Dallas'],
        end: MAJOR_CITIES['Phoenix'],
        distance: 1050,
        duration: '15 hours',
      },
      {
        start: MAJOR_CITIES['Phoenix'],
        end: MAJOR_CITIES['San Diego'],
        distance: 355,
        duration: '5 hours',
      },
    ],
    coordinates: [
      [33.749, -84.388],
      [32.7767, -96.797],
      [33.4484, -112.074],
      [32.7157, -117.1611],
    ],
  },
  {
    id: 'route-9',
    name: 'New York to Austin (Northeast to Central)',
    from: 'New York',
    to: 'Austin',
    distance: 1800,
    duration: '26 hours',
    segments: [
      {
        start: MAJOR_CITIES['New York'],
        end: MAJOR_CITIES['Indianapolis'],
        distance: 700,
        duration: '10 hours',
      },
      {
        start: MAJOR_CITIES['Indianapolis'],
        end: MAJOR_CITIES['Dallas'],
        distance: 900,
        duration: '13 hours',
      },
      {
        start: MAJOR_CITIES['Dallas'],
        end: MAJOR_CITIES['Austin'],
        distance: 195,
        duration: '3 hours',
      },
    ],
    coordinates: [
      [40.7128, -74.006],
      [39.7684, -86.1581],
      [32.7767, -96.797],
      [30.2672, -97.7431],
    ],
  },
  {
    id: 'route-10',
    name: 'San Jose to Miami (Coast to Coast South)',
    from: 'San Jose',
    to: 'Miami',
    distance: 2800,
    duration: '40 hours',
    segments: [
      {
        start: MAJOR_CITIES['San Jose'],
        end: MAJOR_CITIES['Phoenix'],
        distance: 700,
        duration: '10 hours',
      },
      {
        start: MAJOR_CITIES['Phoenix'],
        end: MAJOR_CITIES['Houston'],
        distance: 1100,
        duration: '15 hours 30 min',
      },
      {
        start: MAJOR_CITIES['Houston'],
        end: MAJOR_CITIES['Jacksonville'],
        distance: 900,
        duration: '13 hours',
      },
      {
        start: MAJOR_CITIES['Jacksonville'],
        end: MAJOR_CITIES['Miami'],
        distance: 350,
        duration: '5 hours',
      },
    ],
    coordinates: [
      [37.3382, -121.8863],
      [33.4484, -112.074],
      [29.7604, -95.3698],
      [30.3322, -81.6557],
      [25.7617, -80.1918],
    ],
  },
];

export const getRouteById = (id: string): Route | undefined => {
  return PREDEFINED_ROUTES.find((route) => route.id === id);
};

export const getAllRoutes = (): Route[] => {
  return PREDEFINED_ROUTES;
};
