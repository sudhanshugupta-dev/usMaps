# 🗺️ Interactive Map Visualization System

A comprehensive TV-compatible React Native (Expo) map visualization system with Leaflet, WebView integration, and 12 different map layer types using Esri REST API endpoints.

## 📋 Overview

This system provides a complete map viewing experience with:
- **Base Map**: OpenStreetMap tiles
- **12 Layer Types**: Street, Satellite, Political, County, Choropleth, Heatmap, Cluster, Region, Hydrology, Utilities, Hazards, Demographics
- **TV-Friendly Controls**: Side menu with D-pad navigation support
- **Dynamic Layer Management**: Toggle layers on/off without reloading
- **Leaflet Integration**: Full-featured mapping via WebView

## 📁 Project Structure

```
/app
  /maps
    index.tsx              # Main map screen with WebView
    MapView.html           # Leaflet HTML (embedded in index.tsx)
    layersConfig.ts        # Centralized layer configuration
  _layout.tsx              # Updated with maps route
  index.tsx                # Home screen with map navigation

/components
  MapMenu.tsx              # TV-friendly layer control menu

/types
  map.d.ts                 # TypeScript type definitions
```

## 🚀 Getting Started

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

The `react-native-webview` dependency has been added to `package.json`.

### Running the App

For TV (Android TV/Apple TV):
```bash
npm run start
# or with EXPO_TV flag
EXPO_TV=1 expo start
```

For Android:
```bash
npm run android
```

For iOS:
```bash
npm run ios
```

For Web:
```bash
npm run web
```

## 🗺️ Map Layers (12 Total)

### 1. **Street Map** (Base)
- **ID**: `street-base`
- **Source**: Esri USA MapServer
- **Type**: GeoJSON
- **Description**: Street and physical map of USA

### 2. **Satellite Imagery**
- **ID**: `satellite`
- **Source**: Esri World Imagery
- **Type**: Tile
- **Description**: Satellite imagery from Esri

### 3. **Political Boundaries**
- **ID**: `political-boundaries`
- **Source**: Esri USA MapServer (Layer 1)
- **Type**: GeoJSON
- **Description**: State and political boundaries

### 4. **County Boundaries**
- **ID**: `county-map`
- **Source**: Esri USA MapServer (Layer 2)
- **Type**: GeoJSON
- **Description**: County-level administrative boundaries

### 5. **Choropleth Map**
- **ID**: `choropleth`
- **Source**: Esri Census MapServer
- **Type**: GeoJSON
- **Description**: Color-coded data visualization by region

### 6. **Population Density Heatmap**
- **ID**: `heatmap`
- **Source**: Esri Census MapServer (Layer 1)
- **Type**: GeoJSON (rendered as heatmap)
- **Description**: Population density heatmap visualization

### 7. **Clustered Points**
- **ID**: `cluster-map`
- **Source**: Esri USA MapServer (Layer 3)
- **Type**: GeoJSON (rendered as clusters)
- **Description**: Clustered point data visualization

### 8. **Regional Boundaries**
- **ID**: `region-boundaries`
- **Source**: Esri USA MapServer (Layer 4)
- **Type**: GeoJSON
- **Description**: Custom regional boundary definitions

### 9. **Hydrology & Water**
- **ID**: `hydrology`
- **Source**: Esri Hydrography MapServer
- **Type**: GeoJSON
- **Description**: Water bodies, rivers, and hydrological features

### 10. **Utilities & Infrastructure**
- **ID**: `utilities`
- **Source**: Esri Utilities MapServer
- **Type**: GeoJSON
- **Description**: Infrastructure and utility networks

### 11. **Natural Hazards & Weather**
- **ID**: `hazards`
- **Source**: Esri Weather MapServer
- **Type**: GeoJSON
- **Description**: Natural hazards and weather radar data

### 12. **Demographics & Population**
- **ID**: `demographics`
- **Source**: Esri Census MapServer (Layer 2)
- **Type**: GeoJSON
- **Description**: Demographic and population statistics

## 🎮 Usage

### Accessing the Map

1. Launch the app
2. On the home screen, tap **"Open Map Viewer"** button
3. The map screen will load with OpenStreetMap as the base

### Toggling Layers

1. Tap the **☰ (hamburger menu)** button in the top-left
2. The side menu will slide in from the left
3. Expand layer categories by tapping the group headers
4. Tap any layer to toggle it on/off
5. Active layers are highlighted in green

### Menu Features

- **Layer Groups**: Organized by category (Base, Satellite, Political, etc.)
- **Active Counter**: Shows number of active layers at the bottom
- **Clear All**: Red button to remove all active layers
- **Close Button**: ✕ to close the menu
- **TV-Friendly**: Full D-pad navigation support

## 💻 API Reference

### WebView Message Protocol

The map communicates with React Native via `postMessage` and `onMessage`.

#### Messages from React Native to WebView

```typescript
// Toggle a layer
{
  type: 'toggleLayer',
  layerId: string,
  url?: string,        // Required for first toggle
  layerType?: string   // 'geojson' | 'tile' | 'feature'
}

// Set layer opacity
{
  type: 'setOpacity',
  layerId: string,
  opacity: number      // 0-1
}

// Clear all layers
{
  type: 'clearLayers'
}

// Fit map to bounds
{
  type: 'fitBounds',
  bounds: [[lat, lng], [lat, lng]]
}
```

