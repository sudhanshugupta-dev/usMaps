# 🔧 Debugging Guide - Layer Loading Issues

## Problem Fixed

**Issue**: Layers were returning `false` in terminal and not loading on map  
**Root Cause**: URL query parameter handling - endpoints already had `?f=geojson` but code was appending it again  
**Solution**: Updated `fetchGeoJSON()` to check for existing query parameters

---

## Changes Made

### 1. Fixed URL Parameter Handling
**File**: `app/maps/index.tsx` (lines 359-375)

**Before**:
```javascript
async function fetchGeoJSON(url) {
  const response = await fetch(`${url}?f=geojson`);
  // This would create: URL?f=geojson?f=geojson (WRONG)
}
```

**After**:
```javascript
async function fetchGeoJSON(url) {
  const separator = url.includes('?') ? '&' : '?';
  const finalUrl = url.includes('f=geojson') ? url : `${url}${separator}f=geojson`;
  const response = await fetch(finalUrl);
  // This correctly handles: URL?f=geojson or URL?where=1=1&f=geojson
}
```

### 2. Enhanced Logging
Added comprehensive logging throughout the layer loading pipeline:

**loadLayer()** - Logs:
- Layer ID, type, and URL
- GeoJSON fetch status
- Number of features received
- Layer creation type (heatmap, cluster, or standard)
- Success/failure with error messages

**toggleLayer()** - Logs:
- Layer toggle request
- Layer registry lookup
- Show/hide action
- Final visibility state

**handleMapMessage()** - Logs:
- Message type received
- Layer state before toggle
- Load vs toggle decision
- Timing of operations

---

## How to Debug Layer Loading

### Step 1: Open Browser Console
1. Open React Native debugger
2. Go to Console tab
3. Look for messages starting with `[loadLayer]`, `[toggleLayer]`, `[handleMapMessage]`

### Step 2: Check Console Output

When you click a layer, you should see:

```
[handleMapMessage] Received message: {type: "toggleLayer", layerId: "political-boundaries", url: "https://...", layerType: "geojson"}
[handleMapMessage] Toggle layer request: political-boundaries
[handleMapMessage] Layer state: undefined
[handleMapMessage] Layer not loaded, loading first...
[loadLayer] Starting to load layer: political-boundaries, type: geojson, url: https://...
[loadLayer] Fetching GeoJSON for political-boundaries
Fetching from: https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2/query?where=1=1&outFields=*&f=geojson
GeoJSON data received: {type: "FeatureCollection", features: Array(51)}
[loadLayer] GeoJSON fetched successfully, features: 51
[loadLayer] Creating GeoJSON layer for political-boundaries
[loadLayer] Layer political-boundaries loaded successfully and stored in registry
[handleMapMessage] Now toggling layer after load
[toggleLayer] Toggling layer: political-boundaries
[toggleLayer] Showing layer political-boundaries
[toggleLayer] Layer political-boundaries is now visible
```

### Step 3: Identify Issues

**Issue**: `GeoJSON data received: null`
- **Cause**: API endpoint not returning data
- **Fix**: Verify endpoint URL is correct and returns valid GeoJSON

**Issue**: `Layer not found in registry`
- **Cause**: Layer didn't load successfully
- **Fix**: Check console for fetch errors above

**Issue**: `GeoJSON has no features`
- **Cause**: API returned empty feature collection
- **Fix**: Verify endpoint has data for the query

---

## Testing Each Layer

### Test Political Boundaries
```
Expected console output:
- GeoJSON fetched successfully, features: 51
- Layer political-boundaries loaded successfully
- Layer political-boundaries is now visible
```

### Test County Map
```
Expected console output:
- GeoJSON fetched successfully, features: 3221
- Layer county-map loaded successfully
- Layer county-map is now visible
```

### Test Earthquakes Heatmap
```
Expected console output:
- GeoJSON fetched successfully, features: 7000+
- Creating heatmap layer for heatmap
- Layer heatmap loaded successfully
- Layer heatmap is now visible
```

### Test Cluster Map
```
Expected console output:
- GeoJSON fetched successfully, features: 51
- Creating cluster layer for cluster-map
- Layer cluster-map loaded successfully
- Layer cluster-map is now visible
```

### Test Hurricanes
```
Expected console output:
- GeoJSON fetched successfully, features: 100+
- Layer hazards loaded successfully
- Layer hazards is now visible
```

---

## Common Issues & Solutions

### Issue 1: "Layer not found in registry"
**Symptoms**: Layer doesn't appear on map, console shows error

**Debug Steps**:
1. Check if layer loaded successfully (look for "loaded successfully" message)
2. Check if fetch returned data (look for "GeoJSON data received")
3. Verify URL is correct in layersConfig.ts

