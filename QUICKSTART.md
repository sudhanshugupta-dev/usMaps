# 🚀 Quick Start Guide - Map Viewer

Get the interactive map system running in 3 steps!

## 1️⃣ Install Dependencies

```bash
cd /home/bitcot/Desktop/RNUSMAPS/usMaps
npm install
```

This installs all required packages including `react-native-webview@^13.6.0`.

## 2️⃣ Start the Development Server

For TV (recommended):
```bash
npm run start
# or
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

## 3️⃣ Navigate to the Map

1. The app will start on the home screen
2. Tap the blue **"Open Map Viewer"** button
3. The map will load with OpenStreetMap as the base layer

## 🎮 Using the Map

### Toggle Layers
- Tap the **☰** (hamburger menu) button in the top-left corner
- The side menu slides in from the left
- Tap category headers to expand/collapse
- Tap any layer to toggle it on/off
- Green highlighting shows active layers

### Available Layer Categories
- 🏙️ Base Maps
- 🛰️ Satellite
- 🗽 Political
- 🧩 County
- 🌈 Choropleth
- 🔥 Heatmap
- 📍 Clusters
- 🗾 Regions
- 💧 Hydrology
- ⚙️ Utilities
- 🌋 Hazards
- 👥 Demographics

### Clear All Layers
- Tap the red **"Clear All Layers"** button at the top of the menu
- All active layers will be removed instantly

### Close Menu
- Tap the **✕** button in the menu header
- Or tap outside the menu area

## 🗺️ Map Controls

- **Zoom In/Out**: Pinch or use map controls
- **Pan**: Drag the map
- **Tap Features**: Click on map features to see details in popups

## 📱 TV Remote Control

- **D-Pad Up/Down**: Scroll through menu
- **D-Pad Left/Right**: Expand/collapse groups
- **Select/OK**: Toggle layer
- **Back**: Close menu

## 🔍 Troubleshooting

### Map won't load
```
✓ Check internet connection
✓ Verify WebView is enabled
✓ Check React Native debugger console
```

### Layers not showing
```
✓ Ensure layer is toggled on (green highlight)
✓ Check if multiple layers are overlapping
✓ Try zooming in/out
```

### Menu not responding
```
✓ Tap the ☰ button again
✓ Restart the app
✓ Check device accessibility settings
```

## 📂 Key Files

| File | Purpose |
|------|---------|
| `app/maps/index.tsx` | Main map screen |
| `app/maps/layersConfig.ts` | Layer configuration |
| `components/MapMenu.tsx` | Layer control menu |
| `types/map.d.ts` | TypeScript definitions |
| `app/_layout.tsx` | Navigation setup |

## 🌐 Data Sources

All map data comes from public Esri REST API endpoints:
- Base: OpenStreetMap (free, no API key needed)
- Overlays: Esri sample servers (public, no authentication)

## 💡 Tips

1. **Start with fewer layers** - Loading many layers at once can be slow
2. **Zoom in for details** - Some layers show better detail at higher zoom levels
3. **Use heatmap for density** - Better for visualizing population or data concentration
4. **Use clusters for points** - Better for visualizing many individual points

## 🎨 Customization

### Change Default Map Center
Edit `app/maps/index.tsx`:
```typescript
.setView([37.8, -96], 4)  // [latitude, longitude], zoom
```

### Add New Layers
Edit `app/maps/layersConfig.ts`:
```typescript
{
  id: 'my-layer',
  name: 'My Layer',
  url: 'https://...',
  type: 'geojson',
  category: 'base',
  enabled: false,
  opacity: 0.7,
  color: '#1f77b4',
  description: 'My custom layer'
}
```

### Change Menu Width
Edit `components/MapMenu.tsx`:
```typescript
width: 350 * scale,  // Change 350 to desired width
```

## 📚 Learn More

- Full documentation: See `MAP_SYSTEM_README.md`
- Leaflet docs: https://leafletjs.com/
- Esri REST API: https://developers.arcgis.com/rest/
- Expo Router: https://expo.dev/routing

## ✅ What's Included

✓ 12 different map layer types  
✓ Leaflet mapping library  
✓ OpenStreetMap base tiles  
✓ Esri REST API integration  
✓ TV-friendly menu system  
✓ Dynamic layer toggling  
✓ Heatmap visualization  
✓ Point clustering  
✓ Full TypeScript support  
✓ Accessibility features  

## 🎯 Next Steps

1. Explore all 12 layer types
2. Customize colors and opacity in `layersConfig.ts`
3. Add your own Esri endpoints
4. Deploy to TV device
5. Extend with custom features

---

**Happy mapping! 🗺️**