#### Messages from WebView to React Native

```typescript
// Map ready
{
  type: 'mapReady',
  success: boolean
}

// Layer toggled
{
  type: 'layerToggled',
  layerId: string,
  visible: boolean
}

// Layer loaded
{
  type: 'layerLoaded',
  layerId: string,
  success: boolean,
  message?: string
}

// Error
{
  type: 'error',
  message: string
}
```

### JavaScript API (in WebView)

```javascript
// Access via window.mapAPI

// Load a layer
mapAPI.loadLayer(layerId, url, layerType)

// Toggle layer visibility
mapAPI.toggleLayer(layerId)

// Set layer opacity
mapAPI.setLayerOpacity(layerId, opacity)

// Clear all layers
mapAPI.clearAllLayers()

// Fit to bounds
mapAPI.fitBounds([[lat, lng], [lat, lng]])

// Get active layers
mapAPI.getActiveLayers()

// Get layer registry
mapAPI.getLayerRegistry()
```

## 🎨 Styling & Customization

### Layer Colors

Each layer has a default color defined in `layersConfig.ts`:

```typescript
{
  id: 'layer-id',
  name: 'Layer Name',
  url: 'https://...',
  type: 'geojson',
  category: 'category',
  enabled: false,
  opacity: 0.7,
  color: '#1f77b4',  // Hex color
  description: 'Description'
}
```

### Menu Styling

Customize the menu in `components/MapMenu.tsx`:
- Colors: Modify `useMapMenuStyles`
- Width: Change `width: 350 * scale`
- Animation: Adjust `Animated.timing` duration

### Map Styling

Customize the map in `app/maps/index.tsx`:
- Center: Change `setView([37.8, -96], 4)`
- Zoom: Adjust the zoom level (4)
- Base tiles: Modify the `L.tileLayer` URL

## 🔧 Configuration

### Adding New Layers

1. Add to `ALL_LAYERS` array in `layersConfig.ts`:

```typescript
{
  id: 'new-layer',
  name: 'New Layer',
  url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/...',
  type: 'geojson',
  category: 'category',
  enabled: false,
  opacity: 0.7,
  color: '#color',
  description: 'Description'
}
```

2. Add to `LAYER_GROUPS` if creating a new category:

```typescript
{
  category: 'new-category',
  name: '🎨 New Category',
  layers: ALL_LAYERS.filter((l) => l.category === 'new-category'),
}
```

### Esri REST API Endpoints

Base URL: `https://sampleserver6.arcgisonline.com/arcgis/rest/services`

Available services:
- `/USA/MapServer` - USA boundaries and regions
- `/Hydrography/MapServer` - Water and hydrology
- `/Census/MapServer` - Census and demographic data
- `/Weather/MapServer` - Weather and hazards
- `/Utilities/MapServer` - Infrastructure
- `/World_Imagery/MapServer` - Satellite imagery

To fetch GeoJSON: `{URL}?f=geojson`

## 📦 Dependencies

### Core
- `react-native-webview@^13.6.0` - WebView for Leaflet
- `expo-router@~6.0.13` - Navigation
- `react-native-reanimated@~4.1.1` - Animations

### Leaflet (via CDN in HTML)
- Leaflet 1.9.4 - Base mapping library
- Leaflet Heat - Heatmap visualization
- Leaflet MarkerCluster - Point clustering

## 🐛 Troubleshooting

### Map not loading
- Check internet connection (Esri endpoints require network access)
- Verify WebView is enabled in app.json
- Check browser console for errors (use React Native debugger)

### Layers not appearing
- Verify Esri endpoint URLs are correct
- Check GeoJSON response format
- Ensure layer type matches data format

### Menu not responding
- Verify `react-native-reanimated` is properly installed
- Check accessibility settings on device
- Ensure WebView message handler is registered

### Performance issues
- Reduce number of active layers
- Lower zoom level to reduce data
- Disable heatmap for large datasets
- Use tile layers instead of GeoJSON for large areas

## 📱 TV Compatibility

### D-Pad Navigation
- **Up/Down**: Scroll menu
- **Left/Right**: Expand/collapse groups
- **Select**: Toggle layer
- **Back**: Close menu

### Remote Control
- Full remote support via standard React Native accessibility
- Focus management for TV UI
- Large touch targets (48x48 minimum)

## 🌐 Browser Support

- **Android**: Android 5.0+
- **iOS**: iOS 11.0+
- **Web**: Chrome, Firefox, Safari (via Expo Web)
- **TV**: Android TV, Apple TV (via Expo TV)

## 📄 License

This project is part of the Expo Router TV starter template.

## 🤝 Contributing

To extend the map system:

1. Add new layers to `layersConfig.ts`
2. Update `MapMenu.tsx` for UI changes
3. Modify `MapView.html` for Leaflet customizations
4. Test on TV device for accessibility

## 📚 Resources

- [Leaflet Documentation](https://leafletjs.com/)
- [Esri REST API](https://developers.arcgis.com/rest/)
- [React Native WebView](https://github.com/react-native-webview/react-native-webview)
- [Expo Router](https://expo.dev/routing)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

---

**Version**: 1.0.0  
**Last Updated**: 2025  
**Status**: Production Ready
