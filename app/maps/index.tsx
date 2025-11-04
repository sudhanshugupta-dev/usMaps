import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useScale } from '@/hooks/useScale';
import { MapMenu } from '@/components/MapMenu';
import { DirectionsPanel } from '@/components/DirectionsPanel';
import { EsriLayer, MapMessage } from '@/types/map';
import { useTVFocus } from '@/hooks/useTVFocus';
import { getCoordinateByIndex } from '@/constants/mapCoordinates';
import { Route } from '@/constants/directionsData';
import { Toast } from '@/components/Toast';

export default function MapsScreen() {
  const scale = useScale();
  const webViewRef = useRef<WebView>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [directionsOpen, setDirectionsOpen] = useState(false);
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set());
  const [mapReady, setMapReady] = useState(false);
  const [menuButtonFocused, setMenuButtonFocused] = useState(true);
  const [directionsButtonFocused, setDirectionsButtonFocused] = useState(false);
  const [drawerHasFocus, setDrawerHasFocus] = useState(false);
  const [directionsHasFocus, setDirectionsHasFocus] = useState(false);
  const [currentCoordIndex, setCurrentCoordIndex] = useState(0);
  const [currentZoom, setCurrentZoom] = useState(4);
  const [zoomButtonFocused, setZoomButtonFocused] = useState<'in' | 'out' | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const directionsButtonScaleAnim = useRef(new Animated.Value(1)).current;
  const zoomInScaleAnim = useRef(new Animated.Value(1)).current;
  const zoomOutScaleAnim = useRef(new Animated.Value(1)).current;
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'info' | 'success' | 'error'>('info');
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const styles = useMapsScreenStyles(scale);

  // Animate menu button focus
  useEffect(() => {
    Animated.spring(buttonScaleAnim, {
      toValue: menuButtonFocused && !menuOpen ? 1.1 : 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [menuButtonFocused, menuOpen, buttonScaleAnim]);

  // Animate zoom in button focus
  useEffect(() => {
    Animated.spring(zoomInScaleAnim, {
      toValue: zoomButtonFocused === 'in' ? 1.1 : 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [zoomButtonFocused, zoomInScaleAnim]);

// Animate zoom out button focus
useEffect(() => {
  Animated.spring(zoomOutScaleAnim, {
    toValue: zoomButtonFocused === 'out' ? 1.1 : 1,
    friction: 5,
    useNativeDriver: true,
  }).start();
}, [zoomButtonFocused, zoomOutScaleAnim]);

  // ✅ CORRECTED: Control map interactions based on drawer state
  useEffect(() => {
    if (!mapReady || !webViewRef.current) return;

    const enableMapInteractions = !menuOpen && !drawerHasFocus;
    
    console.log(`[MapScreen] Setting map interactions: ${enableMapInteractions ? 'ENABLED' : 'DISABLED'}`);

    const script = `
      (function() {
        if (window.map) {
          try {
            // Control ALL map interaction methods
            if (${enableMapInteractions}) {
              // Enable all interactions when drawer is closed
              window.map.dragging.enable();
              window.map.touchZoom.enable();
              window.map.doubleClickZoom.enable();
              window.map.scrollWheelZoom.enable();
              window.map.boxZoom.enable();
              window.map.keyboard.enable();
              console.log('Map interactions ENABLED');
            } else {
              // Disable all interactions when drawer is open
              window.map.dragging.disable();
              window.map.touchZoom.disable();
              window.map.doubleClickZoom.disable();
              window.map.scrollWheelZoom.disable();
              window.map.boxZoom.disable();
              window.map.keyboard.disable();
              console.log('Map interactions DISABLED');
            }
          } catch (error) {
            console.error('Error controlling map interactions:', error);
          }
        }
      })();
    `;
    
    webViewRef.current.injectJavaScript(script);
  }, [menuOpen, drawerHasFocus, mapReady]);

  // ✅ Clear zoom button focus and menu button focus when drawer opens
  useEffect(() => {
    if (menuOpen || drawerHasFocus) {
      // Remove zoom button focus when drawer is open
      if (zoomButtonFocused) {
        setZoomButtonFocused(null);
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`window.focusZoomControl(false);`);
        }
      }
      // Remove menu button focus when drawer is open
      if (menuButtonFocused) {
        setMenuButtonFocused(false);
      }
    }
  }, [menuOpen, drawerHasFocus]);

  // Navigate map coordinates
  const navigateToCoordinate = (index: number) => {
    const coord = getCoordinateByIndex(index);
    if (mapReady && webViewRef.current) {
      const script = `
        if (window.map) {
          window.map.flyTo([${coord.lat}, ${coord.lng}], ${currentZoom}, {
            duration: 1.5
          });
        }
      `;
      webViewRef.current.injectJavaScript(script);
    }
  };
  // TV Remote control for map (when drawer closed) - DISABLED when drawer is open
  useTVFocus({
    enabled: !menuOpen && !drawerHasFocus && mapReady,
    onUp: () => {
      console.log('[MapScreen] UP');
      if (zoomButtonFocused) {
        // Zoom in when zoom control is focused
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`window.clickZoomIn();`);
        }
      } else {
        // Navigate map
        const newIndex = currentCoordIndex - 1;
        setCurrentCoordIndex(newIndex);
        navigateToCoordinate(newIndex);
      }
    },
    onDown: () => {
      console.log('[MapScreen] DOWN');
      if (zoomButtonFocused) {
        // Zoom out when zoom control is focused
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`window.clickZoomOut();`);
        }
      } else {
        // Navigate map
        const newIndex = currentCoordIndex + 1;
        setCurrentCoordIndex(newIndex);
        navigateToCoordinate(newIndex);
      }
    },
    onLeft: () => {
      console.log('[MapScreen] LEFT');
      if (zoomButtonFocused) {
        // Move focus from zoom control to menu button
        setZoomButtonFocused(null);
        setDirectionsButtonFocused(true);
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`window.focusZoomControl(false);`);
        }
      } else if (directionsButtonFocused) {
        // Move focus from directions button to menu button
        setDirectionsButtonFocused(false);
        setMenuButtonFocused(true);
      } else {
        // Navigate map
        const newIndex = currentCoordIndex - 1;
        setCurrentCoordIndex(newIndex);
        navigateToCoordinate(newIndex);
      }
    },
    onRight: () => {
      console.log('[MapScreen] RIGHT');
      if (menuButtonFocused) {
        // Move focus from menu button to zoom control
        setMenuButtonFocused(false);
        setDirectionsButtonFocused(true);
      } else if (directionsButtonFocused) {
        // Move focus from directions button to zoom control
        setDirectionsButtonFocused(false);
        setZoomButtonFocused('in');
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`window.focusZoomControl(true);`);
        }
      } else if (!zoomButtonFocused) {
        // Navigate map
        const newIndex = currentCoordIndex + 1;
        setCurrentCoordIndex(newIndex);
        navigateToCoordinate(newIndex);
      }
    },
    onSelect: () => {
      console.log('[MapScreen] SELECT');
      if (menuButtonFocused) {
        // Open drawer
        setMenuOpen(true);
        setMenuButtonFocused(false);
      } else if (directionsButtonFocused) {
        // Open directions panel
        setDirectionsOpen(true);
        setDirectionsButtonFocused(false);
      } else if (zoomButtonFocused) {
        // Zoom in when zoom control is focused and OK is pressed
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`window.clickZoomIn();`);
        }
      }
    },
  });

  /**
   * Handle messages from WebView
   */
  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('[MapScreen] Received from WebView:', message);

      switch (message.type) {
        case 'mapReady':
          setMapReady(true);
          console.log('[MapScreen] Map is ready');
          break;

        case 'layerLoading':
          showToast('Please wait a moment, data is loading...', 'info', 4000);
          break;

        case 'layerToggled':
          if (message.visible) {
            setActiveLayers((prev) => new Set([...prev, message.layerId]));
          } else {
            setActiveLayers((prev) => {
              const next = new Set(prev);
              next.delete(message.layerId);
              return next;
            });
          }
          break;

        case 'layerLoaded':
          console.log(
            `[MapScreen] Layer ${message.layerId} loaded:`,
            message.success
          );
          if (message.success) {
            showToast('Data loaded successfully', 'success');
          } else {
            showToast('Failed to load data, please try again', 'error');
          }
          break;

        case 'error':
          console.error('[MapScreen] Map error:', message.message);
          showToast('Failed to load data, please try again', 'error');
          break;

        default:
          console.log('[MapScreen] Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('[MapScreen] Error parsing WebView message:', error);
    }
  };

  /**
   * Send message to WebView
   */
  const sendToWebView = (message: MapMessage) => {
    if (webViewRef.current && mapReady) {
      const messageStr = JSON.stringify(message);
      console.log('[MapScreen] Sending to WebView:', messageStr);
      const script = `window.handleMapMessage('${messageStr.replace(/'/g, "\\'")}');`;
      webViewRef.current.injectJavaScript(script);
    } else {
      console.warn('[MapScreen] WebView not ready or ref missing. MapReady:', mapReady);
    }
  };

  /**
   * Handle layer toggle from menu
   */
  const handleToggleLayer = (layer: EsriLayer) => {
    const message: MapMessage = {
      type: 'toggleLayer',
      layerId: layer.id,
    };

    // Include URL for first-time load
    if (!activeLayers.has(layer.id)) {
      (message as any).url = layer.url;
      (message as any).layerType = layer.type;
    }

    sendToWebView(message);
  };

  /**
   * Handle clear all layers
   */
  const handleClearLayers = () => {
    sendToWebView({ type: 'clearLayers' });
    setActiveLayers(new Set());
  };

  /**
   * Toggle menu
   */
  const handleToggleMenu = () => {
    const willOpen = !menuOpen;
    console.log(`[MapScreen] Toggling menu: ${willOpen ? 'OPEN' : 'CLOSE'}`);
    
    setMenuOpen(willOpen);

    if (willOpen) {
      // When drawer opens → remove focus from menu button
      setMenuButtonFocused(false);
      // Map interactions will be disabled by the useEffect above
    } else {
      // When drawer closes → restore focus to menu button
      setMenuButtonFocused(true);
      // Map interactions will be enabled by the useEffect above
    }
  };

  /**
   * ✅ CORRECTED: Handle drawer focus change
   */
  const handleDrawerFocusChange = (hasFocus: boolean) => {
    console.log(`[MapScreen] Drawer focus: ${hasFocus ? 'GAINED' : 'LOST'}`);
    setDrawerHasFocus(hasFocus);
    if (!hasFocus && !menuOpen) {
      setMenuButtonFocused(true);
    }
  };
  /**
   * Handle directions focus change
   */
  const handleDirectionsFocusChange = (hasFocus: boolean) => {
    setDirectionsHasFocus(hasFocus);
    if (!hasFocus && !directionsOpen) {
      // Return focus to directions button when panel closes
      setDirectionsButtonFocused(true);
    }
  };

  /**
   * Handle route selection
   */
  const handleRouteSelect = (route: Route) => {
    console.log('[MapScreen] Route selected:', route.name, route.id);
    setSelectedRoute(route);
    
    // Send route to WebView to display on map
    const message: MapMessage = {
      type: 'showRoute',
      routeId: route.id,
      routeName: route.name,
      coordinates: route.coordinates,
    };
    
    console.log('[MapScreen] Sending route message:', message);
    sendToWebView(message);
  };

  /**
   * Handle clear route
   */
  const handleClearRoute = () => {
    setSelectedRoute(null);
    sendToWebView({ type: 'clearRoute' });
  };

  // Rest of your HTML content and component rendering remains the same...
  /**
   * Get HTML content for WebView
   */
  const getHTMLContent = () => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>US Maps - Leaflet Viewer</title>

        <!-- Leaflet CSS -->
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
        />
        <!-- Leaflet JS -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"><\/script>

        <!-- Leaflet Heatmap Plugin -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet-heat/0.2.0/leaflet-heat.min.js"><\/script>

        <!-- Leaflet MarkerCluster Plugin -->
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.1/MarkerCluster.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.1/MarkerCluster.Default.min.css"
        />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.1/leaflet.markercluster.min.js"><\/script>

        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          html,
          body {
            width: 100%;
            height: 100%;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
              Ubuntu, Cantarell, sans-serif;
            background: #f5f5f5;
          }

          #map {
            width: 100%;
            height: 100%;
            z-index: 1;
          }

          /* Style default Leaflet zoom controls with focus effects */

          /* Update your existing zoom control styles */
