import React, { useEffect, useMemo, useRef, useState, useContext, useCallback } from 'react';
import { FullscreenContext } from '@/app/rnmaps/context/FullscreenContext';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions, TVEventControl, findNodeHandle, NativeSyntheticEvent, TextInputFocusEventData } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

type TouchableOpacityHandle = React.ElementRef<typeof TouchableOpacity>;

import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const isTV = Platform.OS === 'android' && Platform.isTV;
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  // Main container and layout
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  
  // Controls panel
  controls: {
    position: 'absolute',
    right: 20,
    top: 20,
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    borderRadius: 8,
    padding: 12,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  focusedControl: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 12,
    transform: [{ scale: 1.02 }],
  },
  
  // Buttons
  controlButton: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 40, 0.95)',
    borderWidth: 2,
    borderColor: 'transparent',
    transitionProperty: 'all',
    transitionDuration: '150ms',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    outlineWidth: 0,
  },
  focusedButton: {
    backgroundColor: 'rgba(30, 30, 40, 0.95)',
    borderColor: '#FFD700',
    borderWidth: 2,
    shadowColor: 'rgba(255, 215, 0, 0.6)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    transform: [{ scale: 1.02 }],
    zIndex: 10,
    elevation: 4,
    outlineWidth: 0,
  },
  activeButton: {
    opacity: 1,
  },
  inactiveButton: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modeButton: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: '#2a2a4a',
  },
  activeMode: {
    backgroundColor: '#3a3a5a',
  },
  modeText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  selectedMode: {
    color: '#FFD700',
  },
  fullscreenButton: {
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#2a2a4a',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Map elements
  map: { 
    flex: 1 
  },
  
  // Info panel
  infoPanel: { 
    position: 'absolute', 
    bottom: isTV ? 80 : 60, 
    left: 20, 
    right: 20, 
    backgroundColor: '#16213e', 
    borderRadius: 12, 
    padding: 20, 
    maxHeight: isTV ? 250 : 200, 
    borderWidth: 4,
    borderColor: '#0f3460'
  },
  infoPanelHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 15 
  },
  infoPanelTitle: { 
    fontSize: isTV ? 24 : 18, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  infoPanelSubtitle: { 
    fontSize: isTV ? 16 : 12, 
    color: '#aaa', 
    marginTop: 5 
  },
  closeButton: { 
    width: 30, 
    height: 30, 
    borderRadius: 15, 
    backgroundColor: '#e94560', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // Cities list
  citiesList: { 
    maxHeight: isTV ? 150 : 100 
  },
  citiesTitle: { 
    fontSize: isTV ? 18 : 14, 
    fontWeight: 'bold', 
    color: '#FFD700', 
    marginBottom: 10 
  },
  cityItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  cityBullet: { 
    color: '#e94560', 
    fontSize: isTV ? 20 : 16, 
    marginRight: 10 
  },
  cityInfo: { 
    flex: 1 
  },
  cityName: { 
    color: '#fff', 
    fontSize: isTV ? 18 : 14, 
    fontWeight: 'bold' 
  },
  cityDescription: { 
    color: '#aaa', 
    fontSize: isTV ? 14 : 11, 
    marginTop: 2 
  },
  
  // Fullscreen mode
  fullscreenMap: {
    flex: 1,
    backgroundColor: '#000',
    zIndex: 1,
    elevation: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fullscreenMapFocusTrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 900,
    elevation: 9999,
  },
  fullscreenControls: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1001,
    flexDirection: 'column',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 12,
    gap: 16,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  controlGroup: {
    backgroundColor: 'rgba(30, 30, 40, 0.95)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  controlButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    margin: 4,
    backgroundColor: 'rgba(50, 50, 60, 0.9)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  focusedButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: '#FFD700',
    transform: [{ scale: 1.1 }],
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 12,
  },
  
  // Focus indicators
  focusedIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  focusedText: {
    color: '#000',
    fontSize: isTV ? 18 : 14,
    fontWeight: 'bold'
  },
  
  // Instructions
  instructions: {
    padding: isTV ? 15 : 10,
    backgroundColor: '#0f3460',
    borderTopWidth: 2,
    borderTopColor: '#16213e'
  },
  instructionText: {
    color: '#fff',
    fontSize: isTV ? 16 : 12,
    textAlign: 'center'
  }
});

type City = { name: string; lat: number; lon: number; info: string };
type Cluster = { id: string; name: string; lat: number; lon: number; color: string; pop: string; cities: City[] };

