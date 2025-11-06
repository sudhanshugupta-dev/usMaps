import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  findNodeHandle,
  TVEventControl,
  useTVEventHandler,
} from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FullscreenContext } from '@/app/rnmaps/context/FullscreenContext';

type TouchableOpacityHandle = React.ElementRef<typeof TouchableOpacity>;

const isTV = Platform.OS === 'android' && Platform.isTV;
const CONTROL_PANEL_WIDTH = isTV ? 256 : 208;
const CONTROL_PANEL_OFFSET = CONTROL_PANEL_WIDTH + (isTV ? 32 : 24);
const DEFAULT_ZOOM = 3.1;
const MIN_ZOOM = 2.0;
const MAX_ZOOM = 9.0;
const INITIAL_CENTER = { lat: 28.5, lon: -45 };
const PAN_LAT_LIMIT = 80;

type WeatherForecast = {
  period: string;
  summary: string;
};

type WeatherCluster = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  mapLat?: number;
  mapLon?: number;
  color: string;
  icon: string;
  temperature: string;
  condition: string;
  humidity: number;
  wind: string;
  coverage: number;
  narrative: string;
  alerts?: string;
  forecast: WeatherForecast[];
};

type MapCenter = {
  lat: number;
  lon: number;
};

const WEATHER_CLUSTERS: WeatherCluster[] = [
  {
    id: 'pacific-nw-clouds',
    name: 'Pacific Northwest',
    lat: 47.6062,
    lon: -122.3321,
    mapLat: 63.502,
    mapLon: -151.002,
    color: '#6EA8FF',
    icon: '🌧️',
    temperature: '12°C',
    condition: 'Showers & Low Clouds',
    humidity: 88,
    wind: '15 km/h SW',
    coverage: 82,
    narrative: 'Marine layer feeding cool, moist air inland with persistent cloud cover.',
    alerts: 'Watch for slick evening commutes across Seattle & Portland corridors.',
    forecast: [
      { period: 'Morning', summary: 'Low stratus with light drizzle, highs near 11°C.' },
      { period: 'Afternoon', summary: 'Intermittent showers, breezy along the coast.' },
      { period: 'Evening', summary: 'Cloud deck thickens, scattered fog after sunset.' },
    ],
  },
  {
    id: 'rockies-high-clouds',
    name: 'Northern Rockies',
    lat: 46.8797,
    lon: -110.3626,
    mapLat: 7.132,
    mapLon: 80.221,
    color: '#A3C9F9',
    icon: '🌥️',
    temperature: '4°C',
    condition: 'High Clouds & Snow Gusts',
    humidity: 72,
    wind: '25 km/h N',
    coverage: 68,
    narrative: 'Cold front spilling over the divide keeps cloud tops high with flurries.',
    forecast: [
      { period: 'Morning', summary: 'Patchy snow showers above 1500m, wind chills sub-zero.' },
      { period: 'Afternoon', summary: 'Clouds thicken, brief white-out bursts on passes.' },
      { period: 'Overnight', summary: 'Clearing east of the divide, lows down to -5°C.' },
    ],
  },
  {
    id: 'great-plains-anvils',
    name: 'Central Plains',
    lat: 38.627,
    lon: -90.1994,
    mapLat: -33.8688,
    mapLon: 151.2093,
    color: '#5AC8FA',
    icon: '⛈️',
    temperature: '21°C',
    condition: 'Anvil Clouds & Storm Clusters',
    humidity: 76,
    wind: '30 km/h S',
    coverage: 74,
    narrative: 'Dryline firing multi-cell storms with expansive anvil shields drifting NE.',
    alerts: 'Strong wind gusts & pea-sized hail possible late afternoon.',
    forecast: [
      { period: 'Early Afternoon', summary: 'Towering cumulus, isolated lightning strikes.' },
      { period: 'Late Afternoon', summary: 'Storm clusters congeal, heavy downpours develop.' },
      { period: 'Evening', summary: 'Storms march toward Midwest, trailing stratiform rain.' },
    ],
  },
  {
    id: 'gulf-coast-marine',
    name: 'Gulf Coast',
    lat: 29.7604,
    lon: -95.3698,
    mapLat: -23.5505,
    mapLon: -46.6333,
    color: '#4DD0E1',
    icon: '🌦️',
    temperature: '26°C',
    condition: 'Humid Marine Clouds',
    humidity: 92,
    wind: '10 km/h SE',
    coverage: 88,
    narrative: 'Tropical moisture keeps thick cumulus streaming onshore with warm temps.',
    forecast: [
      { period: 'Morning', summary: 'Patchy coastal showers, muggy feel with dew points near 24°C.' },
      { period: 'Afternoon', summary: 'Pulse thunderstorms inland; quick downpours then clearing.' },
      { period: 'Night', summary: 'Cloud deck rebuilds with steady breeze from the Gulf.' },
    ],
  },
  {
    id: 'northeast-layered',
    name: 'Northeast Corridor',
    lat: 40.7128,
    lon: -74.006,
    mapLat: 51.5074,
    mapLon: -0.1278,
    color: '#9FA8DA',
    icon: '☁️',
    temperature: '14°C',
    condition: 'Layered Cloud Shield',
    humidity: 81,
    wind: '18 km/h NE',
    coverage: 79,
    narrative: 'Nor’easter offshore keeps layered cloud shield and occasional mist inland.',
    alerts: 'Reduced visibility along I-95 corridor into late evening.',
    forecast: [
      { period: 'Morning', summary: 'Low ceiling under 600m, patchy drizzle near the coast.' },
      { period: 'Afternoon', summary: 'Steady overcast, winds gusting 35 km/h along shoreline.' },
      { period: 'Overnight', summary: 'Cloud deck slowly erodes west to east as system lifts.' },
    ],
  },
];

const getClusterPosition = (cluster: WeatherCluster) => ({
  lat: cluster.mapLat ?? cluster.lat,
  lon: cluster.mapLon ?? cluster.lon,
});

