import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useScale } from '@/hooks/useScale';
import { MapMenu } from '@/components/MapMenu';
import { ALL_LAYERS } from '@/app/maps/layersConfig';
import { EsriLayer, MapMessage } from '@/types/map';

const MAP_HTML_URI = require('./MapView.html');

export default function MapsScreen() {
  const scale = useScale();
  const webViewRef = useRef<WebView>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set());
  const [mapReady, setMapReady] = useState(false);

  const styles = useMapsScreenStyles(scale);

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
          break;

        case 'error':
          console.error('[MapScreen] Map error:', message.message);
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
      const script = `window.handleMapMessage('${JSON.stringify(message).replace(/'/g, "\\'")}');`;
      webViewRef.current.injectJavaScript(script);
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
    setMenuOpen(!menuOpen);
  };

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

          // Initialize map centered on USA
          const map = L.map('map').setView([37.8, -96], 4);

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
            console.log(\`[loadLayer] Starting to load layer: \${layerId}, type: \${layerType}, url: \${url}\`);
            
            if (layersRegistry[layerId]) {
              console.log(\`[loadLayer] Layer \${layerId} already loaded\`);
              return;
            }

            setLoading(true);

            try {
              let layer = null;

              if (layerType === 'geojson' || layerType === 'feature') {
                console.log(\`[loadLayer] Fetching GeoJSON for \${layerId}\`);
                const data = await fetchGeoJSON(url);
                
                if (!data) {
                  throw new Error('Failed to fetch GeoJSON - no data returned');
                }
                
                if (!data.features) {
                  console.warn(\`[loadLayer] GeoJSON has no features for \${layerId}\`, data);
                }

                console.log(\`[loadLayer] GeoJSON fetched successfully, features: \${data.features ? data.features.length : 0}\`);

                // Determine layer type based on layer ID
                if (layerId.includes('heatmap')) {
                  console.log(\`[loadLayer] Creating heatmap layer for \${layerId}\`);
                  layer = createHeatmapLayer(data);
                  console.log(\`[loadLayer] Heatmap layer created:\`, layer ? 'SUCCESS' : 'FAILED');
                  if (!layer) {
                    throw new Error('Heatmap layer creation returned null');
                  }
                } else if (layerId.includes('cluster')) {
                  console.log(\`[loadLayer] Creating cluster layer for \${layerId}\`);
                  layer = createClusterLayer(data);
                  console.log(\`[loadLayer] Cluster layer created:\`, layer ? 'SUCCESS' : 'FAILED');
                  if (!layer) {
                    throw new Error('Cluster layer creation returned null');
                  }
                } else {
                  console.log(\`[loadLayer] Creating GeoJSON layer for \${layerId}\`);
                  const color = getLayerColor(layerId);
                  layer = createGeoJSONLayer(data, layerId, color);
                  console.log(\`[loadLayer] GeoJSON layer created:\`, layer ? 'SUCCESS' : 'FAILED');
                  if (!layer) {
                    throw new Error('GeoJSON layer creation returned null');
                  }
                }
              } else if (layerType === 'tile') {
                console.log(\`[loadLayer] Creating tile layer for \${layerId}\`);
                // For tile layers, use Esri tile URL
                layer = L.tileLayer(url, {
                  maxZoom: 19,
                  attribution: 'Esri',
                });
              }

              if (layer) {
                layersRegistry[layerId] = layer;
                layerStates[layerId] = { loaded: true, visible: false };
                console.log(\`[loadLayer] ✅ Layer \${layerId} loaded successfully and stored in registry\`);
                console.log(\`[loadLayer] Registry keys: \${Object.keys(layersRegistry).join(', ')}\`);
                sendMessage('layerLoaded', { layerId, success: true });
                return true;
              } else {
                throw new Error('Failed to create layer object');
              }
            } catch (error) {
              console.error(\`[loadLayer] ❌ Error loading layer \${layerId}:\`, error);
              console.error(\`[loadLayer] Error details:\`, error.message, error.stack);
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
            console.log(\`[toggleLayer] Toggling layer: \${layerId}\`);
            
            const layer = layersRegistry[layerId];
            if (!layer) {
              console.error(\`[toggleLayer] Layer \${layerId} not found in registry\`);
              console.log('[toggleLayer] Available layers:', Object.keys(layersRegistry));
              return false;
            }

            const state = layerStates[layerId];
            if (!state) {
              console.error(\`[toggleLayer] State not found for layer \${layerId}\`);
              return false;
            }

            if (state.visible) {
              // Hide layer
              console.log(\`[toggleLayer] Hiding layer \${layerId}\`);
              map.removeLayer(layer);
              state.visible = false;
              activeLayers.delete(layerId);
            } else {
              // Show layer
              console.log(\`[toggleLayer] Showing layer \${layerId}\`);
              layer.addTo(map);
              state.visible = true;
              activeLayers.add(layerId);
            }

            console.log(\`[toggleLayer] ✅ Layer \${layerId} is now \${state.visible ? 'visible' : 'hidden'}\`);
            console.log(\`[toggleLayer] Active layers: \${Array.from(activeLayers).join(', ')}\`);
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
                    console.log('[handleMapMessage] Layer not loaded, loading first...');
                    loadLayer(data.layerId, data.url, data.layerType || 'geojson');
                    setTimeout(() => {
                      console.log('[handleMapMessage] Now toggling layer after load');
                      toggleLayer(data.layerId);
                    }, 500);
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

                default:
                  console.warn('[handleMapMessage] Unknown message type:', data.type);
              }
            } catch (error) {
              console.error('[handleMapMessage] Error handling message:', error);
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

        {/* Menu Toggle Button */}
        <TouchableOpacity
          style={[styles.menuButton, menuOpen && styles.menuButtonActive]}
          onPress={handleToggleMenu}
          accessibilityLabel="Toggle map menu"
          accessibilityRole="button"
        >
          <Text style={styles.menuButtonText}>☰</Text>
        </TouchableOpacity>

        {/* Side Menu */}
        <MapMenu
          isOpen={menuOpen}
          onToggleLayer={handleToggleLayer}
          onClearLayers={handleClearLayers}
          activeLayers={activeLayers}
          onClose={() => setMenuOpen(false)}
        />
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
      position: 'absolute',
      top: 16 * scale,
      left: 16 * scale,
      width: 48 * scale,
      height: 48 * scale,
      borderRadius: 24 * scale,
      backgroundColor: '#007bff',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },

    menuButtonActive: {
      backgroundColor: '#0056b3',
    },

    menuButtonText: {
      fontSize: 24 * scale,
      color: '#ffffff',
      fontWeight: 'bold',
    },
  });
