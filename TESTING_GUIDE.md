# 🧪 Testing Guide - Map Visualization System

Complete testing guide for the interactive map viewer.

## 📋 Pre-Testing Checklist

- [ ] Node.js and npm installed
- [ ] Project dependencies installed (`npm install`)
- [ ] Expo CLI installed globally
- [ ] Device or emulator ready
- [ ] Internet connection available (for Esri API)

## 🚀 Setup & Launch

### 1. Install Dependencies
```bash
cd /home/bitcot/Desktop/RNUSMAPS/usMaps
npm install
```

### 2. Start Development Server
```bash
# For TV
EXPO_TV=1 expo start

# For Android
npm run android

# For iOS
npm run ios

# For Web
npm run web
```

### 3. Load App on Device
- Scan QR code with Expo Go app
- Or use emulator/simulator
- Wait for app to load (may take 30-60 seconds)

## ✅ Functional Testing

### Test 1: App Launch
**Expected**: App loads home screen without errors

```
Steps:
1. Launch app
2. Wait for home screen to render
3. Check for console errors

Pass Criteria:
✓ No red error screens
✓ Home screen visible
✓ "Open Map Viewer" button visible
✓ Console shows no errors
```

### Test 2: Navigation to Map
**Expected**: Map screen loads with OpenStreetMap base

```
Steps:
1. Tap "Open Map Viewer" button
2. Wait for map to load (5-10 seconds)
3. Observe map rendering

Pass Criteria:
✓ Map screen loads
✓ OSM tiles visible
✓ Map centered on USA
✓ Zoom level is 4
✓ No loading spinner after 10 seconds
```

### Test 3: Menu Toggle
**Expected**: Side menu slides in/out smoothly

```
Steps:
1. On map screen, tap ☰ button (top-left)
2. Observe menu animation
3. Tap ☰ again to close
4. Tap outside menu area to close

Pass Criteria:
✓ Menu slides in from left
✓ Animation is smooth (no jank)
✓ Menu closes when ☰ tapped again
✓ Menu closes when tapping outside
✓ Menu width is ~350px
```

### Test 4: Layer Category Expansion
**Expected**: Layer categories expand/collapse

```
Steps:
1. Open menu
2. Tap "🏙️ Base Maps" header
3. Observe expansion
4. Tap again to collapse
5. Repeat with other categories

Pass Criteria:
✓ Category expands to show layers
✓ Arrow changes direction (▶ to ▼)
✓ Category collapses when tapped again
✓ Only one category expanded at a time
✓ Smooth animation
```

### Test 5: Layer Toggle - Single Layer
**Expected**: Layer toggles on/off with visual feedback

```
Steps:
1. Open menu
2. Expand "🛰️ Satellite" category
3. Tap "Satellite Imagery" layer
4. Observe map changes
5. Tap layer again to toggle off

Pass Criteria:
✓ Layer highlights in green when active
✓ Map updates to show layer
✓ Layer unhighlights when toggled off
✓ Map updates to remove layer
✓ No loading spinner (layer loads in background)
```

### Test 6: Multiple Layers
**Expected**: Multiple layers can be active simultaneously

```
Steps:
1. Open menu
2. Toggle on: Political Boundaries
3. Toggle on: County Boundaries
4. Toggle on: Hydrology
5. Observe all three on map
6. Check active counter shows "3 layers"

Pass Criteria:
✓ All layers visible on map
✓ Layers don't interfere with each other
✓ Active counter shows correct number
✓ Performance remains smooth
✓ Can still pan/zoom map
```

### Test 7: Clear All Layers
**Expected**: All active layers removed instantly

```
Steps:
1. Toggle on 3-4 layers
2. Tap red "Clear All Layers" button
3. Observe map changes
4. Check active counter

Pass Criteria:
✓ All layers removed from map
✓ Only OSM base remains
✓ Active counter shows "0 layers"
✓ Action is instant (no loading)
✓ Menu still open after clear
```

### Test 8: Layer Descriptions
**Expected**: Layer descriptions visible in menu

```
Steps:
1. Open menu
2. Expand any category
3. Look for layer descriptions

Pass Criteria:
✓ Each layer has a description
✓ Description is visible below layer name
✓ Description text is smaller/grayed
✓ Description is readable
```