type FocusKey =
  | ''
  | 'map-entry'
  | 'pan-btn'
  | 'zoom-in'
  | 'zoom-out'
  | 'details-btn'
  | 'fullscreen-btn'
  | 'exit-fullscreen'
  | 'dpad-up'
  | 'dpad-down'
  | 'dpad-left'
  | 'dpad-right';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101424',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#050608',
  },
  map: {
    flex: 1,
  },
  mapFocusTrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 10,
    right: CONTROL_PANEL_OFFSET,
    paddingRight: CONTROL_PANEL_OFFSET > 0 ? 8 : 0,
  },
  controls: {
    position: 'absolute',
    right: 16,
    backgroundColor: 'rgba(20, 24, 44, 0.94)',
    borderRadius: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 20,
    width: CONTROL_PANEL_WIDTH,
    zIndex: 24,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(34, 39, 68, 0.9)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    width: '100%',
  },
  buttonText: {
    color: '#F0F3FF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },
  buttonLabelColumn: {
    marginLeft: 10,
    flex: 1,
    flexDirection: 'column',
  },
  subText: {
    color: 'rgba(200, 210, 255, 0.78)',
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  focusedButton: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.18)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 12,
    elevation: 14,
  },
  inactiveButton: {
    opacity: 0.86,
  },
  dpadWrapper: {
    position: 'absolute',
    bottom: isTV ? 120 : 96,
    right: CONTROL_PANEL_OFFSET + 24,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 26,
  },
  dpadFullscreenWrapper: {
    bottom: isTV ? 140 : 112,
    right: 24,
  },
  dpadBase: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(16, 22, 40, 0.86)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(140, 170, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 18,
  },
  dpadButton: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(42, 56, 92, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(180, 210, 255, 0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 10,
  },
  dpadFocusedButton: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.22)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    transform: [{ scale: 1.08 }],
    elevation: 14,
  },
  dpadButtonIcon: {
    fontSize: 22,
    color: '#E0ECFF',
  },
  dpadUp: {
    top: 12,
  },
  dpadDown: {
    bottom: 12,
  },
  dpadLeft: {
    left: 12,
  },
  dpadRight: {
    right: 12,
  },
  dpadCenter: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: 'rgba(64, 78, 118, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(160, 190, 255, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadCenterText: {
    color: '#F8FBFF',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  infoPanel: {
    position: 'absolute',
    bottom: isTV ? 72 : 48,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(17, 21, 38, 0.95)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 3,
    borderColor: '#334166',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 22,
    height: isTV ? '80%' : 220,
    width: isTV ? '40%' : 'auto',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: isTV ? 26 : 20,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  infoSubtitle: {
    fontSize: isTV ? 16 : 13,
    color: '#A7B8D6',
    marginTop: 6,
    maxWidth: '90%',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E94560',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 54, 92, 0.92)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  metricText: {
    color: '#F5F8FF',
    fontWeight: '600',
  },
  forecastList: {
    maxHeight: isTV ? 220 : 150,
  },
  forecastItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(160, 175, 210, 0.25)',
  },
  forecastPeriod: {
    color: '#FFD700',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 6,
  },
  forecastSummary: {
    color: '#CFDBFF',
    fontSize: 14,
    lineHeight: 20,
  },
  focusBadge: {
    position: 'absolute',
    top: 24,
    left: 24,
    backgroundColor: 'rgba(255, 215, 0, 0.92)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 18,
  },
  focusBadgeText: {
    color: '#192038',
    fontWeight: '800',
    fontSize: isTV ? 18 : 15,
  },
  narrative: {
    color: '#AEC4FF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  alertText: {
    color: '#FF8A80',
    fontSize: 13,
    marginTop: -4,
    fontWeight: '600',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#050608',
  },
  fullscreenMap: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fullscreenControls: {
    position: 'absolute',
    top: 24,
    right: 24,
    backgroundColor: 'rgba(18, 24, 47, 0.88)',
    borderRadius: 18,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    elevation: 24,
    width: CONTROL_PANEL_WIDTH,
    zIndex: 28,
  },
  fullscreenFocusedButton: {
    borderColor: '#FFE066',
    backgroundColor: 'rgba(255, 224, 102, 0.22)',
    shadowColor: '#FFE066',
    shadowOpacity: 0.85,
    shadowRadius: 16,
  },
  focusOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 12,
    right: CONTROL_PANEL_OFFSET,
    paddingRight: CONTROL_PANEL_OFFSET > 0 ? 12 : 0,
  },
});

