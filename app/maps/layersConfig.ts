/**
 * Centralized configuration for all Esri REST API layers
 * Defines 12 map types with their respective endpoints and properties
 */

import { EsriLayer, LayerGroup } from '@/types/map';

const ESRI_BASE_URL = 'https://sampleserver6.arcgisonline.com/arcgis/rest/services';

/**
 * All 12 map layer configurations
 */
export const ALL_LAYERS: EsriLayer[] = [
  // 1. Street / Physical / Terrain (Base)
  {
    id: 'street-base',
    name: 'Street Map',
    url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer',
    type: 'tile',
    category: 'base',
    enabled: true,
    opacity: 1,
    color: '#1f77b4',
    description: 'World street map with detailed roads and labels',
  },

  // 2. Satellite Map
  {
    id: 'satellite',
    name: 'Satellite Imagery',
    url: `${ESRI_BASE_URL}/World_Imagery/MapServer`,
    type: 'tile',
    category: 'satellite',
    enabled: false,
    opacity: 0.8,
    description: 'Satellite imagery from Esri',
  },

  // 3. Political / State Boundaries
  {
    id: 'political-boundaries',
    name: 'Political Boundaries',
    url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2/query?where=1=1&outFields=*&f=geojson',
    type: 'geojson',
    category: 'political',
    enabled: false,
    opacity: 0.7,
    color: '#ff7f0e',
    description: 'State and political boundaries',
  },

  // 4. County-Level Map
  {
    id: 'county-map',
    name: 'County Boundaries',
    url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/3/query?where=1=1&outFields=*&f=geojson',
    type: 'geojson',
    category: 'county',
    enabled: false,
    opacity: 0.6,
    color: '#2ca02c',
    description: 'County-level administrative boundaries',
  },

  // 5. Choropleth (color-coded by data)
  {
    id: 'choropleth',
    name: 'Choropleth Map',
    url: `${ESRI_BASE_URL}/Census/MapServer`,
    type: 'geojson',
    category: 'choropleth',
    enabled: false,
    opacity: 0.7,
    color: '#d62728',
    description: 'Color-coded data visualization by region',
  },

  // 6. Heatmap (density)
  {
    id: 'heatmap',
    name: 'Earthquakes Heatmap',
    url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Earthquakes_Since1970/MapServer/0/query?where=1=1&outFields=*&f=geojson',
    type: 'geojson',
    category: 'heatmap',
    enabled: false,
    opacity: 0.6,
    color: '#9467bd',
    description: 'Earthquake density heatmap visualization',
  },

  // 7. Cluster Map (grouped markers)
  {
    id: 'cluster-map',
    name: 'Clustered Points',
    url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/0/query?where=1=1&outFields=*&f=geojson',
    type: 'geojson',
    category: 'cluster',
    enabled: false,
    opacity: 0.8,
    color: '#8c564b',
    description: 'Clustered point data visualization',
  },

  // 8. Region / Custom Boundary Map
  {
    id: 'region-boundaries',
    name: 'Regional Boundaries',
    url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/3/query?where=1=1&outFields=*&f=geojson',
    type: 'geojson',
    category: 'region',
    enabled: false,
    opacity: 0.7,
    color: '#e377c2',
    description: 'Custom regional boundary definitions',
  },

  // 9. Hydrology / Water
  {
    id: 'hydrology',
    name: 'Hydrology & Water',
    url: `${ESRI_BASE_URL}/Hydrography/MapServer`,
    type: 'geojson',
    category: 'hydrology',
    enabled: false,
    opacity: 0.7,
    color: '#17becf',
    description: 'Water bodies, rivers, and hydrological features',
  },

  // 10. Utilities / Infrastructure
  {
    id: 'utilities',
    name: 'Utilities & Infrastructure',
    url: `${ESRI_BASE_URL}/Utilities/MapServer`,
    type: 'geojson',
    category: 'utilities',
    enabled: false,
    opacity: 0.6,
    color: '#bcbd22',
    description: 'Infrastructure and utility networks',
  },

  // 11. Natural Hazards / Weather Radar
  {
    id: 'hazards',
    name: 'Hurricanes & Natural Hazards',
    url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Hurricanes/MapServer/0/query?where=1=1&outFields=*&f=geojson',
    type: 'geojson',
    category: 'hazards',
    enabled: false,
    opacity: 0.7,
    color: '#ff9896',
    description: 'Hurricane tracks and natural hazard data',
  },

  // 12. Demographics / Population Density
  {
    id: 'demographics',
    name: 'Demographics & Population',
    url: `${ESRI_BASE_URL}/Census/MapServer/2`,
    type: 'geojson',
    category: 'demographics',
    enabled: false,
    opacity: 0.65,
    color: '#98df8a',
    description: 'Demographic and population statistics',
  },
];

/**
 * Grouped layers by category for menu organization
 */
export const LAYER_GROUPS: LayerGroup[] = [
  {
    category: 'base',
    name: '🏙️ Base Maps',
    layers: ALL_LAYERS.filter((l) => l.category === 'base'),
  },
  {
    category: 'satellite',
    name: '🛰️ Satellite',
    layers: ALL_LAYERS.filter((l) => l.category === 'satellite'),
  },
  {
    category: 'political',
    name: '🗽 Political',
    layers: ALL_LAYERS.filter((l) => l.category === 'political'),
  },
  {
    category: 'county',
    name: '🧩 County',
    layers: ALL_LAYERS.filter((l) => l.category === 'county'),
  },
  {
    category: 'choropleth',
    name: '🌈 Choropleth',
    layers: ALL_LAYERS.filter((l) => l.category === 'choropleth'),
  },
  {
    category: 'heatmap',
    name: '🔥 Heatmap',
    layers: ALL_LAYERS.filter((l) => l.category === 'heatmap'),
  },
  {
    category: 'cluster',
    name: '📍 Clusters',
    layers: ALL_LAYERS.filter((l) => l.category === 'cluster'),
  },
  {
    category: 'region',
    name: '🗾 Regions',
    layers: ALL_LAYERS.filter((l) => l.category === 'region'),
  },
  {
    category: 'hydrology',
    name: '💧 Hydrology',
    layers: ALL_LAYERS.filter((l) => l.category === 'hydrology'),
  },
  {
    category: 'utilities',
    name: '⚙️ Utilities',
    layers: ALL_LAYERS.filter((l) => l.category === 'utilities'),
  },
  {
    category: 'hazards',
    name: '🌋 Hazards',
    layers: ALL_LAYERS.filter((l) => l.category === 'hazards'),
  },
  {
    category: 'demographics',
    name: '👥 Demographics',
    layers: ALL_LAYERS.filter((l) => l.category === 'demographics'),
  },
];

/**
 * Get layer by ID
 */
export const getLayerById = (id: string): EsriLayer | undefined => {
  return ALL_LAYERS.find((layer) => layer.id === id);
};

/**
 * Get layers by category
 */
export const getLayersByCategory = (category: string): EsriLayer[] => {
  return ALL_LAYERS.filter((layer) => layer.category === category);
};

/**
 * Get all enabled layers
 */
export const getEnabledLayers = (): EsriLayer[] => {
  return ALL_LAYERS.filter((layer) => layer.enabled);
};