### Test 9: Heatmap Rendering
**Expected**: Heatmap layer renders with gradient

```
Steps:
1. Open menu
2. Expand "🔥 Heatmap" category
3. Toggle "Population Density Heatmap"
4. Zoom in/out to observe

Pass Criteria:
✓ Heatmap appears on map
✓ Shows color gradient (blue to red)
✓ Density visualization visible
✓ Heatmap updates with zoom
```

### Test 10: Cluster Rendering
**Expected**: Points cluster at low zoom levels

```
Steps:
1. Open menu
2. Expand "📍 Clusters" category
3. Toggle "Clustered Points"
4. Zoom out to see clusters
5. Zoom in to see individual points

Pass Criteria:
✓ Clusters visible at low zoom
✓ Cluster numbers shown
✓ Clusters break apart when zooming in
✓ Individual markers visible at high zoom
✓ Clusters are clickable
```

### Test 11: Feature Popups
**Expected**: Clicking features shows property popups

```
Steps:
1. Toggle on any GeoJSON layer
2. Click on a feature on the map
3. Observe popup

Pass Criteria:
✓ Popup appears on click
✓ Shows feature properties
✓ Popup is readable
✓ Popup closes on second click
```

### Test 12: Menu Close Button
**Expected**: Close button (✕) closes menu

```
Steps:
1. Open menu
2. Tap ✕ button in header
3. Observe menu closes

Pass Criteria:
✓ Menu slides out smoothly
✓ Menu is fully hidden
✓ Map is fully visible
```

### Test 13: Active Layer Counter
**Expected**: Counter shows correct number of active layers

```
Steps:
1. Open menu
2. Toggle on 1 layer - counter shows "1 layer"
3. Toggle on 2 more - counter shows "3 layers"
4. Toggle off 1 - counter shows "2 layers"
5. Clear all - counter shows "0 layers"

Pass Criteria:
✓ Counter updates in real-time
✓ Singular/plural correct ("layer" vs "layers")
✓ Counter visible at bottom of menu
```

## 🎮 TV/Remote Control Testing

### Test 14: D-Pad Navigation
**Expected**: D-pad controls work on TV

```
Steps (on TV device):
1. Open menu
2. Press D-Pad Up/Down to scroll
3. Press D-Pad Left/Right to expand/collapse
4. Press Select to toggle layer
5. Press Back to close menu

Pass Criteria:
✓ D-Pad Up/Down scrolls menu
✓ D-Pad Left/Right expands/collapses
✓ Select button toggles layers
✓ Back button closes menu
✓ Focus visible on focused item
```

### Test 15: Touch Targets
**Expected**: All buttons are large enough for TV

```
Steps:
1. Observe button sizes
2. Try tapping buttons with finger
3. Check accessibility

Pass Criteria:
✓ All buttons are 48x48 or larger
✓ Easy to tap without precision
✓ Buttons have clear visual feedback
✓ Menu items are easily selectable
```

## 🎨 Visual Testing

### Test 16: Colors & Styling
**Expected**: Colors match design

```
Steps:
1. Check menu background (white)
2. Check active layers (green highlight)
3. Check selected layer (orange highlight)
4. Check clear button (red)
5. Check menu button (blue)

Pass Criteria:
✓ All colors are correct
✓ Contrast is good
✓ Text is readable
✓ Highlights are clear
```

### Test 17: Animations
**Expected**: Animations are smooth

```
Steps:
1. Open menu - observe slide animation
2. Expand category - observe smooth expansion
3. Toggle layer - observe highlighting
4. Close menu - observe slide animation

Pass Criteria:
✓ All animations are smooth (60fps)
✓ No jank or stuttering
✓ Animations complete in <300ms
✓ No animation delays
```

### Test 18: Responsive Layout
**Expected**: Layout adapts to screen size

```
Steps:
1. Test on phone (portrait)
2. Test on tablet (landscape)
3. Test on TV (large screen)
4. Rotate device

Pass Criteria:
✓ Layout adapts properly
✓ Menu width scales appropriately
✓ Text is readable
✓ Buttons are appropriately sized
```