const CLUSTERS: Cluster[] = [
  {
    id: 'cluster-west',
    name: 'West Coast',
    lat: 37.7749,
    lon: -122.4194,
    color: '#FF3B3B',
    pop: '15M+',
    cities: [
      { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, info: 'Entertainment Capital' },
      { name: 'San Francisco', lat: 37.7749, lon: -122.4194, info: 'Tech Hub' },
      { name: 'Seattle', lat: 47.6062, lon: -122.3321, info: 'Emerald City' },
      { name: 'Portland', lat: 45.5152, lon: -122.6784, info: 'Rose City' },
      { name: 'San Diego', lat: 32.7157, lon: -117.1611, info: 'Finest City' },
    ],
  },
  {
    id: 'cluster-southwest',
    name: 'Southwest',
    lat: 33.4484,
    lon: -112.074,
    color: '#00D9FF',
    pop: '8M+',
    cities: [
      { name: 'Phoenix', lat: 33.4484, lon: -112.074, info: 'Valley of the Sun' },
      { name: 'Las Vegas', lat: 36.1699, lon: -115.1398, info: 'Sin City' },
      { name: 'Albuquerque', lat: 35.0844, lon: -106.6504, info: 'Balloon Capital' },
      { name: 'Tucson', lat: 32.2226, lon: -110.9747, info: 'Old Pueblo' },
      { name: 'El Paso', lat: 31.7619, lon: -106.485, info: 'Sun City' },
    ],
  },
  {
    id: 'cluster-midwest',
    name: 'Midwest',
    lat: 41.8781,
    lon: -87.6298,
    color: '#9D4EDD',
    pop: '12M+',
    cities: [
      { name: 'Chicago', lat: 41.8781, lon: -87.6298, info: 'Windy City' },
      { name: 'Detroit', lat: 42.3314, lon: -83.0458, info: 'Motor City' },
      { name: 'Minneapolis', lat: 44.9778, lon: -93.265, info: 'City of Lakes' },
      { name: 'St. Louis', lat: 38.627, lon: -90.1994, info: 'Gateway City' },
      { name: 'Kansas City', lat: 39.0997, lon: -94.5786, info: 'BBQ Capital' },
    ],
  },
  {
    id: 'cluster-east',
    name: 'East Coast',
    lat: 40.7128,
    lon: -74.006,
    color: '#FF9500',
    pop: '20M+',
    cities: [
      { name: 'New York', lat: 40.7128, lon: -74.006, info: 'Big Apple' },
      { name: 'Boston', lat: 42.3601, lon: -71.0589, info: 'Beantown' },
      { name: 'Philadelphia', lat: 39.9526, lon: -75.1652, info: 'Brotherly Love' },
      { name: 'Washington DC', lat: 38.9072, lon: -77.0369, info: 'Nation’s Capital' },
      { name: 'Miami', lat: 25.7617, lon: -80.1918, info: 'Magic City' },
    ],
  },
];

type Mode = 'cluster' | 'zoom';

type FocusKey =
  | ''
  | 'mode-cluster'
  | 'mode-zoom'
  | 'zoom-in'
  | 'zoom-out'
  | 'fullscreen-btn'
  | 'exit-fullscreen'
  | 'cluster-btn';

