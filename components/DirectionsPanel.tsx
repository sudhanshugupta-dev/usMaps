import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  AccessibilityInfo,
} from 'react-native';
import { useScale } from '@/hooks/useScale';
import { PREDEFINED_ROUTES, Route } from '@/constants/directionsData';
import { useTVFocus } from '@/hooks/useTVFocus';

interface DirectionsPanelProps {
  isOpen: boolean;
  onClose?: () => void;
  onRouteSelect: (route: Route) => void;
  onFocusChange?: (hasFocus: boolean) => void;
  selectedRoute: Route | null;
}

export const DirectionsPanel: React.FC<DirectionsPanelProps> = ({
  isOpen,
  onClose,
  onRouteSelect,
  onFocusChange,
  selectedRoute,
}) => {
  const scale = useScale();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(isOpen ? 0 : -350 * scale)).current;
  const scaleAnims = useRef<{ [key: string]: Animated.Value }>({}).current;

  const routes = useMemo(() => PREDEFINED_ROUTES, []);

  // Initialize scale animations for each route
  useEffect(() => {
    routes.forEach((route) => {
      if (!scaleAnims[route.id]) {
        scaleAnims[route.id] = new Animated.Value(1);
      }
    });
  }, [routes, scaleAnims]);

  // Animate panel slide in/out
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 0 : -350 * scale,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (isOpen) {
      setFocusedIndex(0);
      onFocusChange?.(true);
    } else {
      onFocusChange?.(false);
    }
  }, [isOpen, scale, slideAnim, onFocusChange]);

  // Handle route selection
  const handleSelectRoute = useCallback(
    (route: Route) => {
      onRouteSelect(route);
    },
    [onRouteSelect]
  );

  // TV Remote control
  useTVFocus({
    enabled: isOpen,
    onUp: () => {
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : routes.length - 1));
    },
    onDown: () => {
      setFocusedIndex((prev) => (prev < routes.length - 1 ? prev + 1 : 0));
    },
    onSelect: () => {
      const route = routes[focusedIndex];
      if (route) {
        handleSelectRoute(route);
      }
    },
    onBack: () => {
      onClose?.();
      return true;
    },
  });

  // Animate focused item
  useEffect(() => {
    routes.forEach((route, index) => {
      const anim = scaleAnims[route.id];
      if (anim) {
        Animated.spring(anim, {
          toValue: index === focusedIndex ? 1.05 : 1,
          friction: 5,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [focusedIndex, routes, scaleAnims]);

  const styles = useDirectionsPanelStyles(scale);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Routes</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          accessible
          accessibilityLabel="Close directions panel"
          accessibilityRole="button"
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Routes List */}
      <ScrollView
        style={styles.routesList}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      >
        {routes.map((route, index) => {
          const anim = scaleAnims[route.id];
          const isSelected = selectedRoute?.id === route.id;
          const isFocused = index === focusedIndex;

          return (
            <Animated.View
              key={route.id}
              style={[
                styles.routeItemWrapper,
                anim && {
                  transform: [{ scale: anim }],
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.routeItem,
                  isFocused && styles.routeItemFocused,
                  isSelected && styles.routeItemSelected,
                ]}
                onPress={() => handleSelectRoute(route)}
                accessible
                accessibilityLabel={`Route: ${route.name}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                {/* Route Icon */}
                <View style={styles.routeIcon}>
                  <Text style={styles.routeIconText}>🛣️</Text>
                </View>

                {/* Route Info */}
                <View style={styles.routeInfo}>
                  <Text style={styles.routeName} numberOfLines={1}>
                    {route.name}
                  </Text>
                  <Text style={styles.routeDetails}>
                    {route.distance} mi • {route.duration}
                  </Text>
                </View>

                {/* Selection Indicator */}
                {isSelected && (
                  <View style={styles.selectionIndicator}>
                    <Text style={styles.selectionIndicatorText}>✓</Text>
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
              <Text style={styles.detailLabel}>From:</Text>
              <Text style={styles.detailValue}>{selectedRoute.from}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>To:</Text>
              <Text style={styles.detailValue}>{selectedRoute.to}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Distance:</Text>
              <Text style={styles.detailValue}>{selectedRoute.distance} miles</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Est. Time:</Text>
              <Text style={styles.detailValue}>{selectedRoute.duration}</Text>
            </View>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const useDirectionsPanelStyles = (scale: number) => {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 350 * scale,
      backgroundColor: '#ffffff',
      borderRightWidth: 2,
      borderRightColor: '#e0e0e0',
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
      zIndex: 100,
      display: 'flex',
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
      width: 36 * scale,
      height: 36 * scale,
      borderRadius: 18 * scale,
      backgroundColor: '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: 20 * scale,
      color: '#666',
      fontWeight: '600',
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
      paddingVertical: 12 * scale,
      marginHorizontal: 8 * scale,
      borderRadius: 8 * scale,
      backgroundColor: '#f9f9f9',
      marginBottom: 8 * scale,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    routeItemFocused: {
      borderColor: '#FFD700',
      backgroundColor: '#fffef0',
      shadowColor: '#FFD700',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    routeItemSelected: {
      borderColor: '#007bff',
      backgroundColor: '#e7f3ff',
    },
    routeIcon: {
      width: 40 * scale,
      height: 40 * scale,
      borderRadius: 8 * scale,
      backgroundColor: '#e3f2fd',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12 * scale,
    },
    routeIconText: {
      fontSize: 20 * scale,
    },
    routeInfo: {
      flex: 1,
    },
    routeName: {
      fontSize: 14 * scale,
      fontWeight: '600',
      color: '#1a1a1a',
      marginBottom: 4 * scale,
    },
    routeDetails: {
      fontSize: 12 * scale,
      color: '#666',
    },
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
    detailsContent: {
      gap: 6 * scale,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    detailLabel: {
      fontSize: 12 * scale,
      color: '#666',
      fontWeight: '500',
    },
    detailValue: {
      fontSize: 12 * scale,
      color: '#1a1a1a',
      fontWeight: '600',
    },
  });
};