**Solution**:
```javascript
// Check in console what's in the registry
window.mapAPI.getLayerRegistry()
```

### Issue 2: "Failed to fetch GeoJSON"
**Symptoms**: Layer shows error in console

**Debug Steps**:
1. Check the URL being fetched
2. Test URL directly in browser
3. Verify endpoint is returning 200 status

**Solution**:
```bash
# Test endpoint directly
curl "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2/query?where=1=1&outFields=*&f=geojson"
```

### Issue 3: "GeoJSON has no features"
**Symptoms**: Layer loads but shows nothing on map

**Debug Steps**:
1. Check if features array is empty
2. Verify endpoint has data
3. Check zoom level (some layers only show at certain zoom levels)

**Solution**:
```javascript
// Check features in console
const layer = window.mapAPI.getLayerRegistry()['layer-id'];
console.log(layer.toGeoJSON());
```

### Issue 4: Heatmap not showing gradient
**Symptoms**: Heatmap loads but shows as solid color

**Debug Steps**:
1. Check if features have intensity values
2. Verify heatmap plugin is loaded
3. Check zoom level

**Solution**:
```javascript
// Verify heatmap data
const data = await fetch('...').then(r => r.json());
console.log(data.features[0].properties);
```

---

## Console Commands for Testing

### Get all active layers
```javascript
window.mapAPI.getActiveLayers()
```

### Get layer registry
```javascript
window.mapAPI.getLayerRegistry()
```

### Manually load a layer
```javascript
window.mapAPI.loadLayer(
  'political-boundaries',
  'https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2/query?where=1=1&outFields=*&f=geojson',
  'geojson'
)
```

### Manually toggle a layer
```javascript
window.mapAPI.toggleLayer('political-boundaries')
```

### Clear all layers
```javascript
window.mapAPI.clearAllLayers()
```

### Check layer state
```javascript
// In the WebView console
console.log(layerStates)
console.log(layersRegistry)
console.log(activeLayers)
```

---

## Performance Monitoring

### Check loading time
```javascript
// In console, before toggling layer
console.time('layer-load');
// Toggle layer
// Check console for time
```

### Monitor memory
- Watch for increasing memory usage when toggling layers
- Should stabilize after layer loads
- Clearing layers should reduce memory

### Check feature count
```javascript
// After layer loads
const layer = window.mapAPI.getLayerRegistry()['layer-id'];
const geoJson = layer.toGeoJSON();
console.log('Features:', geoJson.features.length);
```

---

## Network Debugging

### Check API responses
1. Open Network tab in browser DevTools
2. Toggle a layer
3. Look for requests to Esri endpoints
4. Check response status (should be 200)
5. Check response size (should be > 0 bytes)
6. Check response time (should be < 5 seconds)

### Common HTTP errors
- **404**: Endpoint not found - verify URL
- **500**: Server error - try different endpoint
- **CORS**: Cross-origin issue - shouldn't happen with Esri
- **Timeout**: Network too slow - try again

---

## Logging Levels

### Debug Logs (shown always)
- `[loadLayer]` - Layer loading progress
- `[toggleLayer]` - Layer visibility changes
- `[handleMapMessage]` - Message handling
- `Fetching from:` - URL being fetched
- `GeoJSON data received:` - Data received

### Warning Logs (shown when issues)
- `GeoJSON has no features` - Empty response
- `Layer not found in registry` - Layer not loaded
- `State not found for layer` - Internal error

### Error Logs (shown on failure)
- `Error fetching GeoJSON:` - Network error
- `Error loading layer:` - Layer creation error
- `Error handling message:` - Message parsing error

---

## Quick Troubleshooting Checklist

- [ ] Check console for `[loadLayer]` messages
- [ ] Verify URL is correct in layersConfig.ts
- [ ] Check if GeoJSON data is received
- [ ] Verify layer is created (heatmap, cluster, or standard)
- [ ] Check if layer is added to registry
- [ ] Verify layer is toggled visible
- [ ] Check if layer appears on map
- [ ] Test endpoint directly in browser
- [ ] Check network tab for API responses
- [ ] Verify zoom level is appropriate for layer

---

## Success Indicators

✅ Console shows `[loadLayer] Layer X loaded successfully`  
✅ Console shows `[toggleLayer] Layer X is now visible`  
✅ Layer appears on map with correct styling  
✅ Layer features are clickable (popups work)  
✅ Zoom/pan works with layer visible  
✅ No errors in console  

---

**Status**: ✅ Debugging infrastructure in place  
**Last Updated**: November 3, 2025