.leaflet-control-zoom.focused-in a.leaflet-control-zoom-in {
  background-color: #0056b3 !important;
  border: 3px solid #FFD700 !important;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.9) !important;
}

.leaflet-control-zoom.focused-out a.leaflet-control-zoom-out {
  background-color: #0056b3 !important;
  border: 3px solid #FFD700 !important;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.9) !important;
}

.leaflet-control-zoom a.focused {
  transform: scale(1.1);
}
          .leaflet-control-zoom {
            border: 2px solid transparent !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
            transition: all 0.3s ease !important;
          }

          .leaflet-control-zoom.focused {
            border: 3px solid #FFD700 !important;
            box-shadow: 0 0 15px rgba(255, 215, 0, 0.9) !important;
            transform: scale(1.1);
          }

          .leaflet-control-zoom a {
            width: 40px !important;
            height: 40px !important;
            line-height: 40px !important;
            font-size: 24px !important;
            font-weight: bold !important;
            background-color: #007bff !important;
            color: white !important;
            transition: all 0.3s ease !important;
          }

          .leaflet-control-zoom a:hover {
            background-color: #0056b3 !important;
          }

          .leaflet-control-zoom.focused a {
            background-color: #0056b3 !important;
          }

          .leaflet-control-zoom-in {
            border-bottom: 1px solid rgba(255, 255, 255, 0.3) !important;
          }

          .map-controls {
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 1000;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .control-button {
            padding: 8px 12px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background 0.2s;
          }

          .control-button:hover {
            background: #0056b3;
          }

          .control-button:active {
            background: #003d82;
          }

          .info-panel {
            position: absolute;
            bottom: 10px;
            left: 10px;
            z-index: 1000;
            background: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            max-width: 300px;
            font-size: 12px;
            color: #333;
          }

          .layer-status {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 8px;
          }

          .layer-badge {
            background: #e9ecef;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            color: #495057;
          }

          .layer-badge.active {
            background: #28a745;
            color: white;
          }

          .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2000;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px 40px;
            border-radius: 8px;
            font-size: 16px;
            display: none;
          }

          .loading.active {
            display: block;
          }

          .legend {
            position: absolute;
            bottom: 10px;
            right: 10px;
            z-index: 1000;
            background: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            max-width: 250px;
            font-size: 12px;
          }

          .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
          }

          .legend-color {
            width: 20px;
            height: 20px;
            border-radius: 3px;
            border: 1px solid #ccc;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="loading" id="loading">Loading map...</div>
        <div class="info-panel" id="infoPanel">
          <strong>Map Status</strong>
          <div class="layer-status" id="layerStatus"></div>
        </div>

        <script>
          // ============================================================================
          // MAP INITIALIZATION
          // ============================================================================

          // Initialize map centered on USA - ENABLE default zoom controls
          const map = L.map('map', {
            zoomControl: true,        // ENABLE default zoom controls (+/- buttons)
            scrollWheelZoom: false,   // Disable mouse wheel zoom
            doubleClickZoom: false,   // Disable double-click zoom
            touchZoom: false,         // Disable touch/pinch zoom
            boxZoom: false,           // Disable shift+drag box zoom
            keyboard: false,          // Disable keyboard controls initially
          }).setView([37.8, -96], 4);

          // Add OpenStreetMap base layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution:
              '© OpenStreetMap contributors | Map data © OpenStreetMap contributors',
          }).addTo(map);

          // ============================================================================
          // LAYER REGISTRY & STATE MANAGEMENT
          // ============================================================================

          const layersRegistry = {};
          const layerStates = {};
          let activeLayers = new Set();
          const pendingToggles = {};

          // ============================================================================
          // UTILITY FUNCTIONS
          // ============================================================================

          /**
           * Show/hide loading indicator
           */
          function setLoading(show) {
            const loadingEl = document.getElementById('loading');
            if (show) {
              loadingEl.classList.add('active');
            } else {
              loadingEl.classList.remove('active');
            }
          }

          /**
           * Update info panel with active layers
           */
          function updateInfoPanel() {
            const statusEl = document.getElementById('layerStatus');
            statusEl.innerHTML = Array.from(activeLayers)
              .map(
                (id) =>
                  \`<span class="layer-badge active">\${id.replace(/-/g, ' ')}</span>\`
              )
              .join('');
          }

          /**
           * Send message to React Native
           */
          function sendMessage(type, data = {}) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(
                JSON.stringify({ type, ...data })
              );
            }
          }

          /**
           * Fetch GeoJSON from Esri endpoint
           */
          async function fetchGeoJSON(url) {
            try {
              // Check if URL already has query parameters
              const separator = url.includes('?') ? '&' : '?';
              const finalUrl = url.includes('f=geojson') ? url : \`\${url}\${separator}f=geojson\`;
              
              console.log('Fetching from:', finalUrl);
              const response = await fetch(finalUrl);
              if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
              const data = await response.json();
              console.log('GeoJSON data received:', data);
              return data;
            } catch (error) {
              console.error('Error fetching GeoJSON:', error);
              return null;
            }
          }

          /**
           * Create a color for a layer based on its ID
           */
          function getLayerColor(layerId) {
            const colors = {
              'street-base': '#1f77b4',
              satellite: '#ff7f0e',
              'political-boundaries': '#ff7f0e',
              'county-map': '#2ca02c',
              choropleth: '#d62728',
              heatmap: '#9467bd',
              'cluster-map': '#8c564b',
              'region-boundaries': '#e377c2',
              hydrology: '#17becf',
              utilities: '#bcbd22',
              hazards: '#ff9896',
              demographics: '#98df8a',
            };
            return colors[layerId] || '#1f77b4';
          }

          /**
           * Create GeoJSON layer with styling
           */
          function createGeoJSONLayer(data, layerId, color) {
            console.log('[createGeoJSONLayer] Creating GeoJSON layer for', layerId, 'with', data.features?.length || 0, 'features');
            
            return L.geoJSON(data, {
              style: function(feature) {
                return {
                  color: color,
                  weight: 2,
                  opacity: 0.7,
                  fillOpacity: 0.4,
                };
              },
              pointToLayer: (feature, latlng) => {
                return L.circleMarker(latlng, {
                  radius: 5,
                  fillColor: color,
                  color: '#fff',
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0.8,
                });
              },
              onEachFeature: (feature, layer) => {
                if (feature.properties) {
                  const props = Object.entries(feature.properties)
                    .slice(0, 5)
                    .map(([k, v]) => \`<strong>\${k}:</strong> \${v}\`)
                    .join('<br>');
                  if (props) {
                    layer.bindPopup(props);
                  }
                }
              },
            });
          }

          /**
           * Create heatmap layer from GeoJSON points
           */
          function createHeatmapLayer(data) {
            console.log('[createHeatmapLayer] Starting heatmap creation with', data?.features?.length || 0, 'features');
            
            if (!data || !data.features || data.features.length === 0) {
              console.error('[createHeatmapLayer] ❌ No features in data');
              return null;
            }
            
            const points = [];
            let processedCount = 0;
            let errorCount = 0;
            
            data.features.forEach((feature, index) => {
              try {
                if (!feature.geometry) {
                  console.warn(\`[createHeatmapLayer] Feature \${index} has no geometry\`);
                  errorCount++;
                  return;
                }
                
                const coords = feature.geometry.coordinates;
                if (!coords || coords.length < 2) {
                  console.warn(\`[createHeatmapLayer] Feature \${index} has invalid coordinates\`);
                  errorCount++;
                  return;
                }
                
                // Try to extract intensity from various possible field names
                let intensity = 0.5;
                if (feature.properties) {
                  intensity = feature.properties.magnitude || 
                             feature.properties.intensity || 
                             feature.properties.depth || 
                             feature.properties.value ||
                             feature.properties.POP2007 ||
                             0.5;
                  // Normalize intensity to 0-1 range
                  if (intensity > 1) {
                    intensity = Math.min(intensity / 10000000, 1);
                  }
                }
                
                points.push([coords[1], coords[0], intensity]);
                processedCount++;
              } catch (e) {
                console.warn(\`[createHeatmapLayer] Error processing feature \${index}:\`, e.message);
                errorCount++;
              }
            });
            
            console.log(\`[createHeatmapLayer] Processed: \${processedCount}, Errors: \${errorCount}, Points: \${points.length}\`);
            
            if (points.length === 0) {
              console.log('[createHeatmapLayer] ⚠️ No valid heatmap points, falling back to GeoJSON layer');
              // Fallback: show as GeoJSON layer with heatmap styling
              return L.geoJSON(data, {
                style: {
                  color: '#9467bd',
                  weight: 2,
                  opacity: 0.7,
                  fillOpacity: 0.4,
                },
                onEachFeature: (feature, layer) => {
                  if (feature.properties) {
                    const props = Object.entries(feature.properties)
                      .slice(0, 5)
                      .map(([k, v]) => \`<strong>\${k}:</strong> \${v}\`)
                      .join('<br>');
                    if (props) {
                      layer.bindPopup(props);
                    }
                  }
                }
              });
            }
            
            try {
              const heatmapLayer = L.heatLayer(points, {
                radius: 25,
                blur: 15,
                maxZoom: 17,
                gradient: {
                  0.0: '#0000ff',
                  0.25: '#00ff00',
                  0.5: '#ffff00',
                  0.75: '#ff7f00',
                  1.0: '#ff0000',
                },
              });
              console.log('[createHeatmapLayer] ✅ Heatmap layer created successfully');
              return heatmapLayer;
            } catch (e) {
              console.error('[createHeatmapLayer] ❌ Error creating heatmap layer:', e.message);
              // Fallback to GeoJSON
              return L.geoJSON(data, {
                style: {
                  color: '#9467bd',
                  weight: 2,
                  opacity: 0.7,
                  fillOpacity: 0.4,
                },
                onEachFeature: (feature, layer) => {
                  if (feature.properties) {
                    const props = Object.entries(feature.properties)
                      .slice(0, 5)
                      .map(([k, v]) => \`<strong>\${k}:</strong> \${v}\`)
                      .join('<br>');
                    if (props) {
                      layer.bindPopup(props);
                    }
                  }
                }
              });
            }
          }

          /**
           * Create marker cluster layer from GeoJSON points
           */
          function createClusterLayer(data) {
            console.log('[createClusterLayer] Starting cluster creation with', data?.features?.length || 0, 'features');
            
            if (!data || !data.features || data.features.length === 0) {
              console.error('[createClusterLayer] ❌ No features in data');
              return null;
            }
            
            const markers = L.markerClusterGroup({
              maxClusterRadius: 80,
              disableClusteringAtZoom: 17,
            });
            
            let addedCount = 0;
            let errorCount = 0;
            
            data.features.forEach((feature, index) => {
              try {
                if (!feature.geometry) {
                  console.warn(\`[createClusterLayer] Feature \${index} has no geometry\`);
                  errorCount++;
                  return;
                }
                
                const coords = feature.geometry.coordinates;
                if (!coords || coords.length < 2) {
                  console.warn(\`[createClusterLayer] Feature \${index} has invalid coordinates\`);
                  errorCount++;
                  return;
                }
                
                const marker = L.marker([coords[1], coords[0]]);
                if (feature.properties) {
                  const props = Object.entries(feature.properties)
                    .slice(0, 5)
                    .map(([k, v]) => \`<strong>\${k}:</strong> \${v}\`)
                    .join('<br>');
                  if (props) {
                    marker.bindPopup(props);
                  }
                }
                markers.addLayer(marker);
                addedCount++;
              } catch (e) {
                console.warn(\`[createClusterLayer] Error processing feature \${index}:\`, e.message);
                errorCount++;
              }
            });
            
            console.log(\`[createClusterLayer] Added: \${addedCount}, Errors: \${errorCount}\`);
            
            if (addedCount === 0) {
              console.error('[createClusterLayer] ❌ No markers added to cluster');
              return null;
            }
            
            console.log('[createClusterLayer] ✅ Cluster layer created successfully');
            return markers;
          }

          // ============================================================================
          // LAYER MANAGEMENT
          // ============================================================================

/**
 * Load and add a layer to the map
 */
async function loadLayer(layerId, url, layerType = 'geojson') {
  console.log('[loadLayer] Starting to load layer: ' + layerId + ', type: ' + layerType + ', url: ' + url);
  
if (layersRegistry[layerId]) {
  console.log('[loadLayer] Layer ' + layerId + ' already loaded');
  return;
}

setLoading(true);
sendMessage('layerLoading', { layerId });

try {
  let layer = null;

  if (layerType === 'geojson' || layerType === 'feature') {
    console.log('[loadLayer] Fetching GeoJSON for ' + layerId);
    const data = await fetchGeoJSON(url);
    
    if (!data) {
      throw new Error('Failed to fetch GeoJSON - no data returned');
    }
    
    if (!data.features) {
      console.warn('[loadLayer] GeoJSON has no features for ' + layerId, data);
    }

    console.log('[loadLayer] GeoJSON fetched successfully, features: ' + (data.features ? data.features.length : 0));

    // Determine layer type based on layer ID
    if (layerId.includes('heatmap')) {
      console.log('[loadLayer] Creating heatmap layer for ' + layerId);
      layer = createHeatmapLayer(data);
      console.log('[loadLayer] Heatmap layer created:', layer ? 'SUCCESS' : 'FAILED');
      if (!layer) {
        throw new Error('Heatmap layer creation returned null');
      }
    } else if (layerId.includes('cluster')) {
      console.log('[loadLayer] Creating cluster layer for ' + layerId);
      layer = createClusterLayer(data);
      console.log('[loadLayer] Cluster layer created:', layer ? 'SUCCESS' : 'FAILED');
      if (!layer) {
        throw new Error('Cluster layer creation returned null');
      }
    } else {
      console.log('[loadLayer] Creating GeoJSON layer for ' + layerId);
      const color = getLayerColor(layerId);
      layer = createGeoJSONLayer(data, layerId, color);
      console.log('[loadLayer] GeoJSON layer created:', layer ? 'SUCCESS' : 'FAILED');
      if (!layer) {
        throw new Error('GeoJSON layer creation returned null');
      }
    }
  } else if (layerType === 'tile') {
    console.log('[loadLayer] Creating tile layer for ' + layerId);
    // For tile layers, use Esri tile URL
    layer = L.tileLayer(url, {
      maxZoom: 19,
      attribution: 'Esri',
    });
  }

  if (layer) {
    layersRegistry[layerId] = layer;
    layerStates[layerId] = { loaded: true, visible: false };
    console.log('[loadLayer] Layer ' + layerId + ' loaded successfully and stored in registry');
    console.log('[loadLayer] Registry keys: ' + Object.keys(layersRegistry).join(', '));
    sendMessage('layerLoaded', { layerId, success: true });
    if (pendingToggles[layerId]) {
      console.log('[loadLayer] Executing pending toggle for', layerId);
      toggleLayer(layerId);
      delete pendingToggles[layerId];
    }
    return true;
  } else {
    throw new Error('Failed to create layer object');
  }
} catch (error) {
  console.error('[loadLayer] Error loading layer ' + layerId + ':', error);
  console.error('[loadLayer] Error details:', error.message, error.stack);
  sendMessage('layerLoaded', {
    layerId,
    success: false,
    message: error.message,
  });
  return false;
} finally {
  setLoading(false);
}
}

          /**
           * Toggle layer visibility
           */
          function toggleLayer(layerId) {
            console.log('[toggleLayer] Toggling layer: ' + layerId);
            
            const layer = layersRegistry[layerId];
            if (!layer) {
              console.error('[toggleLayer] Layer ' + layerId + ' not found in registry');
              console.log('[toggleLayer] Available layers:', Object.keys(layersRegistry));
              return false;
            }

            const state = layerStates[layerId];
            if (!state) {
              console.error('[toggleLayer] State not found for layer ' + layerId);
              return false;
            }

            if (state.visible) {
              // Hide layer
              console.log('[toggleLayer] Hiding layer ' + layerId);
              map.removeLayer(layer);
              state.visible = false;
              activeLayers.delete(layerId);
            } else {
              // Show layer
              console.log('[toggleLayer] Showing layer ' + layerId);
              layer.addTo(map);
              state.visible = true;
              activeLayers.add(layerId);
            }

            console.log('[toggleLayer] ✅ Layer ' + layerId + ' is now ' + (state.visible ? 'visible' : 'hidden'));
            console.log('[toggleLayer] Active layers: ' + Array.from(activeLayers).join(', '));
            updateInfoPanel();
            sendMessage('layerToggled', { layerId, visible: state.visible, success: true });
            return state.visible;
          }

          /**
           * Set layer opacity
           */
          function setLayerOpacity(layerId, opacity) {
            const layer = layersRegistry[layerId];
            if (!layer) return;

            if (layer.setOpacity) {
              layer.setOpacity(opacity);
            } else if (layer.eachLayer) {
              layer.eachLayer((sublayer) => {
                if (sublayer.setOpacity) {
                  sublayer.setOpacity(opacity);
                } else if (sublayer.setStyle) {
                  sublayer.setStyle({ opacity });
                }
              });
            }

            layerStates[layerId].opacity = opacity;
          }

          /**
           * Clear all active layers
           */
          function clearAllLayers() {
            activeLayers.forEach((layerId) => {
              const layer = layersRegistry[layerId];
              if (layer && layerStates[layerId].visible) {
                map.removeLayer(layer);
                layerStates[layerId].visible = false;
              }
            });
            activeLayers.clear();
            updateInfoPanel();
          }

          /**
           * Fit map to bounds
           */
          function fitBounds(bounds) {
            if (bounds && bounds.length === 2) {
              map.fitBounds(bounds);
            }
          }

          // ============================================================================
          // ============================================================================
          // DIRECTIONS / ROUTES HANDLING
          // ============================================================================
          
          let currentRoute = null;
          let routePolyline = null;
          let routeMarkers = [];

          function clearRoute() {
            if (routePolyline) {
              map.removeLayer(routePolyline);
              routePolyline = null;
            }
            
            routeMarkers.forEach((marker) => {
              map.removeLayer(marker);
            });
            routeMarkers = [];
            
            currentRoute = null;
            console.log('[clearRoute] Route cleared');
          }

          function showRoute(routeData) {
            // Clear existing route
            clearRoute();
            
            if (!routeData.coordinates || routeData.coordinates.length === 0) {
              console.warn('[showRoute] No coordinates provided for route');
              return;
            }

            currentRoute = routeData;
            console.log('[showRoute] Displaying route:', routeData.name);

            // Create polyline for the route with blue color (Google Maps style)
            routePolyline = L.polyline(routeData.coordinates, {
              color: '#0066ff',
              weight: 5,
              opacity: 0.85,
              lineCap: 'round',
              lineJoin: 'round',
              dashArray: '0',
              className: 'route-polyline',
            }).addTo(map);

            // Add start marker (green)
            if (routeData.coordinates.length > 0) {
              const startCoord = routeData.coordinates[0];
              const startMarker = L.circleMarker([startCoord[0], startCoord[1]], {
                radius: 10,
                fillColor: '#00cc00',
                color: '#fff',
                weight: 3,
                opacity: 1,
                fillOpacity: 0.95,
                className: 'route-start-marker',
              })
                .bindPopup('<strong>Start</strong>', { closeButton: false })
                .addTo(map);
              routeMarkers.push(startMarker);
            }

            // Add intermediate waypoint markers (blue)
            if (routeData.coordinates.length > 2) {
              for (let i = 1; i < routeData.coordinates.length - 1; i++) {
                const coord = routeData.coordinates[i];
                const waypointMarker = L.circleMarker([coord[0], coord[1]], {
                  radius: 7,
                  fillColor: '#0066ff',
                  color: '#fff',
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0.85,
                  className: 'route-waypoint-marker',
                })
                  .bindPopup('<strong>Waypoint ' + i + '</strong>', { closeButton: false })
                  .addTo(map);
                routeMarkers.push(waypointMarker);
              }
            }

            // Add end marker (red)
            if (routeData.coordinates.length > 0) {
              const endCoord = routeData.coordinates[routeData.coordinates.length - 1];
              const endMarker = L.circleMarker([endCoord[0], endCoord[1]], {
                radius: 10,
                fillColor: '#ff3333',
                color: '#fff',
                weight: 3,
                opacity: 1,
                fillOpacity: 0.95,
                className: 'route-end-marker',
              })
                .bindPopup('<strong>End</strong>', { closeButton: false })
                .addTo(map);
              routeMarkers.push(endMarker);
            }

            // Fit map bounds to route with padding
            const bounds = L.latLngBounds(routeData.coordinates);
            map.fitBounds(bounds, { padding: [80, 80], maxZoom: 9 });

            console.log('[showRoute] ✅ Route displayed:', routeData.name);
            console.log('[showRoute] 📍 Markers added:', routeMarkers.length, '| Coordinates:', routeData.coordinates.length);
            sendMessage('routeDisplayed', { routeId: routeData.id, success: true });
          }

          // MESSAGE HANDLING FROM REACT NATIVE
          // ============================================================================

          window.handleMapMessage = function (message) {
            try {
              const data = JSON.parse(message);
              console.log('[handleMapMessage] Received message:', data);

              switch (data.type) {
                case 'loadLayer':
                  console.log('[handleMapMessage] Loading layer:', data.layerId);
                  loadLayer(data.layerId, data.url, data.layerType || 'geojson');
                  break;

                case 'toggleLayer':
                  console.log('[handleMapMessage] Toggle layer request:', data.layerId);
                  console.log('[handleMapMessage] Layer state:', layerStates[data.layerId]);
                  
                  if (!layerStates[data.layerId]?.loaded) {
                    console.log('[handleMapMessage] Layer not loaded, loading first and queueing toggle...');
                    pendingToggles[data.layerId] = true;
                    loadLayer(data.layerId, data.url, data.layerType || 'geojson');
                  } else {
                    console.log('[handleMapMessage] Layer already loaded, toggling immediately');
                    toggleLayer(data.layerId);
                  }
                  break;

                case 'setOpacity':
                  console.log('[handleMapMessage] Setting opacity for:', data.layerId, 'to:', data.opacity);
                  setLayerOpacity(data.layerId, data.opacity);
                  break;

                case 'clearLayers':
                  console.log('[handleMapMessage] Clearing all layers');
                  clearAllLayers();
                  break;

                case 'fitBounds':
                  console.log('[handleMapMessage] Fitting bounds:', data.bounds);
                  fitBounds(data.bounds);
                  break;

                case 'showRoute':
                  console.log('[handleMapMessage] Showing route:', data.routeName);
                  showRoute(data);
                  break;

                case 'clearRoute':
                  console.log('[handleMapMessage] Clearing route');
                  clearRoute();
                  break;

                default:
                  console.warn('[handleMapMessage] Unknown message type:', data.type);
              }
            } catch (error) {
              console.error('[handleMapMessage] Error handling message:', error);
            }
          };

          // Add focus control for default zoom buttons
          let zoomControlFocused = false;
          const zoomControl = document.querySelector('.leaflet-control-zoom');
          
          // Replace the existing focusZoomControl function in your HTML
window.focusZoomControl = function(focusType) {
  const zoomControl = document.querySelector('.leaflet-control-zoom');
  const zoomInBtn = document.querySelector('.leaflet-control-zoom-in');
  const zoomOutBtn = document.querySelector('.leaflet-control-zoom-out');
  
  if (zoomControl && zoomInBtn && zoomOutBtn) {
    // Remove all focus classes first
    zoomControl.classList.remove('focused', 'focused-in', 'focused-out');
    zoomInBtn.classList.remove('focused');
    zoomOutBtn.classList.remove('focused');
    
    if (focusType === 'in') {
      // Focus on zoom in button
      zoomControl.classList.add('focused', 'focused-in');
      zoomInBtn.classList.add('focused');
      console.log('Zoom IN button focused');
    } else if (focusType === 'out') {
      // Focus on zoom out button
      zoomControl.classList.add('focused', 'focused-out');
      zoomOutBtn.classList.add('focused');
      console.log('Zoom OUT button focused');
    } else {
      // Remove all focus
      console.log('Zoom control unfocused');
    }
  }
};

          window.clickZoomIn = function() {
            const zoomInBtn = document.querySelector('.leaflet-control-zoom-in');
            if (zoomInBtn) {
              zoomInBtn.click();
              console.log('Zoom in clicked');
            }
          };

          window.clickZoomOut = function() {
            const zoomOutBtn = document.querySelector('.leaflet-control-zoom-out');
            if (zoomOutBtn) {
              zoomOutBtn.click();
              console.log('Zoom out clicked');
            }
          };

          // Expose for direct access
          window.mapAPI = {
            loadLayer,
            toggleLayer,
            setLayerOpacity,
            clearAllLayers,
            fitBounds,
            getActiveLayers: () => Array.from(activeLayers),
            getLayerRegistry: () => layersRegistry,
            focusZoomControl: window.focusZoomControl,
            clickZoomIn: window.clickZoomIn,
            clickZoomOut: window.clickZoomOut,
          };

          console.log('Map initialized successfully');
          sendMessage('mapReady', { success: true });
        <\/script>
      </body>
      </html>
    `;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.container}>
        {/* WebView with Map */}
        <WebView
          ref={webViewRef}
          source={{ html: getHTMLContent() }}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          style={styles.webView}
          scrollEnabled={true}
        />

        {/* Menu Toggle Button - Right Side with Focus Effect */}
        <Animated.View
          style={{
            transform: [{ scale: buttonScaleAnim }],
            position: 'absolute',
            top: 16 * scale,
            right: 16 * scale,
            zIndex: 999,
          }}
        >
          <TouchableOpacity
            style={[
              styles.menuButton,
              menuOpen && styles.menuButtonActive,
              menuButtonFocused && !menuOpen && styles.menuButtonFocused,
            ]}
            onPress={handleToggleMenu}
            accessibilityLabel="Toggle map menu"
            accessibilityRole="button"
          >
            <Text style={styles.menuButtonText}>☰</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Directions Toggle Button - Right Side Below Menu */}
        <Animated.View
          style={{
            transform: [{ scale: directionsButtonScaleAnim }],
            position: 'absolute',
            top: 16 + scale,
            right: 86 * scale,
            zIndex: 999,
          }}
        >
          <TouchableOpacity
            style={[
              styles.menuButton,
              directionsOpen && styles.menuButtonActive,
              directionsButtonFocused && !directionsOpen && styles.menuButtonFocused,
            ]}
            onPress={() => setDirectionsOpen(!directionsOpen)}
            accessibilityLabel="Toggle directions panel"
            accessibilityRole="button"
          >
            <Text style={styles.menuButtonText}>🛣️</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Debug Info Overlay */}
        {__DEV__ && (
          <View style={styles.debugOverlay}>
            <Text style={styles.debugText}>
              Menu: {menuOpen ? 'OPEN' : 'CLOSED'}
            </Text>
            <Text style={styles.debugText}>
              Button Focus: {menuButtonFocused ? 'YES' : 'NO'}
            </Text>
            <Text style={styles.debugText}>
              Drawer Focus: {drawerHasFocus ? 'YES' : 'NO'}
            </Text>
            <Text style={styles.debugText}>
              Map Ready: {mapReady ? 'YES' : 'NO'}
            </Text>
            <Text style={styles.debugText}>
              Coord: {currentCoordIndex} - {getCoordinateByIndex(currentCoordIndex).name}
            </Text>
            <Text style={styles.debugText}>
              Zoom: {currentZoom}
            </Text>
            <Text style={styles.debugText}>
              Zoom Focus: {zoomButtonFocused || 'NONE'}
            </Text>
          </View>
        )}

        {/* Side Menu with Focus Management */}
        <MapMenu
          isOpen={menuOpen}
          onToggleLayer={handleToggleLayer}
          onClearLayers={handleClearLayers}
          activeLayers={activeLayers}
          onClose={() => {
            setMenuOpen(false);
            setMenuButtonFocused(true);
          }}
          onFocusChange={handleDrawerFocusChange}
        />

        {/* Directions Panel with Focus Management */}
        <DirectionsPanel
          isOpen={directionsOpen}
          onClose={() => {
            setDirectionsOpen(false);
            setDirectionsButtonFocused(true);
          }}
          onRouteSelect={handleRouteSelect}
          onFocusChange={handleDirectionsFocusChange}
          selectedRoute={selectedRoute}
        />

        {/* Toast notifications */}
        <Toast visible={toastVisible} message={toastMessage} type={toastType} />
      </View>
    </KeyboardAvoidingView>
  );
}

