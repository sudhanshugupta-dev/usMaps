import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  findNodeHandle,
} from 'react-native';
import { useScale } from '@/hooks/useScale';
import { PREDEFINED_ROUTES, Route } from '@/constants/directionsData';
import { useTVFocus } from '@/hooks/useTVFocus'; // assuming this works with onUp/onDown
import { MaterialIcons } from '@expo/vector-icons';

interface DirectionsPanelProps {
  isOpen: boolean;
  onClose?: () => void;
  onRouteSelect: (route: Route) => void;
  onFocusChange?: (hasFocus: boolean) => void;
  selectedRoute: Route | null;
  onClearRoute?: () => void;
}

export const DirectionsPanel: React.FC<DirectionsPanelProps> = ({
  isOpen,
  onClose,
  onRouteSelect,
  onFocusChange,
  selectedRoute,
  onClearRoute,
}) => {
  const scale = useScale();
  const [focusedIndex, setFocusedIndex] = useState(0); // 0 to routes.length (close button)
  const closeButtonRef = useRef<TouchableOpacity>(null);
  const itemRefs = useRef<Array<TouchableOpacity | null>>([]);
  const scrollRef = useRef<ScrollView>(null);
  const slideAnim = useRef(new Animated.Value(isOpen ? 0 : -350 * scale)).current;
  const scaleAnims = useRef<Record<string, Animated.Value>>({}).current;

  const routes = useMemo(() => PREDEFINED_ROUTES, []);
  const totalItems = routes.length + 1; // +1 for close button

  // === Initialize refs and animations ===
  useEffect(() => {
    itemRefs.current = Array(routes.length).fill(null);
    routes.forEach((r) => {
      if (!scaleAnims[r.id]) scaleAnims[r.id] = new Animated.Value(1);
    });
  }, [routes]);

  // === Panel open/close animation + focus init ===
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 0 : -350 * scale,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (isOpen) {
      setFocusedIndex(0);
      onFocusChange?.(true);
      // Defer focus to next frame
      requestAnimationFrame(() => {
        focusItemAtIndex(0);
      });
    } else {
      setFocusedIndex(0);
      onFocusChange?.(false);
    }
  }, [isOpen]);

  // === Focus item by index ===
  const focusItemAtIndex = useCallback((index: number) => {
    setFocusedIndex(index);

    const ref = index < routes.length 
      ? itemRefs.current[index] 
      : closeButtonRef.current;

    if (ref) {
      const node = findNodeHandle(ref);
      if (node) {
        // This is the KEY: use React Native's internal focus method
        const { UIManager } = require('react-native');
        UIManager.dispatchViewManagerCommand(
          node,
          // @ts-ignore - command exists on Android TV
          UIManager.getViewManagerConfig('RCTView').Commands.focus,
          []
        );
      }
    }
  }, [routes.length]);

  // === Scroll to focused item ===
  const scrollToFocusedItem = useCallback(() => {
    if (!scrollRef.current || focusedIndex >= routes.length) return;

    const ITEM_HEIGHT = 80 * scale;
    const VISIBLE_ITEMS = 5;
    const VISIBLE_AREA = VISIBLE_ITEMS * ITEM_HEIGHT;
    const totalHeight = routes.length * ITEM_HEIGHT;

    let targetOffset = focusedIndex * ITEM_HEIGHT - (VISIBLE_AREA / 2 - ITEM_HEIGHT / 2);
    targetOffset = Math.max(0, Math.min(targetOffset, totalHeight - VISIBLE_AREA));

    scrollRef.current.scrollTo({ y: targetOffset, animated: true });
  }, [focusedIndex, routes.length, scale]);

  useEffect(() => {
    scrollToFocusedItem();
  }, [focusedIndex, scrollToFocusedItem]);

  // === Scale animation on focus ===
  useEffect(() => {
    routes.forEach((r, i) => {
      const anim = scaleAnims[r.id];
      if (anim) {
        Animated.spring(anim, {
          toValue: i === focusedIndex ? 1.05 : 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [focusedIndex, routes, scaleAnims]);

  // === TV Navigation (Fully Manual) ===
  useTVFocus({
    enabled: isOpen,
    onUp: () => {
      setFocusedIndex(prev => {
        const next = prev <= 0 ? totalItems - 1 : prev - 1;
        requestAnimationFrame(() => focusItemAtIndex(next));
        return next;
      });
      return true;
    },
    onDown: () => {
      setFocusedIndex(prev => {
        const next = prev >= totalItems - 1 ? 0 : prev + 1;
        requestAnimationFrame(() => focusItemAtIndex(next));
        return next;
      });
      return true;
    },
    onSelect: () => {
      if (focusedIndex < routes.length) {
        onRouteSelect(routes[focusedIndex]);
      } else {
        onClose?.();
      }
      return true;
    },
    onBack: () => {
      onClose?.();
      onFocusChange?.(false);
      return true;
    },
  });

  const styles = useDirectionsPanelStyles(scale);

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: slideAnim }] }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Routes</Text>
        <TouchableOpacity
          ref={closeButtonRef}
          style={[
            styles.closeButton,
            focusedIndex === routes.length && styles.closeButtonFocused,
          ]}
          onPress={onClose}
          onFocus={() => setFocusedIndex(routes.length)}
          focusable={isOpen}
          accessible
          accessibilityLabel="Close panel"
          accessibilityRole="button"
        >
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      {/* Route List */}
      <ScrollView ref={scrollRef} style={styles.routesList} bounces={false}>
        {routes.map((route, idx) => {
          const isFocused = idx === focusedIndex;
          const isSelected = selectedRoute?.id === route.id;
          const anim = scaleAnims[route.id];

          return (
            <Animated.View
              key={route.id}
              style={[styles.routeItemWrapper, anim && { transform: [{ scale: anim }] }]}
            >
              <TouchableOpacity
                ref={el => (itemRefs.current[idx] = el)}
                style={[
                  styles.routeItem,
                  isFocused && styles.routeItemFocused,
                  isSelected && styles.routeItemSelected,
                ]}
                onPress={() => onRouteSelect(route)}
                onFocus={() => setFocusedIndex(idx)}
                focusable={isOpen}
                accessible
                accessibilityLabel={route.name}
                accessibilityRole="button"
              >
                <View style={styles.routeIcon}>
                  <Text style={styles.routeIconText}>Road</Text>
                </View>
                <View style={styles.routeInfo}>
                  <Text style={styles.routeName}>{route.name}</Text>
                  <Text style={styles.routeDetails}>{route.distance} mi • {route.duration}</Text>
                </View>
                {isSelected && (
                  <View style={styles.selectionIndicator}>
                      <MaterialIcons name="arrow-forward" size={20 * scale} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Selected Route Details */}
      {selectedRoute && (
        <View style={styles.detailsSection}>
          <Text style={styles.detailsTitle}>Route Details</Text>
          <View style={styles.detailsContent}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Distance:</Text>
              <Text style={styles.detailValue}>{selectedRoute.distance}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration:</Text>
              <Text style={styles.detailValue}>{selectedRoute.duration}</Text>
            </View>
          </View>
          {onClearRoute && (
            <TouchableOpacity
              style={styles.clearRouteButton}
              onPress={onClearRoute}
              focusable={isOpen}
              accessible
            >
              <Text style={styles.clearRouteButtonText}>Clear Route</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Animated.View>
  );
};
/* ================================================================== */
/* STYLES – TV-optimized */
/* ================================================================== */
const useDirectionsPanelStyles = (scale: number) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 350 * scale,
      backgroundColor: '#fff',
      borderRightWidth: 2,
      borderRightColor: '#e0e0e0',
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
      zIndex: 100,
      flexDirection: 'column',
    },
    header: {
      paddingHorizontal: 16 * scale,
      paddingVertical: 12 * scale,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f9f9f9',
    },
    headerTitle: {
      fontSize: 18 * scale,
      fontWeight: '700',
      color: '#1a1a1a',
    },
    closeButton: {
      width: 40 * scale,
      height: 40 * scale,
      borderRadius: 20 * scale,
      backgroundColor: '#000',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    closeButtonFocused: {
      borderColor: '#FFD700',
      shadowColor: '#FFD700',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 6,
      elevation: 5,
    },
    closeButtonText: {
      fontSize: 20 * scale,
      color: '#fff',
      fontWeight: 'bold',
    },
    routesList: {
      flex: 1,
      paddingVertical: 8 * scale,
    },
    routeItemWrapper: {
      paddingHorizontal: 8 * scale,
      paddingVertical: 4 * scale,
    },
    routeItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12 * scale,
      paddingVertical: 14 * scale,
      marginHorizontal: 8 * scale,
      borderRadius: 10 * scale,
      backgroundColor: '#f9f9f9',
      marginBottom: 8 * scale,
      borderWidth: 3,
      borderColor: 'transparent',
    },
    routeItemFocused: {
      borderColor: '#FFD700',
      backgroundColor: '#fffbe6',
      shadowColor: '#FFD700',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 6,
      elevation: 6,
    },
    routeItemSelected: {
      backgroundColor: '#e3f2fd',
      borderColor: '#007bff',
    },
    routeIcon: {
      width: 40 * scale,
      height: 40 * scale,
      borderRadius: 8 * scale,
      backgroundColor: '#bbdefb',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12 * scale,
    },
    routeIconText: { fontSize: 15 * scale },
    routeInfo: { flex: 1 },
    routeName: {
      fontSize: 15 * scale,
      fontWeight: '600',
      color: '#1a1a1a',
      marginBottom: 2 * scale,
    },
    routeDetails: { fontSize: 13 * scale, color: '#555' },
    selectionIndicator: {
      width: 28 * scale,
      height: 28 * scale,
      borderRadius: 14 * scale,
      backgroundColor: '#007bff',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8 * scale,
    },
    selectionIndicatorText: {
      fontSize: 16 * scale,
      color: '#fff',
      fontWeight: 'bold',
    },
    detailsSection: {
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0',
      paddingHorizontal: 16 * scale,
      paddingVertical: 12 * scale,
      backgroundColor: '#f9f9f9',
    },
    detailsTitle: {
      fontSize: 14 * scale,
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: 8 * scale,
    },
    detailsContent: { gap: 6 * scale },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
    detailLabel: { fontSize: 12 * scale, color: '#666', fontWeight: '500' },
    detailValue: { fontSize: 12 * scale, color: '#1a1a1a', fontWeight: '600' },
    clearRouteButton: {
      marginTop: 12 * scale,
      paddingVertical: 10 * scale,
      paddingHorizontal: 20 * scale,
      backgroundColor: '#ff4d4f',
      borderRadius: 8 * scale,
      alignSelf: 'center',
    },
    clearRouteButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 14 * scale,
    },
  });