export default function MapScreen() {
  const [mode, setMode] = useState<Mode>('cluster');
  const [focus, setFocus] = useState<FocusKey>('mode-cluster'); // Start with cluster button focused
  const [focusedIdx, setFocusedIdx] = useState(0);
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [zoom, setZoom] = useState(4);
  const { isFullscreen, setIsFullscreen } = useContext(FullscreenContext);
  const webRef = useRef<WebView>(null);
  
  // Initialize focus states
  // Create refs for all focusable elements with proper types
  const clusterButtonRef = useRef<TouchableOpacityHandle>(null);
  const zoomInButtonRef = useRef<TouchableOpacityHandle>(null);
  const zoomOutButtonRef = useRef<TouchableOpacityHandle>(null);
  const fullscreenButtonRef = useRef<TouchableOpacityHandle>(null);
  const zoomButtonRef = useRef<TouchableOpacityHandle>(null);
  const mapFocusRef = useRef<TouchableOpacityHandle>(null);

  // Helper function to get button props for TV focus management
  const getButtonProps = (buttonRef: React.RefObject<TouchableOpacityHandle>, buttonFocusKey: FocusKey) => {
    if (!isTV) return {} as const;
    
    const getNodeHandle = () => {
      if (!buttonRef.current) return -1;
      const node = findNodeHandle(buttonRef.current);
      return node ?? -1;
    };
    
    const requestFocus = () => {
      const node = buttonRef.current as unknown as { focus?: () => void } | null;
      if (node?.focus) {
        node.focus();
      } else {
        buttonRef.current?.setNativeProps?.({ hasTVPreferredFocus: true });
      }
    };
    
    const onFocus = () => {
      setFocus(buttonFocusKey);
    };
    
    const onBlur = () => {
      // Optional: Handle blur if needed
    };
    
    const isFocused = focus === buttonFocusKey;
    
    return {
      ref: buttonRef,
      hasTVPreferredFocus: isFocused,
      onFocus,
      onBlur,
      getNodeHandle,
      focus: requestFocus,
      isFocused,
      current: buttonRef.current,
      // Alias for backward compatibility
      getRef: getNodeHandle
    } as const;
  };
  
  const clusterButton = getButtonProps(clusterButtonRef, 'cluster-btn');
  const zoomInButton = getButtonProps(zoomInButtonRef, 'zoom-in');
  const zoomOutButton = getButtonProps(zoomOutButtonRef, 'zoom-out');
  const fullscreenButton = getButtonProps(fullscreenButtonRef, 'exit-fullscreen');
  const zoomButton = getButtonProps(zoomButtonRef, 'mode-zoom');
  const mapFocus = isTV ? getButtonProps(mapFocusRef, '' as FocusKey) : null;
  
  // Set initial focus on mount
  useEffect(() => {
    if (isTV) {
      // Use a small timeout to ensure the component is fully mounted
      const timer = setTimeout(() => {
        clusterButton.focus?.();
        setFocus('mode-cluster' as FocusKey);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isTV]);
  
  // Update focus state based on current focus
  useEffect(() => {
    if (!isTV) return;
    
    // Use requestAnimationFrame to ensure the focus update happens in the next frame
    requestAnimationFrame(() => {
      switch (focus) {
        case 'mode-cluster':
          clusterButton.focus?.();
          break;
        case 'mode-zoom':
          zoomButton.focus?.();
          break;
        case 'cluster-btn':
          clusterButton.focus?.();
          break;
        case '':
          mapFocus?.focus?.();
          break;
        case 'zoom-in':
          zoomInButton.focus?.();
          break;
        case 'zoom-out':
          zoomOutButton.focus?.();
          break;
        case 'fullscreen-btn':
        case 'exit-fullscreen':
          fullscreenButton.focus?.();
          break;
      }
    });
  }, [focus, isTV]);

  const html = useMemo(() => generateMapHTML(CLUSTERS, focusedIdx, selectedCluster?.id ?? null, zoom), [focusedIdx, selectedCluster, zoom]);
  
  // Memoize the WebView key to prevent unnecessary re-renders
  const webViewKey = useMemo(
    () => `map-${isFullscreen ? 'fs' : 'norm'}-${mode}-${selectedCluster?.id ?? 'none'}-${zoom}`,
    [isFullscreen, mode, selectedCluster?.id, zoom],
  );
  
  const focusClusterAbove = () => {
    const cur = CLUSTERS[focusedIdx];
    if (!cur) return false;

    const above = CLUSTERS.map((c, i) => ({ ...c, i }))
      .filter(c => c.lat > cur.lat)
      .sort((a, b) => a.lat - b.lat);

    if (above.length) {
      setFocusedIdx(above[0].i);
      return true;
    }

    return false;
  };

  const focusClusterBelow = () => {
    const cur = CLUSTERS[focusedIdx];
    if (!cur) return false;

    const below = CLUSTERS.map((c, i) => ({ ...c, i }))
      .filter(c => c.lat < cur.lat)
      .sort((a, b) => b.lat - a.lat);

    if (below.length) {
      setFocusedIdx(below[0].i);
      return true;
    }

    return false;
  };

  const focusClusterLeft = () => {
    const cur = CLUSTERS[focusedIdx];
    if (!cur) return false;

    const lefts = CLUSTERS.map((c, i) => ({ ...c, i }))
      .filter(c => c.lon < cur.lon)
      .sort((a, b) => b.lon - a.lon);

    if (lefts.length) {
      setFocusedIdx(lefts[0].i);
      return true;
    }

    return false;
  };

  const focusClusterRight = () => {
    const cur = CLUSTERS[focusedIdx];
    if (!cur) return false;

    const rights = CLUSTERS.map((c, i) => ({ ...c, i }))
      .filter(c => c.lon > cur.lon)
      .sort((a, b) => a.lon - b.lon);

    if (rights.length) {
      setFocusedIdx(rights[0].i);
      return true;
    }

    return false;
  };

  // Handle map view updates when selected cluster or zoom changes
  useEffect(() => {
    if (webRef.current && selectedCluster) {
      const targetZoom = Math.max(zoom, 8);
      webRef.current.injectJavaScript(`
        (function() {
          const map = L.DomUtil.get('map')._leaflet_map;
          if (map) {
            map.flyTo([${selectedCluster.lat}, ${selectedCluster.lon}], ${targetZoom}, {
              duration: 1,
              easeLinearity: 0.25,
              animate: true
            });
          }
          true;
        })();
        true;
      `);
    }
  }, [selectedCluster?.id, zoom]);

  const handleZoomIn = () => {
    const z = Math.min(zoom + 1, 18);
    setZoom(z);
  };
  const handleZoomOut = () => {
    const z = Math.max(zoom - 1, 3);
    setZoom(z);
  };

  const selectAction = () => {
    if (focus === 'fullscreen-btn') {
      setIsFullscreen(true);
      setFocus('cluster-btn');
      return;
    }

    if (focus === 'exit-fullscreen') {
      setIsFullscreen(false);
      setFocus('fullscreen-btn');
      setSelectedCluster(null);
      setZoom(4);
      return;
    }

    if (focus === 'mode-cluster') {
      setMode('cluster');
      setFocus('');
      setFocusedIdx(0);
      setSelectedCluster(null);
      return;
    }

    if (focus === 'mode-zoom') {
      setMode('zoom');
      setFocus('zoom-in');
      return;
    }

    if (focus === 'zoom-in') {
      handleZoomIn();
      return;
    }

    if (focus === 'zoom-out') {
      handleZoomOut();
      return;
    }

    if (isFullscreen && focus === 'cluster-btn') {
      setFocus('');
      requestAnimationFrame(() => {
        mapFocus?.focus?.();
      });
      return;
    }

    if (mode === 'cluster' && focus === '') {
      const current = CLUSTERS[focusedIdx];
      if (!current) return;

      if (selectedCluster?.id === current.id) {
        setSelectedCluster(null);
        setZoom(4);
      } else {
        setSelectedCluster(current);
        const targetZoom = selectedCluster ? 4 : 8;
        setZoom(targetZoom);

        if (webRef.current) {
          webRef.current.injectJavaScript(`
            (function() {
              const map = L.DomUtil.get('map')._leaflet_map;
              if (map) {
                map.flyTo([${current.lat}, ${current.lon}], ${Math.max(targetZoom, 8)}, {
                  duration: 0.8,
                  easeLinearity: 0.25,
                  animate: true
                });
              }
              true;
            })();
            true;
          `);
        }
      }
      return;
    }

    if (mode === 'zoom' && focus === '') {
      setFocus('zoom-in');
    }
  };

  const up = () => {
    if (mode === 'cluster' && focus === '') {
      const moved = focusClusterAbove();
      if (!moved && isFullscreen) {
        setFocus('cluster-btn');
        requestAnimationFrame(() => {
          clusterButton.focus?.();
        });
      }
      return;
    }

    if (isFullscreen) {
      if (focus === 'exit-fullscreen') {
        setFocus('zoom-out');
      } else if (focus === 'zoom-out') {
        setFocus('zoom-in');
      } else if (focus === 'zoom-in') {
        setFocus('cluster-btn');
      } else if (focus === 'cluster-btn') {
        // Stay on cluster button when pressing up
        setFocus('cluster-btn');
      }
    } else {
      if (mode === 'zoom') {
        if (focus === 'zoom-out') setFocus('zoom-in');
        else if (focus === 'zoom-in') setFocus('mode-zoom');
        else if (focus === 'mode-zoom') setFocus('mode-cluster');
      } else {
        if (focus === 'mode-cluster' || focus === 'mode-zoom') {
          setFocus('');
          setFocusedIdx(0);
        } else if (focus === 'fullscreen-btn') {
          setFocus('mode-zoom');
        }
      }
    }
  };
  const down = () => {
    if (isFullscreen && mode === 'cluster' && focus === '') {
      const moved = focusClusterBelow();
      if (!moved) {
        setFocus('cluster-btn');
        requestAnimationFrame(() => {
          clusterButton.focus?.();
        });
      }
      return;
    }

    if (isFullscreen) {
      if (focus === 'cluster-btn') {
        setFocus('zoom-in');
      } else if (focus === 'zoom-in') {
        setFocus('zoom-out');
      } else if (focus === 'zoom-out') {
        setFocus('exit-fullscreen');
      } else if (focus === 'exit-fullscreen') {
        // Stay on exit button when pressing down
        setFocus('exit-fullscreen');
      }
    } else {
      if (mode === 'zoom') {
        if (focus === 'mode-zoom') setFocus('zoom-in');
        else if (focus === 'zoom-in') setFocus('zoom-out');
        else if (focus === 'zoom-out') setFocus('fullscreen-btn');
      } else {
        if (focus === '') {
          setFocus('mode-cluster');
        } else if (focus === 'mode-cluster') {
          setFocus('mode-zoom');
        } else if (focus === 'mode-zoom') {
          setFocus('fullscreen-btn');
        } else if (focus === 'fullscreen-btn') {
          setFocus('');
          setFocusedIdx(0);
        }
      }
    }
  };
  const left = () => {
    if (mode === 'cluster' && focus === '') {
      focusClusterLeft();
      return;
    }

    if (isFullscreen) {
      if (focus === 'cluster-btn') {
        if (mode !== 'cluster') setMode('cluster');
        setFocus('');
        requestAnimationFrame(() => {
          mapFocus?.focus?.();
        });
      } else if (focus === 'zoom-out') {
        setFocus('zoom-in');
      } else if (focus === 'zoom-in') {
        setFocus('cluster-btn');
      } else if (focus === 'exit-fullscreen') {
        setFocus('zoom-out');
      }
    } else {
      if (focus === 'mode-zoom') {
        setFocus('mode-cluster');
      } else if (focus === 'fullscreen-btn') {
        setFocus('mode-zoom');
      }
    }
  };
  const right = () => {
    if (mode === 'cluster' && focus === '') {
      const moved = focusClusterRight();
      if (!moved && isFullscreen) {
        setFocus('cluster-btn');
        requestAnimationFrame(() => {
          clusterButton.focus?.();
        });
      }
      return;
    }

    if (isFullscreen) {
      if (focus === 'cluster-btn') setFocus('zoom-in');
      else if (focus === 'zoom-in') setFocus('zoom-out');
      else if (focus === 'zoom-out') setFocus('exit-fullscreen');
    } else {
      if (focus === 'mode-cluster') {
        setFocus('mode-zoom');
      } else if (focus === 'mode-zoom') {
        setFocus('fullscreen-btn');
      } else if (focus === 'fullscreen-btn') {
        // Stay on fullscreen button when pressing right
        setFocus('fullscreen-btn');
      }
    }
  };

  // Handle TV remote control events
  useEffect(() => {
    if (!isTV) return;
    
    const handleKeyEvent = (evt: any) => {
      if (!evt) return;
      
      switch (evt.eventType) {
        case 'select':
          selectAction();
          break;
        case 'up':
          up();
          break;
        case 'down':
          down();
          break;
        case 'left':
          left();
          break;
        case 'right':
          right();
          break;
        default:
          break;
      }
    };

    // Use DeviceEventEmitter for handling TV remote events
    const { DeviceEventEmitter } = require('react-native');
    const keyEventSubscription = DeviceEventEmitter.addListener('onTVNavEvent', handleKeyEvent);

    // For newer versions of React Native TV, we might need to use this event name
    const tvEventHandler = DeviceEventEmitter.addListener('onTVRemoteEvent', handleKeyEvent);

    return () => {
      keyEventSubscription.remove();
      tvEventHandler?.remove();
    };
  }, [focus, mode, focusedIdx, selectedCluster, zoom, isFullscreen]);
  
  // Set initial focus when component mounts
  useEffect(() => {
    if (isTV) {
      // Focus the cluster button by default
      setFocus('mode-cluster');
      // Request focus for the cluster button
      requestAnimationFrame(() => {
        clusterButton.focus?.();
      });
    }
  }, [isTV]);
  
  // Handle tab focus changes with proper type safety
  const handleTabFocus = (tabName: FocusKey) => {
    setFocus(tabName);
    // Ensure proper focus management for TV remote
    if (isTV) {
      switch (tabName) {
        case 'cluster-btn':
          clusterButton.focus?.();
          break;
        case 'zoom-in':
          zoomInButton.focus?.();
          break;
        case 'zoom-out':
          zoomOutButton.focus?.();
          break;
        case 'fullscreen-btn':
        case 'exit-fullscreen':
          fullscreenButton.focus?.();
          break;
      }
    }
  };

  // Fullscreen rendering with zoom and cluster controls
  if (isFullscreen) {
    return (
      <View style={[styles.container, { backgroundColor: '#000' }]}>
        <WebView
          ref={webRef}
          key={webViewKey}
          source={{ html }}
          style={[styles.fullscreenMap, { 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#000'
          }]}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          scalesPageToFit
          bounces={false}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentInset={{ top: 0, left: 0, bottom: 0, right: 0 }}
          automaticallyAdjustContentInsets={false}
          importantForAccessibility={focus === '' ? 'no-hide-descendants' : 'auto'}
        />

        {isTV && mapFocus && (
          <TouchableOpacity
            ref={mapFocus.ref}
            hasTVPreferredFocus={mapFocus.hasTVPreferredFocus}
            onFocus={mapFocus.onFocus}
            onBlur={mapFocus.onBlur}
            focusable
            activeOpacity={1}
            style={styles.fullscreenMapFocusTrap}
            accessible
            importantForAccessibility="yes"
            nextFocusRight={clusterButton.getNodeHandle?.() ?? -1}
            nextFocusLeft={-1}
            nextFocusUp={-1}
            nextFocusDown={-1}
          />
        )}

        {/* Fullscreen controls */}
        <View 
          style={styles.fullscreenControls}
          needsOffscreenAlphaCompositing
          renderToHardwareTextureAndroid
        >
          {/* Mode Toggle Button */}
          <View style={styles.controlGroup}>
            <TouchableOpacity
              {...clusterButton}
              onPress={() => {
                setMode('cluster');
                setSelectedCluster(null);
                if (isFullscreen) {
                  setFocus('');
                  requestAnimationFrame(() => {
                    mapFocus?.focus?.();
                  });
                  setTimeout(() => {
                    if (focus !== '') setFocus('');
                    mapFocus?.focus?.();
                  }, 60);
                } else {
                  setFocus('cluster-btn');
                }
              }}
              onFocus={() => setFocus('cluster-btn')}
              style={[
                styles.controlButton,
                (focus === 'cluster-btn' || (focus === '' && mode === 'cluster')) && styles.focusedButton,
                { 
                  backgroundColor: mode === 'cluster' ? 'rgba(255, 215, 0, 0.2)' : 'rgba(50, 50, 60, 0.9)',
                }
              ]}
              activeOpacity={0.7}
              nextFocusLeft={mapFocus?.getNodeHandle?.() ?? undefined}
            >
              <MaterialCommunityIcons 
                name="map-marker-multiple" 
                size={28} 
                color={mode === 'cluster' ? '#FFD700' : '#FFFFFF'}
              />
            </TouchableOpacity>
            <Text style={{ 
              color: mode === 'cluster' ? '#FFD700' : '#FFFFFF', 
              fontSize: 14, 
              marginTop: 6,
              fontWeight: '500',
              textShadowColor: 'rgba(0, 0, 0, 0.5)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2,
            }}>
              Clusters
            </Text>
          </View>

          {/* Zoom Controls */}
          <View style={styles.controlGroup}>
            <TouchableOpacity
              {...zoomInButton}
              onPress={() => {
                handleZoomIn();
                setFocus('zoom-in');
              }}
              onFocus={() => setFocus('zoom-in')}
              style={[
                styles.controlButton,
                focus === 'zoom-in' && styles.focusedButton,
                { backgroundColor: 'rgba(50, 50, 60, 0.9)' }
              ]}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name="magnify-plus" 
                size={28} 
                color="#FFD700"
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              {...zoomOutButton}
              onPress={() => {
                handleZoomOut();
                setFocus('zoom-out');
              }}
              onFocus={() => setFocus('zoom-out')}
              style={[
                styles.controlButton,
                focus === 'zoom-out' && styles.focusedButton,
                { 
                  backgroundColor: 'rgba(50, 50, 60, 0.9)',
                  marginTop: 8
                }
              ]}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name="magnify-minus" 
                size={28} 
                color="#FFD700"
              />
            </TouchableOpacity>
            <Text style={{ 
              color: (focus === 'zoom-in' || focus === 'zoom-out') ? '#FFD700' : '#FFFFFF', 
              fontSize: 14, 
              marginTop: 8,
              fontWeight: '500',
              textShadowColor: 'rgba(0, 0, 0, 0.5)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2,
            }}>
              Zoom
            </Text>
          </View>

          {/* Exit Fullscreen Button */}
          <View style={styles.controlGroup}>
            <TouchableOpacity
              {...fullscreenButton}
              onPress={() => {
                setIsFullscreen(false);
                setFocus('fullscreen-btn');
              }}
              onFocus={() => setFocus('exit-fullscreen')}
              style={[
                styles.controlButton,
                focus === 'exit-fullscreen' && styles.focusedButton,
                { 
                  backgroundColor: 'rgba(200, 50, 50, 0.9)',
                }
              ]}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name="fullscreen-exit" 
                size={28} 
                color="#FFFFFF"
              />
            </TouchableOpacity>
            <Text style={{ 
              color: focus === 'exit-fullscreen' ? '#FF6B6B' : '#FF9999', 
              fontSize: 14, 
              marginTop: 6,
              fontWeight: '500',
              textShadowColor: 'rgba(0, 0, 0, 0.5)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2,
            }}>
              Exit
            </Text>
          </View>
        </View>

        {/* Show info panel if a cluster is selected */}
        {selectedCluster && (
          <InfoPanel
            title={selectedCluster.name}
            color={selectedCluster.color}
            subtitle={`Population: ${selectedCluster.pop}`}
            cities={selectedCluster.cities}
            onClose={() => setSelectedCluster(null)}
          />
        )}
      </View>
    );
  }

  // Normal rendering
  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <WebView
          ref={webRef}
          key={webViewKey}
          source={{ html }}
          style={{ flex: 1 }}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          scalesPageToFit
          bounces={false}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          ref={clusterButtonRef}
          tvParallaxProperties={isTV ? {
            enabled: true,
            shiftDistanceX: 2,
            shiftDistanceY: 2,
            tiltAngle: 0.05,
            pressDuration: 0.3,
            pressDelay: 0,
            pressMagnification: 1.2
          } : undefined}
          onPress={() => {
            setMode('cluster');
            setFocus('mode-cluster');
          }}
          onFocus={() => {
            clusterButton.onFocus();
            setFocus('mode-cluster');
          }}
          onBlur={clusterButton.onBlur}
          style={[
            styles.modeButton,
            mode === 'cluster' && styles.activeMode,
            (focus === 'mode-cluster' || clusterButton.isFocused) ? styles.focusedButton : styles.inactiveButton,
            { opacity: (focus === 'mode-cluster' || clusterButton.isFocused) ? 1 : 0.8 }
          ]}
          activeOpacity={1}
          hasTVPreferredFocus={focus === 'mode-cluster'}
          nextFocusUp={-1}
          nextFocusDown={mode === 'zoom' ? zoomInButton.getNodeHandle() : fullscreenButton.getNodeHandle()}
          nextFocusLeft={-1}
          nextFocusRight={zoomButton.getNodeHandle()}
        >
          <Text style={[styles.modeText, mode === 'cluster' && styles.selectedMode]}>
            Cluster View
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          ref={zoomButtonRef}
          tvParallaxProperties={isTV ? {
            enabled: true,
            shiftDistanceX: 2,
            shiftDistanceY: 2,
            tiltAngle: 0.05,
            pressDuration: 0.3,
            pressDelay: 0,
            pressMagnification: 1.2
          } : undefined}
          onPress={() => {
            setMode('zoom');
            setFocus('mode-zoom');
          }}
          onFocus={() => {
            zoomButton.onFocus();
            setFocus('mode-zoom');
          }}
          onBlur={zoomButton.onBlur}
          style={[
            styles.modeButton,
            mode === 'zoom' && styles.activeMode,
            (focus === 'mode-zoom' || zoomButton.isFocused) ? styles.focusedButton : styles.inactiveButton,
            { opacity: (focus === 'mode-zoom' || zoomButton.isFocused) ? 1 : 0.8 }
          ]}
          activeOpacity={1}
          nextFocusUp={-1}
          nextFocusDown={zoomInButton.getRef()}
          nextFocusLeft={clusterButton.getRef()}
          nextFocusRight={fullscreenButton.getRef()}
        >
          <Text style={[styles.modeText, mode === 'zoom' && styles.selectedMode]}>
            Zoom View
          </Text>
        </TouchableOpacity>
        
        {mode === 'zoom' && (
          <>
            <TouchableOpacity
              ref={zoomInButtonRef}
              tvParallaxProperties={isTV ? {
                enabled: true,
                shiftDistanceX: 2,
                shiftDistanceY: 2,
                tiltAngle: 0.05,
                pressDuration: 0.3,
                pressDelay: 0,
                pressMagnification: 1.1
              } : undefined}
              onPress={handleZoomIn}
              onFocus={() => {
                zoomInButton.onFocus();
                setFocus('zoom-in');
              }}
              onBlur={zoomInButton.onBlur}
              style={[
                styles.controlButton,
                (focus === 'zoom-in' || zoomInButton.isFocused) ? styles.focusedButton : styles.inactiveButton,
                { opacity: (focus === 'zoom-in' || zoomInButton.isFocused) ? 1 : 0.8 }
              ]}
              activeOpacity={1}
              nextFocusUp={zoomButton.getRef()}
              nextFocusDown={zoomOutButton.getRef()}
              nextFocusLeft={-1}
              nextFocusRight={zoomOutButton.getRef()}
              hasTVPreferredFocus={focus === 'zoom-in'}
            >
              <MaterialCommunityIcons name="magnify-plus-outline" size={24} color="#fff" />
              <Text style={styles.buttonText}>Zoom In</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              ref={zoomOutButtonRef}
              tvParallaxProperties={isTV ? {
                enabled: true,
                shiftDistanceX: 2,
                shiftDistanceY: 2,
                tiltAngle: 0.05,
                pressDuration: 0.3,
                pressDelay: 0,
                pressMagnification: 1.1
              } : undefined}
              onPress={handleZoomOut}
              onFocus={() => {
                zoomOutButton.onFocus();
                setFocus('zoom-out');
              }}
              onBlur={zoomOutButton.onBlur}
              style={[
                styles.controlButton,
                (focus === 'zoom-out' || zoomOutButton.isFocused) ? styles.focusedButton : styles.inactiveButton,
                { opacity: (focus === 'zoom-out' || zoomOutButton.isFocused) ? 1 : 0.8 }
              ]}
              activeOpacity={1}
              nextFocusUp={zoomInButton.getRef()}
              nextFocusDown={fullscreenButton.getRef()}
              nextFocusLeft={zoomInButton.getRef()}
              nextFocusRight={fullscreenButton.getRef()}
              hasTVPreferredFocus={focus === 'zoom-out'}
            >
              <MaterialCommunityIcons name="magnify-minus-outline" size={24} color="#fff" />
              <Text style={styles.buttonText}>Zoom Out</Text>
            </TouchableOpacity>
          </>
        )}
        
        <FullscreenContext.Consumer>
          {({ isFullscreen, setIsFullscreen }) => (
            <TouchableOpacity
              ref={fullscreenButtonRef}
              tvParallaxProperties={isTV ? {
                enabled: true,
                shiftDistanceX: 2,
                shiftDistanceY: 2,
                tiltAngle: 0.05,
                pressDuration: 0.3,
                pressDelay: 0,
                pressMagnification: 1.1
              } : undefined}
              onPress={() => {
                const newFullscreen = !isFullscreen;
                setIsFullscreen(newFullscreen);
                setFocus(newFullscreen ? 'exit-fullscreen' : 'mode-cluster');
              }}
              onFocus={() => {
                fullscreenButton.onFocus();
                setFocus(isFullscreen ? 'exit-fullscreen' : 'fullscreen-btn');
              }}
              onBlur={fullscreenButton.onBlur}
              style={[
                styles.fullscreenButton,
                ((focus === 'fullscreen-btn' || focus === 'exit-fullscreen' || fullscreenButton.isFocused))
                  ? styles.focusedButton 
                  : styles.inactiveButton,
                { 
                  opacity: (focus === 'fullscreen-btn' || focus === 'exit-fullscreen' || fullscreenButton.isFocused) ? 1 : 0.8 
                }
              ]}
              activeOpacity={1}
              nextFocusUp={mode === 'zoom' ? zoomOutButton.getRef() : zoomButton.getRef()}
              nextFocusDown={-1}
              nextFocusLeft={mode === 'zoom' ? zoomOutButton.getRef() : -1}
              nextFocusRight={-1}
              hasTVPreferredFocus={focus === 'fullscreen-btn' || focus === 'exit-fullscreen'}
            >
              <MaterialCommunityIcons 
                name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'} 
                size={24} 
                color="#FFD700" 
              />
              <Text style={[styles.buttonText, { color: '#FFD700' }]}>
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </Text>
            </TouchableOpacity>
          )}
        </FullscreenContext.Consumer>
        
        {mode === 'cluster' && focus === '' && (
          <View style={styles.focusedIndicator}>
            <Text style={styles.focusedText}>Focused: {CLUSTERS[focusedIdx]?.name || 'None'}</Text>
          </View>
        )}
      </View>

      {selectedCluster && (
        <InfoPanel
          title={selectedCluster.name}
          color={selectedCluster.color}
          subtitle={`Population: ${selectedCluster.pop}`}
          cities={selectedCluster.cities}
          onClose={() => setSelectedCluster(null)}
        />
      )}

      <View style={styles.instructions}><Text style={styles.instructionText}>{mode === 'cluster' ? '📍 D-Pad: Navigate clusters • SELECT: Zoom & show cities' : '🔍 D-Pad UP/DOWN: Select zoom • SELECT: Zoom action'}</Text></View>
    </View>
  );
}

function InfoPanel({ title, subtitle, color, cities, onClose }: { title: string; subtitle: string; color: string; cities: City[]; onClose: () => void }) {
  return (
    <View style={[styles.infoPanel, { borderColor: color }]}>
      <View style={styles.infoPanelHeader}>
        <View>
          <Text style={styles.infoPanelTitle}>{title}</Text>
          <Text style={styles.infoPanelSubtitle}>{subtitle}</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}><Text style={styles.closeButtonText}>✕</Text></TouchableOpacity>
      </View>
      <ScrollView style={styles.citiesList}>
        <Text style={styles.citiesTitle}>Major Cities:</Text>
        {cities.map((c, i) => (
          <View key={`${c.name}-${i}`} style={styles.cityItem}>
            <Text style={styles.cityBullet}>📍</Text>
            <View style={styles.cityInfo}><Text style={styles.cityName}>{c.name}</Text><Text style={styles.cityDescription}>{c.info}</Text></View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function generateMapHTML(clusters: Cluster[], focusedIndex: number, selectedId: string | null, zoom: number) {
  const clustersJSON = JSON.stringify(clusters);
  const selectedJSON = selectedId ? JSON.stringify(selectedId) : 'null';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.9; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    html, body, #map { height: 100%; width: 100%; margin: 0; }
    
    /* Cluster Pin Styles */
    .pin { 
      position: absolute; 
      bottom: 0; 
      left: -20px; 
      width: 50px; 
      height: 70px; 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      transition: all 0.25s cubic-bezier(0.2, 0, 0.1, 1);
      z-index: 100;
      transform-origin: bottom center;
    }
    
    .pin-h { 
      width: 45px; 
      height: 45px; 
      border-radius: 50% 50% 50% 0; 
      transform: rotate(-45deg); 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      border: 3px solid rgba(255, 255, 255, 0.95);
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,240,240,0.8) 100%);
      transition: all 0.25s cubic-bezier(0.2, 0, 0.1, 1);
    }
    
    .pin-c { 
      transform: rotate(45deg); 
      text-align: center; 
      font-weight: 800; 
      color: #2c3e50; 
      font-size: 10px;
      width: 100%;
      text-shadow: 0 1px 2px rgba(255,255,255,0.7);
    }
    
    .pin-n { 
      font-size: 10px; 
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 40px;
      color: #2c3e50;
    }
    
    .pin-ct { 
      font-size: 11px; 
      margin-top: 4px; 
      background: rgba(255,255,255,0.9); 
      padding: 2px 6px; 
      border-radius: 10px;
      font-weight: 700;
      color: #2c3e50;
      box-shadow: 0 2px 4px rgba(0,0,0,0.15);
      border: 1px solid rgba(0,0,0,0.1);
    }
    
    .pin-p { 
      width: 0; 
      height: 0; 
      border-left: 8px solid transparent; 
      border-right: 8px solid transparent; 
      border-top: 14px solid #fff; 
      margin-top: -1px; 
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
      transition: all 0.25s cubic-bezier(0.2, 0, 0.1, 1);
    }
    
    /* Focused State */
    .pin.focused { 
      transform: scale(1.3) translateY(-5px);
      z-index: 200;
    }
    
    .pin.focused .pin-h { 
      border-color: #FFD700;
      background: linear-gradient(135deg, #fff8e1 0%, #ffe0b2 100%);
      box-shadow: 0 0 0 2px #FFD700, 0 4px 15px rgba(255, 215, 0, 0.6);
      animation: pulse 2s infinite;
    }
    
    /* Selected State */
    .pin.selected { 
      transform: scale(1.4) translateY(-6px);
      z-index: 300;
    }
    
    .pin.selected .pin-h { 
      border-color: #4CAF50;
      background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
      box-shadow: 0 0 0 3px #4CAF50, 0 5px 20px rgba(76, 175, 80, 0.5);
    }
    
    /* City Marker Styles */
    .city { 
      position: absolute; 
      bottom: 0; 
      left: -10px; 
      width: 26px; 
      height: 40px; 
      display: flex; 
      flex-direction: column; 
      align-items: center;
      transition: all 0.2s ease;
      z-index: 50;
      transform-origin: bottom center;
    }
    
    .city-h { 
      width: 24px; 
      height: 24px; 
      border-radius: 50% 50% 50% 0; 
      transform: rotate(-45deg); 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      border: 2px solid rgba(255,255,255,0.95);
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,240,240,0.8) 100%);
    }
    
    .city-c { 
      transform: rotate(45deg); 
      font-weight: 600; 
      color: #2c3e50; 
      font-size: 7px; 
      text-shadow: 0 1px 1px rgba(255,255,255,0.7);
      padding: 1px;
    }
    
    .city-p { 
      width: 0; 
      height: 0; 
      border-left: 5px solid transparent; 
      border-right: 5px solid transparent; 
      border-top: 10px solid #fff; 
      margin-top: -1px; 
      filter: drop-shadow(0 1px 3px rgba(0,0,0,0.15));
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const clusters = ${clustersJSON};
    const focusedIndex = ${focusedIndex};
    const selectedId = ${selectedJSON};
    const initialZoom = ${zoom};

    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
    }).setView([39.8283, -98.5795], initialZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    clusters.forEach((cluster, index) => {
      const isFocused = index === focusedIndex;
      const isSelected = selectedId && cluster.id === selectedId;

      const icon = L.divIcon({
        className: '',
        html: \`
          <div class="pin \${isFocused ? 'focused' : ''} \${isSelected ? 'selected' : ''}">
            <div class="pin-h" style="background:\${cluster.color}">
              <div class="pin-c">
                <div class="pin-n">\${cluster.name.split(' ')[0]}</div>
                <div class="pin-ct">\${cluster.cities.length}</div>
              </div>
            </div>
            <div class="pin-p" style="border-top-color:\${cluster.color}"></div>
          </div>
        \`,
        iconSize: [60, 85],
        iconAnchor: [30, 85],
      });

      L.marker([cluster.lat, cluster.lon], { icon }).addTo(map);

      if (isSelected) {
        cluster.cities.forEach(city => {
          const cityIcon = L.divIcon({
            className: '',
            html: \`
              <div class="city">
                <div class="city-h" style="background:\${cluster.color}">
                  <div class="city-c">\${city.name.substring(0, 3)}</div>
                </div>
                <div class="city-p" style="border-top-color:\${cluster.color}"></div>
              </div>
            \`,
            iconSize: [30, 45],
            iconAnchor: [15, 45],
          });

          L.marker([city.lat, city.lon], { icon: cityIcon }).addTo(map);
        });
      }
    });

    if (selectedId) {
      const target = clusters.find(cluster => cluster.id === selectedId);
      if (target) {
        map.setView([target.lat, target.lon], Math.max(initialZoom, 8));
      }
    }
  </script>
</body>
</html>`;
}