const useMapsScreenStyles = (scale: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      position: 'relative',
    },

    webView: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },

    menuButton: {
      width: 48 * scale,
      height: 48 * scale,
      borderRadius: 24 * scale,
      backgroundColor: '#007bff',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },

    menuButtonActive: {
      backgroundColor: '#0056b3',
    },

    menuButtonFocused: {
      shadowColor: '#FFD700',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9,
      shadowRadius: 12,
      elevation: 12,
      borderWidth: 3,
      borderColor: '#FFD700',
    },

    menuButtonText: {
      fontSize: 24 * scale,
      color: '#ffffff',
      fontWeight: 'bold',
    },

    zoomContainer: {
      position: 'absolute',
      left: 16 * scale,
      top: '50%',
      transform: [{ translateY: -60 * scale }],
      alignItems: 'center',
      gap: 12 * scale,
      zIndex: 998,
    },

    zoomButton: {
      width: 48 * scale,
      height: 48 * scale,
      borderRadius: 24 * scale,
      backgroundColor: '#007bff',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      borderWidth: 2,
      borderColor: 'transparent',
    },

    zoomButtonFocused: {
      shadowColor: '#FFD700',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9,
      shadowRadius: 15,
      elevation: 15,
      borderWidth: 3,
      borderColor: '#FFD700',
      backgroundColor: '#0056b3',
    },

    zoomButtonDisabled: {
      backgroundColor: '#6c757d',
      opacity: 0.5,
    },

    zoomButtonText: {
      fontSize: 28 * scale,
      color: '#ffffff',
      fontWeight: 'bold',
      lineHeight: 28 * scale,
    },

    zoomLevelContainer: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: 12 * scale,
      paddingVertical: 6 * scale,
      borderRadius: 12 * scale,
    },

    zoomLevelText: {
      color: '#ffffff',
      fontSize: 14 * scale,
      fontWeight: '600',
    },

    debugOverlay: {
      position: 'absolute',
      top: 80 * scale,
      right: 16 * scale,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12 * scale,
      borderRadius: 8 * scale,
      zIndex: 998,
    },

    debugText: {
      color: '#ffffff',
      fontSize: 12 * scale,
      fontFamily: 'monospace',
      marginVertical: 2 * scale,
    },
  });