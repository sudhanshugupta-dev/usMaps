import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useScale } from '@/hooks/useScale';
import { LAYER_GROUPS } from '@/app/maps/layersConfig';
import { EsriLayer } from '@/types/map';
import { useTVFocus } from '@/hooks/useTVFocus';

interface MapMenuProps {
  isOpen: boolean;
  onToggleLayer: (layer: EsriLayer) => void;
  onClearLayers: () => void;
  activeLayers: Set<string>;
  onClose?: () => void;
  onFocusChange?: (hasFocus: boolean) => void;
}

export const MapMenu: React.FC<MapMenuProps> = ({
  isOpen,
  onToggleLayer,
  onClearLayers,
  activeLayers,
  onClose,
  onFocusChange,
}) => {
  const scale = useScale();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set([LAYER_GROUPS[0]?.category])
  );
  const [focusedIndex, setFocusedIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(isOpen ? 0 : -350 * scale)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Get all focusable items in correct order
  const { focusableItems, itemPositions } = useMemo(() => {
    const items: Array<{ 
      type: 'close' | 'clear' | 'group' | 'layer'; 
      data: any;
      key: string;
    }> = [];
    const positions: { [key: string]: number } = {};

    // Close button is first
    items.push({ type: 'close', data: null, key: 'close' });
    
    // Clear button second
    items.push({ type: 'clear', data: null, key: 'clear-all' });
    
    // Add all groups and their layers
    LAYER_GROUPS.forEach((group) => {
      const groupKey = `group-${group.category}`;
      items.push({ type: 'group', data: group, key: groupKey });
      
      // Only include layers if the group is expanded
      if (expandedGroups.has(group.category)) {
        group.layers.forEach((layer) => {
          const layerKey = `layer-${layer.id}`;
          items.push({ type: 'layer', data: layer, key: layerKey });
        });
      }
    });

    // Create position mapping
    items.forEach((item, index) => {
      positions[item.key] = index;
    });

    return { focusableItems: items, itemPositions: positions };
  }, [expandedGroups]);

  // Reset focus when menu opens/closes
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(0); // Start with close button
      onFocusChange?.(true);
    } else {
      setFocusedIndex(0);
      onFocusChange?.(false);
    }
  }, [isOpen, onFocusChange]);

  // Animate menu slide
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 0 : -350 * scale,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen, scale, slideAnim]);

  // Scroll to focused item
  useEffect(() => {
    if (!isOpen || !scrollViewRef.current || focusedIndex < 2) return;

    // Calculate scroll position (skip close and clear buttons)
    const itemHeight = 50 * scale;
    const scrollPosition = Math.max(0, (focusedIndex - 2) * itemHeight);
    
    scrollViewRef.current.scrollTo({
      y: scrollPosition,
      animated: true,
    });
  }, [focusedIndex, isOpen, scale]);

  // Handle item actions
  const handleItemAction = useCallback((item: typeof focusableItems[0]) => {
    switch (item.type) {
      case 'close':
        onClose?.();
        break;
      case 'clear':
        onClearLayers();
        break;
      case 'group':
        setExpandedGroups(prev => {
          const newSet = new Set(prev);
          if (newSet.has(item.data.category)) {
            newSet.delete(item.data.category);
          } else {
            newSet.add(item.data.category);
          }
          return newSet;
        });
        break;
      case 'layer':
        onToggleLayer(item.data);
        break;
    }
  }, [onClose, onClearLayers, onToggleLayer]);

  // TV Remote navigation - fixed and reliable
  useTVFocus({
    enabled: isOpen,
    onUp: () => {
      setFocusedIndex(prev => {
        const newIndex = Math.max(0, prev - 1);
        console.log('[MapMenu] UP:', { from: prev, to: newIndex, item: focusableItems[newIndex]?.key });
        return newIndex;
      });
    },
    onDown: () => {
      setFocusedIndex(prev => {
        const newIndex = Math.min(focusableItems.length - 1, prev + 1);
        console.log('[MapMenu] DOWN:', { from: prev, to: newIndex, item: focusableItems[newIndex]?.key });
        return newIndex;
      });
    },
    onSelect: () => {
      const item = focusableItems[focusedIndex];
      if (!item) return;
      
      console.log('[MapMenu] ENTER:', { index: focusedIndex, item: item.key });
      handleItemAction(item);
    },
    onBack: () => {
      console.log('[MapMenu] BACK pressed');
      if (onClose) {
        onClose();
        return true;
      }
      return false;
    },
  });

  const styles = useMapMenuStyles(scale);
  const focusedItem = focusableItems[focusedIndex];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      {/* Header with Close Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗺️ Map Layers</Text>
        <TouchableOpacity
          style={[
            styles.closeButton,
            focusedItem?.key === 'close' && styles.focusedItem,
          ]}
          onPress={onClose}
          accessibilityLabel="Close menu"
          accessibilityRole="button"
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Clear All Button */}
      <TouchableOpacity
        style={[
          styles.clearButton,
          focusedItem?.key === 'clear-all' && styles.focusedItem,
        ]}
        onPress={onClearLayers}
        accessibilityLabel="Clear all layers"
        accessibilityRole="button"
      >
        <Text style={styles.clearButtonText}>🗑️ Clear All Layers</Text>
      </TouchableOpacity>

      {/* Layer Groups */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        {LAYER_GROUPS.map((group) => {
          const groupKey = `group-${group.category}`;
          const isGroupFocused = focusedItem?.key === groupKey;
          const isGroupExpanded = expandedGroups.has(group.category);

          return (
            <View key={group.category} style={styles.groupContainer}>
              {/* Group Header */}
              <TouchableOpacity
                style={[
                  styles.groupHeader,
                  isGroupExpanded && styles.groupHeaderExpanded,
                  isGroupFocused && styles.focusedItem,
                ]}
                onPress={() => handleItemAction({ type: 'group', data: group, key: groupKey })}
                accessibilityLabel={`${group.name} layer group`}
                accessibilityRole="button"
                accessibilityState={{ expanded: isGroupExpanded }}
              >
                <Text style={styles.groupTitle}>{group.name}</Text>
                <Text style={styles.groupToggle}>
                  {isGroupExpanded ? '▼' : '▶'}
                </Text>
              </TouchableOpacity>

              {/* Layer Items */}
              {isGroupExpanded && (
                <View style={styles.layersList}>
                  {group.layers.map((layer) => {
                    const layerKey = `layer-${layer.id}`;
                    const isLayerFocused = focusedItem?.key === layerKey;
                    const isLayerActive = activeLayers.has(layer.id);

                    return (
                      <TouchableOpacity
                        key={layer.id}
                        style={[
                          styles.layerItem,
                          isLayerActive && styles.layerItemActive,
                          isLayerFocused && styles.focusedItem,
                        ]}
                        onPress={() => handleItemAction({ type: 'layer', data: layer, key: layerKey })}
                        accessibilityLabel={layer.name}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: isLayerActive }}
                      >
                        <View style={styles.layerItemContent}>
                          <View
                            style={[
                              styles.layerIndicator,
                              isLayerActive && styles.layerIndicatorActive,
                              { backgroundColor: layer.color || '#1f77b4' },
                            ]}
                          >
                            {isLayerActive && (
                              <Text style={styles.checkmark}>✓</Text>
                            )}
                          </View>
                          <View style={styles.layerInfo}>
                            <Text
                              style={[
                                styles.layerName,
                                isLayerActive && styles.layerNameActive,
                              ]}
                            >
                              {layer.name}
                            </Text>
                            {layer.description && (
                              <Text style={styles.layerDescription}>
                                {layer.description}
                              </Text>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
        
        {/* Empty state if no groups */}
        {LAYER_GROUPS.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No layers available</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          📍 Active: {activeLayers.size} layer{activeLayers.size !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.footerHint}>
          🎮 Navigate with arrows, select with Enter
        </Text>
      </View>
    </Animated.View>
  );
};

const useMapMenuStyles = (scale: number) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 350 * scale,
      backgroundColor: '#1a1a1a',
      zIndex: 1000,
      borderRightWidth: 1,
      borderRightColor: '#333333',
      elevation: 8,
    },

    header: {
      paddingHorizontal: 16 * scale,
      paddingVertical: 16 * scale,
      borderBottomWidth: 1,
      borderBottomColor: '#333333',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#2a2a2a',
    },

    headerTitle: {
      fontSize: 18 * scale,
      fontWeight: '700',
      color: '#ffffff',
    },

    closeButton: {
      width: 40 * scale,
      height: 40 * scale,
      borderRadius: 20 * scale,
      backgroundColor: '#444444',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },

    closeButtonText: {
      fontSize: 18 * scale,
      color: '#ffffff',
      fontWeight: 'bold',
    },

    clearButton: {
      margin: 12 * scale,
      paddingVertical: 12 * scale,
      paddingHorizontal: 16 * scale,
      backgroundColor: '#dc3545',
      borderRadius: 8 * scale,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44 * scale,
      borderWidth: 2,
      borderColor: 'transparent',
    },

    clearButtonText: {
      color: '#ffffff',
      fontWeight: '600',
      fontSize: 14 * scale,
    },

    // Single consistent focus effect
    focusedItem: {
      borderWidth: 3 * scale,
      borderColor: '#FFD700',
      backgroundColor: '#333333',
      shadowColor: '#FFD700',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 6,
      elevation: 4,
    },

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      paddingBottom: 20 * scale,
    },

    groupContainer: {
      marginBottom: 4 * scale,
    },

    groupHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16 * scale,
      paddingVertical: 14 * scale,
      backgroundColor: '#2a2a2a',
      marginHorizontal: 12 * scale,
      marginVertical: 4 * scale,
      borderRadius: 8 * scale,
      borderWidth: 2,
      borderColor: 'transparent',
      minHeight: 50 * scale,
    },

    groupHeaderExpanded: {
      backgroundColor: '#333333',
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },

    groupTitle: {
      fontSize: 16 * scale,
      fontWeight: '600',
      color: '#ffffff',
      flex: 1,
    },

    groupToggle: {
      fontSize: 14 * scale,
      color: '#cccccc',
      marginLeft: 8 * scale,
      fontWeight: 'bold',
    },

    layersList: {
      backgroundColor: '#222222',
      marginHorizontal: 12 * scale,
      marginBottom: 8 * scale,
      borderBottomLeftRadius: 8 * scale,
      borderBottomRightRadius: 8 * scale,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#333333',
      borderTopWidth: 0,
    },

    layerItem: {
      paddingHorizontal: 16 * scale,
      paddingVertical: 12 * scale,
      backgroundColor: '#222222',
      borderBottomWidth: 1,
      borderBottomColor: '#333333',
      borderWidth: 2,
      borderColor: 'transparent',
      minHeight: 50 * scale,
    },

    layerItemActive: {
      backgroundColor: '#1a331a',
    },

    layerItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12 * scale,
    },

    layerIndicator: {
      width: 24 * scale,
      height: 24 * scale,
      borderRadius: 6 * scale,
      borderWidth: 2 * scale,
      borderColor: '#666666',
      justifyContent: 'center',
      alignItems: 'center',
      opacity: 0.7,
    },

    layerIndicatorActive: {
      borderColor: '#4caf50',
      opacity: 1,
    },

    checkmark: {
      color: '#ffffff',
      fontSize: 14 * scale,
      fontWeight: 'bold',
    },

    layerInfo: {
      flex: 1,
    },

    layerName: {
      fontSize: 14 * scale,
      fontWeight: '500',
      color: '#ffffff',
      marginBottom: 2 * scale,
    },

    layerNameActive: {
      color: '#66bb6a',
      fontWeight: '600',
    },

    layerDescription: {
      fontSize: 12 * scale,
      color: '#999999',
      lineHeight: 14 * scale,
    },

    emptyState: {
      padding: 20 * scale,
      alignItems: 'center',
    },

    emptyStateText: {
      color: '#888888',
      fontSize: 14 * scale,
    },

    footer: {
      paddingHorizontal: 16 * scale,
      paddingVertical: 12 * scale,
      borderTopWidth: 1,
      borderTopColor: '#333333',
      backgroundColor: '#2a2a2a',
    },

    footerText: {
      fontSize: 12 * scale,
      color: '#cccccc',
      fontWeight: '500',
      marginBottom: 4 * scale,
    },

    footerHint: {
      fontSize: 10 * scale,
      color: '#888888',
      fontStyle: 'italic',
    },
  });