## 🔧 Technical Testing

### Test 19: Console Errors
**Expected**: No errors in console

```
Steps:
1. Open React Native debugger
2. Perform all above tests
3. Check console for errors

Pass Criteria:
✓ No red error messages
✓ No warnings about missing props
✓ No network errors
✓ No WebView errors
```

### Test 20: Network Requests
**Expected**: Esri API requests succeed

```
Steps:
1. Open network inspector
2. Toggle on different layers
3. Observe network requests

Pass Criteria:
✓ Requests to Esri endpoints succeed (200)
✓ GeoJSON responses are valid
✓ No CORS errors
✓ Requests complete in <5 seconds
```

### Test 21: Memory Usage
**Expected**: Memory usage stays reasonable

```
Steps:
1. Start app
2. Toggle on 5+ layers
3. Pan/zoom map
4. Monitor memory usage

Pass Criteria:
✓ Memory usage < 200MB
✓ No memory leaks
✓ Performance remains smooth
✓ App doesn't crash
```

### Test 22: Performance
**Expected**: App performs smoothly

```
Steps:
1. Toggle on 5+ layers
2. Pan map rapidly
3. Zoom in/out rapidly
4. Expand/collapse categories rapidly

Pass Criteria:
✓ FPS stays above 30
✓ No lag or stuttering
✓ Interactions are responsive
✓ No crashes
```

## 🌐 Network Testing

### Test 23: Offline Mode
**Expected**: App handles offline gracefully

```
Steps:
1. Turn off internet
2. Try to load new layer
3. Observe error handling

Pass Criteria:
✓ Error message appears
✓ App doesn't crash
✓ Existing layers remain visible
✓ Can still interact with menu
```

### Test 24: Slow Network
**Expected**: App handles slow connections

```
Steps:
1. Throttle network to 3G
2. Toggle on layer
3. Observe loading behavior

Pass Criteria:
✓ Loading indicator appears
✓ Layer loads eventually
✓ No timeout errors
✓ User can cancel if needed
```

## 📱 Cross-Platform Testing

### Test 25: Android
```
Steps:
1. Run on Android device/emulator
2. Perform all tests above
3. Check for Android-specific issues

Pass Criteria:
✓ All tests pass
✓ No Android-specific errors
✓ Performance is good
```

### Test 26: iOS
```
Steps:
1. Run on iOS device/simulator
2. Perform all tests above
3. Check for iOS-specific issues

Pass Criteria:
✓ All tests pass
✓ No iOS-specific errors
✓ Performance is good
```

### Test 27: Web
```
Steps:
1. Run on web (npm run web)
2. Perform all tests above
3. Check for web-specific issues

Pass Criteria:
✓ All tests pass
✓ No web-specific errors
✓ Performance is good
```

## 🐛 Bug Report Template

If you find a bug, please report it with:

```
**Title**: Brief description

**Steps to Reproduce**:
1. ...
2. ...
3. ...

**Expected Behavior**:
What should happen

**Actual Behavior**:
What actually happens

**Screenshots/Video**:
If applicable

**Device/Platform**:
- Device: iPhone 14 / Android 13 / Web
- OS Version: ...
- App Version: 1.0.0

**Console Errors**:
Any error messages from console
```

## ✅ Final Checklist

Before declaring the system ready:

- [ ] All 27 tests pass
- [ ] No console errors
- [ ] No memory leaks
- [ ] Performance is smooth
- [ ] Works on all platforms
- [ ] Works on TV device
- [ ] All layers load correctly
- [ ] Menu works smoothly
- [ ] Animations are smooth
- [ ] Accessibility works
- [ ] Documentation is complete
- [ ] Code is clean and commented

## 🎉 Success Criteria

The system is ready for production when:

✅ All functional tests pass  
✅ All visual tests pass  
✅ All technical tests pass  
✅ Performance is smooth (60fps)  
✅ No console errors  
✅ Works on all target platforms  
✅ TV controls work correctly  
✅ Documentation is complete  

---

**Test Date**: _______________  
**Tester**: _______________  
**Result**: ✅ PASS / ❌ FAIL  
**Notes**: _______________