export default function WeatherScreen() {
  const { isFullscreen, setIsFullscreen } = useContext(FullscreenContext);
  const [focusKey, setFocusKey] = useState<FocusKey>('');
  const [focusedIdx, setFocusedIdx] = useState(0);
  const [selectedCluster, setSelectedCluster] = useState<WeatherCluster | null>(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [mapCenter, setMapCenter] = useState<MapCenter>(INITIAL_CENTER);
  const mapCenterRef = useRef<MapCenter>(INITIAL_CENTER);
  const [isPanMode, setIsPanMode] = useState(false);
  const webRef = useRef<WebView>(null);

  const mapFocusRef = useRef<TouchableOpacityHandle | null>(null);
  const mapEntryRef = useRef<TouchableOpacityHandle | null>(null);
  const panButtonRef = useRef<TouchableOpacityHandle | null>(null);
  const zoomInRef = useRef<TouchableOpacityHandle | null>(null);
  const zoomOutRef = useRef<TouchableOpacityHandle | null>(null);
  const detailsRef = useRef<TouchableOpacityHandle | null>(null);
  const fullscreenRef = useRef<TouchableOpacityHandle | null>(null);
  const dpadUpRef = useRef<TouchableOpacityHandle | null>(null);
  const dpadDownRef = useRef<TouchableOpacityHandle | null>(null);
  const dpadLeftRef = useRef<TouchableOpacityHandle | null>(null);
  const dpadRightRef = useRef<TouchableOpacityHandle | null>(null);

  const getButtonProps = (
    buttonRef: React.RefObject<TouchableOpacityHandle | null>,
    buttonFocusKey: FocusKey,
    options: { isEnabled?: boolean } = {},
  ) => {
    const isEnabled = options.isEnabled ?? true;

    if (!isTV) {
      return {
        ref: buttonRef as React.RefObject<TouchableOpacityHandle>,
        onFocus: () => setFocusKey(buttonFocusKey),
        onBlur: () => {},
        focusable: isEnabled,
      } as const;
    }

    const getNodeHandle = () => {
      const node = buttonRef.current ? findNodeHandle(buttonRef.current) : -1;
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

    const isFocused = focusKey === buttonFocusKey;

    return {
      ref: buttonRef,
      hasTVPreferredFocus: isFocused && isEnabled,
      onFocus: () => setFocusKey(buttonFocusKey),
      onBlur: () => {},
      focusable: isEnabled,
      focus: requestFocus,
      isFocused,
      getNodeHandle,
    } as const;
  };

  const mapEntryButton = getButtonProps(mapEntryRef, 'map-entry');
  const panButton = getButtonProps(panButtonRef, 'pan-btn');
  const zoomInButton = getButtonProps(zoomInRef, 'zoom-in');
  const zoomOutButton = getButtonProps(zoomOutRef, 'zoom-out');
  const detailsButton = getButtonProps(detailsRef, 'details-btn');
  const fullscreenButton = getButtonProps(fullscreenRef, isFullscreen ? 'exit-fullscreen' : 'fullscreen-btn');
  const mapFocus = isTV ? getButtonProps(mapFocusRef, '' as FocusKey) : null;
  const dpadUpButton = getButtonProps(dpadUpRef, 'dpad-up', { isEnabled: isPanMode });
  const dpadDownButton = getButtonProps(dpadDownRef, 'dpad-down', { isEnabled: isPanMode });
  const dpadLeftButton = getButtonProps(dpadLeftRef, 'dpad-left', { isEnabled: isPanMode });
  const dpadRightButton = getButtonProps(dpadRightRef, 'dpad-right', { isEnabled: isPanMode });

  const handleWebViewMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.type === 'MAP_VIEW_CHANGED' && typeof data.lat === 'number' && typeof data.lon === 'number') {
        const nextCenter = {
          lat: Math.max(Math.min(data.lat, PAN_LAT_LIMIT), -PAN_LAT_LIMIT),
          lon: data.lon,
        };
        mapCenterRef.current = nextCenter;
        setMapCenter(nextCenter);
      }
    } catch (err) {
      // ignore malformed message
    }
  }, []);

  const panMap = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 4.5 / Math.max(zoom, 1);
    const current = mapCenterRef.current;
    let nextLat = current.lat;
    let nextLon = current.lon;

    switch (direction) {
      case 'up':
        nextLat = Math.min(current.lat + step, PAN_LAT_LIMIT);
        break;
      case 'down':
        nextLat = Math.max(current.lat - step, -PAN_LAT_LIMIT);
        break;
      case 'left':
        nextLon = current.lon - step * 1.6;
        break;
      case 'right':
        nextLon = current.lon + step * 1.6;
        break;
    }

    mapCenterRef.current = { lat: nextLat, lon: nextLon };
    setMapCenter(mapCenterRef.current);

    if (webRef.current) {
      webRef.current.injectJavaScript(`
        (function(){
          const mapElement = document.getElementById('map');
          const map = mapElement && mapElement._leaflet_map;
          if (map) {
            map.panTo([${nextLat}, ${nextLon}], { animate: true, duration: 0.4 });
          }
          true;
        })();
        true;
      `);
    }
  }, [zoom]);

  const renderDpad = useCallback(
    (wrapperStyle?: StyleProp<ViewStyle>) => (
      <View style={[styles.dpadWrapper, wrapperStyle]} pointerEvents="box-none">
        <View style={styles.dpadBase} />
        <TouchableOpacity
          {...dpadUpButton}
          style={[
            styles.dpadButton,
            styles.dpadUp,
            dpadUpButton.isFocused ? styles.dpadFocusedButton : null,
          ]}
          activeOpacity={0.85}
          nextFocusDown={dpadDownButton.getNodeHandle?.() ?? undefined}
          nextFocusLeft={dpadLeftButton.getNodeHandle?.() ?? undefined}
          nextFocusRight={dpadRightButton.getNodeHandle?.() ?? undefined}
          nextFocusUp={panButton.getNodeHandle?.() ?? undefined}
          onPress={() => panMap('up')}
        >
          <MaterialCommunityIcons name="chevron-up" style={styles.dpadButtonIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          {...dpadDownButton}
          style={[
            styles.dpadButton,
            styles.dpadDown,
            dpadDownButton.isFocused ? styles.dpadFocusedButton : null,
          ]}
          activeOpacity={0.85}
          nextFocusUp={dpadUpButton.getNodeHandle?.() ?? undefined}
          nextFocusLeft={dpadLeftButton.getNodeHandle?.() ?? undefined}
          nextFocusRight={dpadRightButton.getNodeHandle?.() ?? undefined}
          nextFocusDown={fullscreenButton.getNodeHandle?.() ?? undefined}
          onPress={() => panMap('down')}
        >
          <MaterialCommunityIcons name="chevron-down" style={styles.dpadButtonIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          {...dpadLeftButton}
          style={[
            styles.dpadButton,
            styles.dpadLeft,
            dpadLeftButton.isFocused ? styles.dpadFocusedButton : null,
          ]}
          activeOpacity={0.85}
          nextFocusRight={dpadUpButton.getNodeHandle?.() ?? undefined}
          nextFocusUp={panButton.getNodeHandle?.() ?? undefined}
          nextFocusDown={fullscreenButton.getNodeHandle?.() ?? undefined}
          nextFocusLeft={mapFocus?.getNodeHandle?.() ?? undefined}
          onPress={() => panMap('left')}
        >
          <MaterialCommunityIcons name="chevron-left" style={styles.dpadButtonIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          {...dpadRightButton}
          style={[
            styles.dpadButton,
            styles.dpadRight,
            dpadRightButton.isFocused ? styles.dpadFocusedButton : null,
          ]}
          activeOpacity={0.85}
          nextFocusLeft={dpadUpButton.getNodeHandle?.() ?? undefined}
          nextFocusUp={panButton.getNodeHandle?.() ?? undefined}
          nextFocusDown={fullscreenButton.getNodeHandle?.() ?? undefined}
          nextFocusRight={mapEntryButton.getNodeHandle?.() ?? undefined}
          onPress={() => panMap('right')}
        >
          <MaterialCommunityIcons name="chevron-right" style={styles.dpadButtonIcon} />
        </TouchableOpacity>
        <View style={styles.dpadCenter}>
          <Text style={styles.dpadCenterText}>Pan</Text>
        </View>
      </View>
    ),
    [dpadDownButton, dpadLeftButton, dpadRightButton, dpadUpButton, panMap],
  );

  useEffect(() => {
    if (!isTV) return;

    const timer = setTimeout(() => {
      setFocusKey('');
      mapFocus?.focus?.();
    }, 120);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isTV) return;

    const dpadFocusKeys: FocusKey[] = ['dpad-up', 'dpad-down', 'dpad-left', 'dpad-right'];

    if (isPanMode) {
      if (!dpadFocusKeys.includes(focusKey)) {
        setFocusKey('dpad-up');
        requestAnimationFrame(() => dpadUpButton.focus?.());
      }
    } else if (dpadFocusKeys.includes(focusKey)) {
      setFocusKey('pan-btn');
      requestAnimationFrame(() => panButton.focus?.());
    }
  }, [focusKey, isPanMode, dpadUpButton, panButton, isTV]);

  useEffect(() => {
    if (!isTV) return;

    requestAnimationFrame(() => {
      switch (focusKey) {
        case '':
          mapFocus?.focus?.();
          break;
        case 'map-entry':
          mapEntryButton.focus?.();
          break;
        case 'pan-btn':
          panButton.focus?.();
          break;
        case 'zoom-in':
          zoomInButton.focus?.();
          break;
        case 'zoom-out':
          zoomOutButton.focus?.();
          break;
        case 'details-btn':
          detailsButton.focus?.();
          break;
        case 'fullscreen-btn':
        case 'exit-fullscreen':
          fullscreenButton.focus?.();
          break;
        case 'dpad-up':
          dpadUpButton.focus?.();
          break;
        case 'dpad-down':
          dpadDownButton.focus?.();
          break;
        case 'dpad-left':
          dpadLeftButton.focus?.();
          break;
        case 'dpad-right':
          dpadRightButton.focus?.();
          break;
      }
    });
  }, [focusKey, isFullscreen, dpadDownButton, dpadLeftButton, dpadRightButton, dpadUpButton]);

  const handleZoomIn = () => {
    setZoom(prev => {
      const next = prev + 0.6;
      return next > MAX_ZOOM ? MAX_ZOOM : next;
    });
  };

  const handleZoomOut = () => {
    setZoom(prev => {
      const next = prev - 0.6;
      return next < MIN_ZOOM ? MIN_ZOOM : next;
    });
  };

  const focusClusterAbove = () => {
    const current = WEATHER_CLUSTERS[focusedIdx];
    if (!current) return false;

    const currentLat = getClusterPosition(current).lat;
    const candidates = WEATHER_CLUSTERS.map((cluster, index) => ({ cluster, index }))
      .filter(item => getClusterPosition(item.cluster).lat > currentLat)
      .sort((a, b) => getClusterPosition(a.cluster).lat - getClusterPosition(b.cluster).lat);

    if (candidates.length) {
      setFocusedIdx(candidates[0].index);
      return true;
    }

    return false;
  };

  const focusClusterBelow = () => {
    const current = WEATHER_CLUSTERS[focusedIdx];
    if (!current) return false;

    const currentLat = getClusterPosition(current).lat;
    const candidates = WEATHER_CLUSTERS.map((cluster, index) => ({ cluster, index }))
      .filter(item => getClusterPosition(item.cluster).lat < currentLat)
      .sort((a, b) => getClusterPosition(b.cluster).lat - getClusterPosition(a.cluster).lat);

    if (candidates.length) {
      setFocusedIdx(candidates[0].index);
      return true;
    }

    return false;
  };

  const focusClusterLeft = () => {
    const current = WEATHER_CLUSTERS[focusedIdx];
    if (!current) return false;

    const currentLon = getClusterPosition(current).lon;
    const candidates = WEATHER_CLUSTERS.map((cluster, index) => ({ cluster, index }))
      .filter(item => getClusterPosition(item.cluster).lon < currentLon)
      .sort((a, b) => getClusterPosition(b.cluster).lon - getClusterPosition(a.cluster).lon);

    if (candidates.length) {
      setFocusedIdx(candidates[0].index);
      return true;
    }

    return false;
  };

  const focusClusterRight = () => {
    const current = WEATHER_CLUSTERS[focusedIdx];
    if (!current) return false;

    const currentLon = getClusterPosition(current).lon;
    const candidates = WEATHER_CLUSTERS.map((cluster, index) => ({ cluster, index }))
      .filter(item => getClusterPosition(item.cluster).lon > currentLon)
      .sort((a, b) => getClusterPosition(a.cluster).lon - getClusterPosition(b.cluster).lon);

    if (candidates.length) {
      setFocusedIdx(candidates[0].index);
      return true;
    }

    return false;
  };

  useEffect(() => {
    if (!isTV) return;

    // @ts-ignore - TVEventControl is only available on TV platforms
    TVEventControl.enableTVMenuKey?.();

    return () => {
      // @ts-ignore
      TVEventControl.disableTVMenuKey?.();
    };
  }, []);

  const selectAction = () => {
    const current = WEATHER_CLUSTERS[focusedIdx];

    if (
      focusKey === 'dpad-up' ||
      focusKey === 'dpad-down' ||
      focusKey === 'dpad-left' ||
      focusKey === 'dpad-right'
    ) {
      return;
    }

    if (focusKey === '') {
      if (!current) return;

      setSelectedCluster(prev => {
        const next = prev?.id === current.id ? null : current;
        if (next) {
          setZoom(z => (z < 6 ? 6 : z));
        } else {
          setZoom(DEFAULT_ZOOM);
        }
        return next;
      });
      return;
    }

    if (focusKey === 'map-entry') {
      setFocusKey('');
      requestAnimationFrame(() => mapFocus?.focus?.());
      return;
    }

    if (focusKey === 'pan-btn') {
      const nextPanMode = !isPanMode;
      setIsPanMode(nextPanMode);
      if (nextPanMode) {
        setFocusKey('dpad-up');
        requestAnimationFrame(() => dpadUpButton.focus?.());
      } else {
        requestAnimationFrame(() => panButton.focus?.());
      }
      return;
    }

    if (focusKey === 'zoom-in') {
      handleZoomIn();
      return;
    }

    if (focusKey === 'zoom-out') {
      handleZoomOut();
      return;
    }

    if (focusKey === 'details-btn') {
      if (current) {
        if (selectedCluster?.id === current.id) {
          setSelectedCluster(null);
          setZoom(DEFAULT_ZOOM);
        } else {
          setSelectedCluster(current);
          setZoom(z => (z < 6 ? 6 : z));
        }
      }
      return;
    }

    if (focusKey === 'fullscreen-btn') {
      setIsFullscreen(true);
      setFocusKey('');
      requestAnimationFrame(() => mapFocus?.focus?.());
      return;
    }

    if (focusKey === 'exit-fullscreen') {
      setIsFullscreen(false);
      setFocusKey('map-entry');
      setSelectedCluster(null);
      setZoom(DEFAULT_ZOOM);
      return;
    }
  };

  const up = () => {
    if (focusKey === '') {
      const moved = focusClusterAbove();
      if (!moved) {
        setFocusKey('map-entry');
        requestAnimationFrame(() => mapEntryButton.focus?.());
      }
      return;
    }

    if (
      focusKey === 'dpad-up' ||
      focusKey === 'dpad-down' ||
      focusKey === 'dpad-left' ||
      focusKey === 'dpad-right'
    ) {
      if (focusKey === 'dpad-up') {
        setFocusKey('pan-btn');
        panButton.focus?.();
      } else {
        setFocusKey('dpad-up');
        dpadUpButton.focus?.();
      }
      return;
    }

    if (focusKey === 'map-entry') {
      requestAnimationFrame(() => mapFocus?.focus?.());
    }
  };

  const down = () => {
    if (focusKey === '') {
      const moved = focusClusterBelow();
      if (!moved) {
        setFocusKey('map-entry');
        requestAnimationFrame(() => mapEntryButton.focus?.());
      }
      return;
    }

    if (
      focusKey === 'dpad-up' ||
      focusKey === 'dpad-down' ||
      focusKey === 'dpad-left' ||
      focusKey === 'dpad-right'
    ) {
      if (focusKey === 'dpad-down') {
        const targetKey = isFullscreen ? 'exit-fullscreen' : 'fullscreen-btn';
        setFocusKey(targetKey);
        fullscreenButton.focus?.();
      } else {
        setFocusKey('dpad-down');
        dpadDownButton.focus?.();
      }
      return;
    }

    if (focusKey === 'fullscreen-btn' || focusKey === 'exit-fullscreen') {
      requestAnimationFrame(() => mapFocus?.focus?.());
    }
  };

  const left = () => {
    if (focusKey === '') {
      const moved = focusClusterLeft();
      if (!moved) {
        setFocusKey('map-entry');
        requestAnimationFrame(() => mapEntryButton.focus?.());
      }
      return;
    }

    if (
      focusKey === 'dpad-up' ||
      focusKey === 'dpad-down' ||
      focusKey === 'dpad-left' ||
      focusKey === 'dpad-right'
    ) {
      if (focusKey === 'dpad-left') {
        setFocusKey('');
        requestAnimationFrame(() => mapFocus?.focus?.());
      } else if (focusKey === 'dpad-up') {
        setFocusKey('dpad-left');
        dpadLeftButton.focus?.();
      } else if (focusKey === 'dpad-down') {
        setFocusKey('dpad-left');
        dpadLeftButton.focus?.();
      } else if (focusKey === 'dpad-right') {
        setFocusKey('dpad-up');
        dpadUpButton.focus?.();
      }
      return;
    }

    if (focusKey === 'map-entry') {
      setFocusKey('');
      requestAnimationFrame(() => mapFocus?.focus?.());
      return;
    }

    if (focusKey === 'zoom-in') {
      setFocusKey('map-entry');
      mapEntryButton.focus?.();
    } else if (focusKey === 'zoom-out') {
      setFocusKey('zoom-in');
      zoomInButton.focus?.();
    } else if (focusKey === 'details-btn') {
      setFocusKey('zoom-out');
      zoomOutButton.focus?.();
    } else if (focusKey === 'fullscreen-btn' || focusKey === 'exit-fullscreen') {
      setFocusKey('details-btn');
      detailsButton.focus?.();
    }
  };

  const right = () => {
    if (focusKey === '') {
      const moved = focusClusterRight();
      if (!moved) {
        setFocusKey('map-entry');
        requestAnimationFrame(() => mapEntryButton.focus?.());
      }
      return;
    }

    if (
      focusKey === 'dpad-up' ||
      focusKey === 'dpad-down' ||
      focusKey === 'dpad-left' ||
      focusKey === 'dpad-right'
    ) {
      if (focusKey === 'dpad-right') {
        setFocusKey('map-entry');
        mapEntryButton.focus?.();
      } else if (focusKey === 'dpad-up') {
        setFocusKey('dpad-right');
        dpadRightButton.focus?.();
      } else if (focusKey === 'dpad-down') {
        setFocusKey('dpad-right');
        dpadRightButton.focus?.();
      } else if (focusKey === 'dpad-left') {
        setFocusKey('dpad-up');
        dpadUpButton.focus?.();
      }
      return;
    }

    if (focusKey === 'map-entry') {
      setFocusKey('zoom-in');
      zoomInButton.focus?.();
    } else if (focusKey === 'zoom-in') {
      setFocusKey('zoom-out');
      zoomOutButton.focus?.();
    } else if (focusKey === 'zoom-out') {
      setFocusKey('details-btn');
      detailsButton.focus?.();
    } else if (focusKey === 'details-btn') {
      if (isFullscreen) {
        setFocusKey('exit-fullscreen');
      } else {
        setFocusKey('fullscreen-btn');
      }
      fullscreenButton.focus?.();
    }
  };

  useTVEventHandler((event) => {
    if (!isTV) return;

    switch (event.eventType) {
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
  });

  useEffect(() => {
    if (webRef.current && selectedCluster) {
      const targetZoom = Math.max(zoom, 6.5);
      const targetPosition = getClusterPosition(selectedCluster);
      webRef.current.injectJavaScript(`
        (function() {
          const mapElement = document.getElementById('map');
          const map = mapElement && mapElement._leaflet_map;
          if (map) {
            map.flyTo([${targetPosition.lat}, ${targetPosition.lon}], ${targetZoom}, {
              duration: 1,
              easeLinearity: 0.2,
              animate: true,
            });
          }
          true;
        })();
        true;
      `);
    }
  }, [selectedCluster?.id, zoom]);

  const html = useMemo(() => {
    return generateWeatherMapHTML(
      WEATHER_CLUSTERS,
      focusedIdx,
      selectedCluster?.id ?? null,
      zoom,
      mapCenter,
      isPanMode,
    );
  }, [focusedIdx, selectedCluster?.id, zoom, isPanMode, mapCenter]);

  const webViewKey = useMemo(() => {
    return `weather-map-${isFullscreen ? 'fullscreen' : 'default'}-${selectedCluster?.id ?? 'none'}-${Math.round(zoom * 10)}-${mapCenter.lat.toFixed(2)}-${mapCenter.lon.toFixed(2)}-${isPanMode ? 'pan' : 'focus'}`;
  }, [isFullscreen, selectedCluster?.id, zoom, isPanMode, mapCenter]);

  const renderControls = () => {
    const highlightStyles = (isActive: boolean) => {
      if (!isActive) {
        return [styles.inactiveButton];
      }

      return isFullscreen
        ? [styles.focusedButton, styles.fullscreenFocusedButton]
        : [styles.focusedButton];
    };

    return (
      <View style={isFullscreen ? styles.fullscreenControls : styles.controls}>
        <TouchableOpacity
          {...mapEntryButton}
          style={[styles.controlButton, ...highlightStyles(Boolean(mapEntryButton.isFocused))]}
          activeOpacity={0.9}
          nextFocusUp={mapFocus?.getNodeHandle?.() ?? undefined}
          nextFocusDown={panButton.getNodeHandle?.() ?? undefined}
          onPress={() => {
            setFocusKey('');
            requestAnimationFrame(() => mapFocus?.focus?.());
          }}
        >
          <MaterialCommunityIcons name="target" size={24} color="#FFD700" />
          <Text style={styles.buttonText}>Focus Map</Text>
        </TouchableOpacity>

        <TouchableOpacity
          {...panButton}
          style={[styles.controlButton, ...highlightStyles(Boolean(panButton.isFocused || isPanMode))]}
          activeOpacity={0.9}
          nextFocusUp={mapEntryButton.getNodeHandle?.() ?? undefined}
          nextFocusDown={zoomInButton.getNodeHandle?.() ?? undefined}
          nextFocusLeft={mapFocus?.getNodeHandle?.() ?? undefined}
          nextFocusRight={dpadUpButton.getNodeHandle?.() ?? undefined}
          onPress={() => {
            const nextPanMode = !isPanMode;
            setIsPanMode(nextPanMode);
            if (nextPanMode) {
              setFocusKey(isTV ? 'dpad-up' : '');
              requestAnimationFrame(() => {
                if (isTV) {
                  dpadUpButton.focus?.();
                } else {
                  mapFocus?.focus?.();
                }
              });
            } else {
              setFocusKey('pan-btn');
              requestAnimationFrame(() => {
                if (isTV) {
                  panButton.focus?.();
                }
              });
            }
          }}
        >
          <MaterialCommunityIcons
            name={isPanMode ? 'gesture' : 'gamepad-circle-right'}
            size={24}
            color="#A3E1FF"
          />
          <View style={styles.buttonLabelColumn}>
            <Text style={styles.buttonText}>{isPanMode ? 'Exit Pan Mode' : 'Pan Map Mode'}</Text>
            <Text style={styles.subText}>Use DPAD to move map</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          {...zoomInButton}
          style={[styles.controlButton, ...highlightStyles(Boolean(zoomInButton.isFocused))]}
          activeOpacity={0.9}
          nextFocusUp={mapEntryButton.getNodeHandle?.() ?? undefined}
          nextFocusDown={zoomOutButton.getNodeHandle?.() ?? undefined}
          nextFocusLeft={mapFocus?.getNodeHandle?.() ?? undefined}
          onPress={handleZoomIn}
        >
          <MaterialCommunityIcons name="magnify-plus" size={24} color="#9FD5FF" />
          <Text style={styles.buttonText}>Zoom In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          {...zoomOutButton}
          style={[styles.controlButton, ...highlightStyles(Boolean(zoomOutButton.isFocused))]}
          activeOpacity={0.9}
          nextFocusUp={zoomInButton.getNodeHandle?.() ?? undefined}
          nextFocusDown={detailsButton.getNodeHandle?.() ?? undefined}
          nextFocusLeft={mapFocus?.getNodeHandle?.() ?? undefined}
          onPress={handleZoomOut}
        >
          <MaterialCommunityIcons name="magnify-minus" size={24} color="#9FD5FF" />
          <Text style={styles.buttonText}>Zoom Out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          {...detailsButton}
          style={[styles.controlButton, ...highlightStyles(Boolean(detailsButton.isFocused))]}
          activeOpacity={0.9}
          nextFocusUp={zoomOutButton.getNodeHandle?.() ?? undefined}
          nextFocusDown={fullscreenButton.getNodeHandle?.() ?? undefined}
          nextFocusLeft={mapFocus?.getNodeHandle?.() ?? undefined}
          onPress={() => {
            const current = WEATHER_CLUSTERS[focusedIdx];
            if (current) {
              setSelectedCluster(current);
              setZoom(z => (z < 6 ? 6 : z));
            }
          }}
        >
          <MaterialCommunityIcons name="weather-cloudy" size={24} color="#C1D5FF" />
          <Text style={styles.buttonText}>Forecast Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          {...fullscreenButton}
          style={[styles.controlButton, ...highlightStyles(Boolean(fullscreenButton.isFocused))]}
          activeOpacity={0.9}
          nextFocusUp={detailsButton.getNodeHandle?.() ?? undefined}
          nextFocusDown={mapFocus?.getNodeHandle?.() ?? undefined}
          nextFocusLeft={mapFocus?.getNodeHandle?.() ?? undefined}
          nextFocusRight={dpadDownButton.getNodeHandle?.() ?? undefined}
          onPress={() => {
            const enteringFullscreen = !isFullscreen;
            setIsFullscreen(enteringFullscreen);
            setFocusKey(enteringFullscreen ? '' : 'map-entry');
            requestAnimationFrame(() => {
              if (enteringFullscreen) {
                mapFocus?.focus?.();
              } else {
                mapEntryButton.focus?.();
              }
            });
          }}
        >
          <MaterialCommunityIcons
            name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'}
            size={24}
            color={isFullscreen ? '#FF8A65' : '#8BC34A'}
          />
          <Text style={styles.buttonText}>{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const currentCluster = WEATHER_CLUSTERS[focusedIdx];

  if (isFullscreen) {
    return (
      <View style={styles.fullscreenContainer}>
        <WebView
          ref={webRef}
          key={webViewKey}
          source={{ html }}
          style={styles.fullscreenMap}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />

        {isTV && (
          <TouchableOpacity
            ref={mapFocusRef}
            style={styles.focusOverlay}
            activeOpacity={1}
            hasTVPreferredFocus={focusKey === ''}
            focusable
            onFocus={() => setFocusKey('')}
          />
        )}

        {renderDpad(styles.dpadFullscreenWrapper)}

        {renderControls()}

        {focusKey === '' && currentCluster && (
          <View style={styles.focusBadge}>
            <Text style={styles.focusBadgeText}>
              {currentCluster.icon} {currentCluster.name} • {currentCluster.condition}
            </Text>
          </View>
        )}

        {selectedCluster && (
          <WeatherInfoPanel
            cluster={selectedCluster}
            onClose={() => setSelectedCluster(null)}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <WebView
          ref={webRef}
          key={webViewKey}
          source={{ html }}
          style={styles.map}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />

        {isTV && (
          <TouchableOpacity
            ref={mapFocusRef}
            style={styles.mapFocusTrap}
            activeOpacity={1}
            hasTVPreferredFocus={focusKey === ''}
            focusable
            onFocus={() => setFocusKey('')}
          />
        )}

        {renderDpad()}

        {focusKey === '' && currentCluster && (
          <View style={styles.focusBadge}>
            <Text style={styles.focusBadgeText}>
              {currentCluster.icon} {currentCluster.name} • {currentCluster.condition}
            </Text>
          </View>
        )}

        {renderControls()}
      </View>

      {selectedCluster && (
        <WeatherInfoPanel
          cluster={selectedCluster}
          onClose={() => setSelectedCluster(null)}
        />
      )}
    </View>
  );
}

function WeatherInfoPanel({ cluster, onClose }: { cluster: WeatherCluster; onClose: () => void }) {
  return (
    <View style={[styles.infoPanel, { borderColor: cluster.color }]}> 
      <View style={styles.infoHeader}>
        <View>
          <Text style={styles.infoTitle}>
            {cluster.icon} {cluster.name}
          </Text>
          <Text style={styles.infoSubtitle}>{cluster.narrative}</Text>
          {cluster.alerts && <Text style={styles.alertText}>{cluster.alerts}</Text>}
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.85}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricChip}>
          <MaterialCommunityIcons name="thermometer" size={18} color={cluster.color} />
          <Text style={styles.metricText}>{cluster.temperature}</Text>
        </View>
        <View style={styles.metricChip}>
          <MaterialCommunityIcons name="water-percent" size={18} color={cluster.color} />
          <Text style={styles.metricText}>{cluster.humidity}% Humidity</Text>
        </View>
        <View style={styles.metricChip}>
          <MaterialCommunityIcons name="weather-windy" size={18} color={cluster.color} />
          <Text style={styles.metricText}>{cluster.wind}</Text>
        </View>
        <View style={styles.metricChip}>
          <MaterialCommunityIcons name="cloud" size={18} color={cluster.color} />
          <Text style={styles.metricText}>{cluster.coverage}% Coverage</Text>
        </View>
      </View>

      <ScrollView style={styles.forecastList} showsVerticalScrollIndicator={false}>
        {cluster.forecast.map(entry => (
          <View key={`${cluster.id}-${entry.period}`} style={styles.forecastItem}>
            <Text style={styles.forecastPeriod}>{entry.period}</Text>
            <Text style={styles.forecastSummary}>{entry.summary}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function generateWeatherMapHTML(
  clusters: WeatherCluster[],
  focusedIndex: number,
  selectedId: string | null,
  zoom: number,
  center: MapCenter,
  allowDrag: boolean,
) {
  const clustersJSON = JSON.stringify(clusters);
  const selectedJSON = selectedId ? JSON.stringify(selectedId) : 'null';

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
      html, body, #map { height: 100%; margin: 0; background: #050608; }
      #map { filter: saturate(1.05) brightness(0.95); }

      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-6px); }
      }

      @keyframes glow {
        0%, 100% { box-shadow: 0 0 22px rgba(255, 215, 0, 0.5); }
        50% { box-shadow: 0 0 32px rgba(255, 215, 0, 0.9); }
      }

      .cloud-pin {
        position: absolute;
        bottom: -14px;
        left: calc(-0.5 * var(--cloud-size, 132px));
        width: var(--cloud-size, 132px);
        pointer-events: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        transform-origin: bottom center;
        transition: transform 0.24s cubic-bezier(0.2, 0, 0.1, 1), filter 0.24s ease;
      }

      .cloud-glow {
        position: absolute;
        top: 6%;
        left: 50%;
        width: 88%;
        height: 58%;
        transform: translateX(-50%);
        background: radial-gradient(circle at center, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.08) 65%, transparent 100%);
        filter: blur(0);
        opacity: 0;
        transition: opacity 0.25s ease;
        pointer-events: none;
      }

      .cloud-shell {
        position: relative;
        width: 100%;
        height: calc(var(--cloud-size, 132px) * 0.6);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(232, 239, 255, 0.88) 100%);
        border-radius: calc(var(--cloud-size, 132px) * 0.34);
        border: 2px solid rgba(255, 255, 255, 0.82);
        box-shadow: 0 18px 34px rgba(0, 0, 0, 0.32);
        overflow: hidden;
      }

      .cloud-ring {
        position: absolute;
        inset: -5%;
        border-radius: inherit;
        border: 2px dashed rgba(255, 255, 255, 0.25);
        opacity: 0;
        transform: scale(0.9);
        transition: opacity 0.24s ease, transform 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease;
        pointer-events: none;
      }

      .cloud-shell::before {
        content: '';
        position: absolute;
        inset: 16% 20%;
        background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85), transparent 70%);
        opacity: 0.75;
      }

      .cloud-shell::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 50% 120%, rgba(0,0,0,0.25), transparent 55%);
        opacity: 0.28;
      }

      .cloud-puff {
        position: absolute;
        background: linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(230,237,255,0.88) 100%);
        border-radius: 50%;
        box-shadow: inset 0 0 10px rgba(255,255,255,0.4);
      }

      .cloud-puff.puff-left {
        width: 52%;
        height: 72%;
        left: 2%;
        top: 26%;
      }

      .cloud-puff.puff-mid {
        width: 60%;
        height: 82%;
        left: 23%;
        top: 18%;
      }

      .cloud-puff.puff-right {
        width: 48%;
        height: 68%;
        right: 0;
        top: 28%;
      }

      .cloud-core {
        position: absolute;
        left: 50%;
        top: 46%;
        transform: translate(-50%, -50%);
        width: calc(var(--cloud-size, 132px) * 0.34);
        height: calc(var(--cloud-size, 132px) * 0.34);
        border-radius: 50%;
        background: radial-gradient(circle at 30% 30%, #ffffff, rgba(255,255,255,0.55) 65%, rgba(255,255,255,0.2) 100%);
        box-shadow: 0 12px 24px rgba(0,0,0,0.25);
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: calc(var(--cloud-size, 132px) * 0.25);
        animation: float 5.5s ease-in-out infinite;
      }

      .cloud-meta {
        margin-top: 10px;
        background: rgba(7, 10, 18, 0.86);
        border-radius: 12px;
        padding: 9px 12px;
        text-align: center;
        color: #EAF2FF;
        font-family: 'Helvetica Neue', Arial, sans-serif;
        font-size: 12px;
        line-height: 1.45;
        min-width: 130px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.35);
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .cloud-meta .meta-headline {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        font-weight: 700;
        color: #ffffff;
      }

      .cloud-meta .meta-temp {
        color: #ffffff;
      }

      .cloud-meta .meta-wind {
        font-weight: 600;
        color: rgba(197, 215, 255, 0.92);
      }

      .cloud-meta .meta-sep {
        color: rgba(255, 255, 255, 0.4);
      }

      .cloud-meta .meta-condition {
        display: block;
        font-weight: 600;
        color: rgba(219, 229, 255, 0.95);
      }

      .cloud-meta .meta-coverage {
        font-size: 11px;
        color: rgba(173, 194, 255, 0.9);
        letter-spacing: 0.4px;
        text-transform: uppercase;
      }

      .cloud-pin.focused {
        transform: scale(1.08) translateY(-9px);
        filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.55));
      }

      .cloud-pin.focused .cloud-shell {
        border-color: rgba(255, 215, 0, 0.9);
        box-shadow: 0 20px 36px rgba(0, 0, 0, 0.36), 0 0 0 3px rgba(255, 215, 0, 0.22);
      }

      .cloud-pin.focused .cloud-glow {
        opacity: 0.8;
        animation: glow 3.5s ease-in-out infinite;
      }

      .cloud-pin.focused .cloud-ring {
        opacity: 1;
        transform: scale(1);
        border-color: rgba(255, 215, 0, 0.7);
        box-shadow: 0 0 22px rgba(255, 215, 0, 0.35);
      }

      .cloud-pin.focused .cloud-core {
        transform: translate(-50%, -50%) scale(1.08);
      }

      .cloud-pin.selected {
        transform: scale(1.15) translateY(-11px);
      }

      .cloud-pin.selected .cloud-shell {
        border-color: rgba(120, 255, 190, 0.95);
        box-shadow: 0 24px 40px rgba(0, 0, 0, 0.4), 0 0 0 4px rgba(120, 255, 190, 0.28);
      }

      .cloud-pin.selected .cloud-meta {
        border-color: rgba(120, 255, 190, 0.45);
        background: rgba(10, 16, 28, 0.94);
      }

      .cloud-pin.selected .cloud-glow {
        opacity: 1;
        animation: glow 2.4s ease-in-out infinite;
      }

      .cloud-pin.selected .cloud-ring {
        opacity: 1;
        transform: scale(1.05);
        border: 2px solid rgba(120, 255, 190, 0.55);
        box-shadow: 0 0 26px rgba(120, 255, 190, 0.35);
      }

      .cloud-tail {
        margin-top: -4px;
        width: 0;
        height: 0;
        border-left: 12px solid transparent;
        border-right: 12px solid transparent;
        border-top: 14px solid rgba(8, 10, 18, 0.85);
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.25));
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
        dragging: ${allowDrag},
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        keyboard: false,
      }).setView([${center.lat}, ${center.lon}], initialZoom);

      document.getElementById('map')._leaflet_map = map;
      map.on('moveend', () => {
        const c = map.getCenter();
        window.ReactNativeWebView?.postMessage?.(JSON.stringify({
          type: 'MAP_VIEW_CHANGED',
          lat: c.lat,
          lon: c.lng,
        }));
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 10,
        minZoom: 2,
      }).addTo(map);

      clusters.forEach((cluster, index) => {
        const isFocused = index === focusedIndex;
        const isSelected = selectedId && selectedId === cluster.id;
        const size = 92 + Math.round(cluster.coverage * 0.18);
        const hasMapLat = typeof cluster.mapLat === 'number';
        const hasMapLon = typeof cluster.mapLon === 'number';
        const lat = hasMapLat ? cluster.mapLat : cluster.lat;
        const lon = hasMapLon ? cluster.mapLon : cluster.lon;

        const classNames = ['cloud-pin'];
        if (isFocused) classNames.push('focused');
        if (isSelected) classNames.push('selected');

        const iconHtml =
          '<div class="' + classNames.join(' ') + '" style="--cloud-size:' + size + 'px;">' +
            '<div class="cloud-glow"></div>' +
            '<div class="cloud-shell" style="border-color:' + cluster.color + '; box-shadow:0 18px 34px rgba(0,0,0,0.32), 0 0 0 2px ' + cluster.color + '33;">' +
              '<div class="cloud-ring"></div>' +
              '<div class="cloud-puff puff-left"></div>' +
              '<div class="cloud-puff puff-mid"></div>' +
              '<div class="cloud-puff puff-right"></div>' +
              '<div class="cloud-core" style="color:' + cluster.color + '; text-shadow:0 2px 6px rgba(0,0,0,0.25);">' + cluster.icon + '</div>' +
            '</div>' +
            '<div class="cloud-meta" style="border-color:' + cluster.color + '33;">' +
              '<div class="meta-headline"><span>' + cluster.temperature + '</span><span class="meta-sep">•</span><span class="meta-wind">' + cluster.wind + '</span></div>' +
              '<span class="meta-condition">' + cluster.condition + '</span>' +
              '<span class="meta-coverage">Cloud coverage ' + cluster.coverage + '%</span>' +
            '</div>' +
            '<div class="cloud-tail" style="border-top-color:' + cluster.color + ';"></div>' +
          '</div>';

        const icon = L.divIcon({
          className: '',
          html: iconHtml,
          iconSize: [size, size],
          iconAnchor: [size / 2, size * 0.78],
        });

        L.marker([lat, lon], { icon }).addTo(map);

        if (isSelected) {
          L.circle([lat, lon], {
            radius: 140000,
            color: cluster.color,
            weight: 2,
            fillColor: cluster.color,
            fillOpacity: 0.18,
            dashArray: '6 8',
          }).addTo(map);
        }
      });

      if (selectedId) {
        const target = clusters.find(cluster => cluster.id === selectedId);
        if (target) {
          const targetLat = typeof target.mapLat === 'number' ? target.mapLat : target.lat;
          const targetLon = typeof target.mapLon === 'number' ? target.mapLon : target.lon;
          map.setView([targetLat, targetLon], Math.max(initialZoom, 6));
        }
      }
    </script>
  </body>
</html>`;
}
