/**
 * Map Layer Type Definitions
 * Defines all layer types and configurations for the map visualization system
 */

export interface EsriLayer {
  id: string;
  name: string;
  url: string;
  type: 'geojson' | 'tile' | 'feature';
  category: LayerCategory;
  enabled: boolean;
  opacity?: number;
  color?: string;
  description?: string;
}

export type LayerCategory =
  | 'base'
  | 'satellite'
  | 'political'
  | 'county'
  | 'choropleth'
  | 'heatmap'
  | 'cluster'
  | 'region'
  | 'hydrology'
  | 'utilities'
  | 'hazards'
  | 'demographics';

export interface MapMenuState {
  isOpen: boolean;
  selectedLayerId: string | null;
  activeLayers: Set<string>;
}

export interface MapMessage {
  type: 'toggleLayer' | 'setOpacity' | 'clearLayers' | 'fitBounds' | 'showRoute' | 'clearRoute';
  layerId?: string;
  opacity?: number;
  bounds?: [[number, number], [number, number]];
  routeId?: string;
  coordinates?: [number, number][];
  routeName?: string;
}

export interface MapResponse {
  type: 'layerToggled' | 'layerLoaded' | 'error';
  layerId?: string;
  message?: string;
  success: boolean;
}

export interface LayerGroup {
  category: LayerCategory;
  name: string;
  layers: EsriLayer[];
}
