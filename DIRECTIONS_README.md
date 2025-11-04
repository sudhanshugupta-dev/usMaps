# 🛣️ USA Directions & Routes Feature

## Overview
A comprehensive directions feature displaying predefined USA routes on the map with Google Maps-style visualization, including blue polylines and color-coded markers.

## 📍 Features

### Route Display
- **Blue Polyline** - Main route path connecting all waypoints
  - Color: `#0066ff` (Google Maps blue)
  - Weight: 5px
  - Opacity: 85%

- **Start Marker** - Green circle at origin
  - Color: `#00cc00` (Green)
  - Size: 10px radius
  - Label: "Start"

- **Waypoint Markers** - Blue circles at intermediate stops
  - Color: `#0066ff` (Blue)
  - Size: 7px radius
  - Labels: "Waypoint 1", "Waypoint 2", etc.

- **End Marker** - Red circle at destination
  - Color: `#ff3333` (Red)
  - Size: 10px radius
  - Label: "End"

### Auto-Zoom
- Map automatically fits entire route in view
- Padding: 80px on all sides
- Max zoom level: 9

## 🗺️ Available USA Routes (10 Total)

### 1. **New York to Los Angeles (Coast to Coast)**
- Distance: 2,789 miles
- Duration: 40 hours 30 min
- Waypoints: Philadelphia → Columbus → Indianapolis → Dallas → Phoenix → Los Angeles
- Route ID: `route-1`

### 2. **San Jose to New York (West to East)**
- Distance: 2,900 miles
- Duration: 42 hours
- Waypoints: Denver → Chicago → Boston → New York
- Route ID: `route-2`

### 3. **Miami to Seattle (South to North)**
- Distance: 3,300 miles
- Duration: 48 hours
- Waypoints: Atlanta → Chicago → Denver → Seattle
- Route ID: `route-3`

### 4. **Los Angeles to Houston (Southwest Route)**
- Distance: 1,547 miles
- Duration: 22 hours 30 min
- Waypoints: Phoenix → Dallas → Houston
- Route ID: `route-4`

### 5. **Boston to Miami (Northeast to Southeast)**
- Distance: 1,540 miles
- Duration: 22 hours
- Waypoints: Philadelphia → Atlanta → Jacksonville → Miami
- Route ID: `route-5`

### 6. **Chicago to Los Angeles (Midwest to West)**
- Distance: 2,015 miles
- Duration: 29 hours
- Waypoints: Denver → Phoenix → Los Angeles
- Route ID: `route-6`

### 7. **Dallas to Seattle (Texas to Pacific Northwest)**
- Distance: 2,100 miles
- Duration: 30 hours
- Waypoints: Denver → Seattle
- Route ID: `route-7`

### 8. **Atlanta to San Diego (Southeast to Southwest)**
- Distance: 2,350 miles
- Duration: 34 hours
- Waypoints: Dallas → Phoenix → San Diego
- Route ID: `route-8`

### 9. **New York to Austin (Northeast to Central)**
- Distance: 1,800 miles
- Duration: 26 hours
- Waypoints: Indianapolis → Dallas → Austin
- Route ID: `route-9`

### 10. **San Jose to Miami (Coast to Coast South)**
- Distance: 2,800 miles
- Duration: 40 hours
- Waypoints: Phoenix → Houston → Jacksonville → Miami
- Route ID: `route-10`

## 🎮 How to Use

### On TV Remote
1. Press **D-Pad Right** to navigate to the directions button (🛣️)
2. Press **Select/OK** to open the directions panel
3. Use **D-Pad Up/Down** to browse available routes
4. Press **Select/OK** to display the route on the map
5. Press **Back** to close the directions panel

### On Touch/Mouse
1. Tap the **🛣️ button** on the right side of the map
2. Tap a route from the list to display it
3. The route will instantly appear with:
   - Blue line connecting all cities
   - Green marker at start
   - Blue markers at waypoints
   - Red marker at end
   - Map auto-zooms to fit entire route

## 📊 Route Details Panel

When a route is selected, the panel shows:
- **From**: Starting city
- **To**: Destination city
- **Distance**: Total miles
- **Est. Time**: Estimated travel duration

## 🏙️ Major Cities Included

- New York, NY
- Los Angeles, CA
- Chicago, IL
- Houston, TX
- Phoenix, AZ
- Philadelphia, PA
- San Antonio, TX
- San Diego, CA
- Dallas, TX
- San Jose, CA
- Austin, TX
- Jacksonville, FL
- Fort Worth, TX
- Columbus, OH
- Indianapolis, IN
- Seattle, WA
- Denver, CO
- Boston, MA
- Miami, FL
- Atlanta, GA

## 📁 Implementation Files

### Created
- `/constants/directionsData.ts` - Route definitions and city coordinates
- `/components/DirectionsPanel.tsx` - Route selection UI component

### Modified
- `/app/maps/MapView.html` - Route rendering with Leaflet
- `/app/maps/index.tsx` - Integration with main map screen
- `/types/map.d.ts` - TypeScript type definitions

## 🔧 Technical Details

### Message Protocol
Routes are displayed using WebView message passing:
```javascript
{
  type: 'showRoute',
  routeId: 'route-1',
  routeName: 'New York to Los Angeles',
  coordinates: [[lat, lng], [lat, lng], ...]
}
```

### Marker Styling
- **Start Marker**: Circle marker with green fill
- **Waypoint Markers**: Circle markers with blue fill
- **End Marker**: Circle marker with red fill
- All markers have white borders and popups

### Polyline Styling
- Color: Blue (#0066ff)
- Weight: 5px
- Opacity: 0.85
- Line cap: Round
- Line join: Round

## 🎯 Future Enhancements

Potential additions:
- Add more routes (e.g., regional routes)
- Custom route creation
- Route optimization
- Traffic-aware routing
- Alternative route suggestions
- Estimated fuel costs
- Rest stop recommendations
- Real-time traffic updates

## ✅ Testing Checklist

- [x] All 10 USA routes display correctly
- [x] Blue polyline renders for each route
- [x] Start marker (green) appears at origin
- [x] End marker (red) appears at destination
- [x] Waypoint markers (blue) appear at intermediate stops
- [x] Map auto-zooms to fit entire route
- [x] Route details show in panel
- [x] TV remote navigation works
- [x] Touch/mouse navigation works
- [x] Routes can be cleared and switched
- [x] No console errors

## 📝 Notes

- All routes are within the USA continental boundaries
- Coordinates are approximate for major cities
- Distances and durations are estimates
- Routes follow major highways and interstate routes
- Waypoints represent major cities along the route
