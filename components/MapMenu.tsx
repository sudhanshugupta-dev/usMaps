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
  const [expandedGroup, setExpandedGroup] = useState<string | null>(
    LAYER_GROUPS[0]?.category || null
  );
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(isOpen ? 0 : -350 * scale)).current;
  const scaleAnims = useRef<{ [key: string]: Animated.Value }>({}).current;

  // Get all focusable items
  const focusableItems = useMemo(() => {
    const items: Array<{ type: 'clear' | 'group' | 'layer'; data: any }> = [];
    items.push({ type: 'clear', data: null });
    
    LAYER_GROUPS.forEach((group) => {
      items.push({ type: 'group', data: group });
      if (expandedGroup === group.category) {
        group.layers.forEach((layer) => {
          items.push({ type: 'layer', data: layer });
        });
      }
    });
    
    return items;
  }, [expandedGroup]);

  // Animate menu slide in/out
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

  // Handle item selection
  const handleSelectItem = useCallback(() => {
    const item = focusableItems[focusedIndex];
    if (!item) return;

    switch (item.type) {
      case 'clear':
        onClearLayers();
        break;
      case 'group':
        handleGroupToggle(item.data.category);
        break;
      case 'layer':
        handleLayerPress(item.data);
        break;
    }
  }, [focusedIndex, focusableItems, onClearLayers]);

  // TV Remote navigation
  useTVFocus({
    enabled: isOpen,
    onUp: () => {
      console.log('[MapMenu] UP - Current index:', focusedIndex);
      setFocusedIndex((prev) => {
        const newIndex = Math.max(0, prev - 1);
        console.log('[MapMenu] New index:', newIndex);
        return newIndex;
      });
    },
    onDown: () => {
      console.log('[MapMenu] DOWN - Current index:', focusedIndex);
      setFocusedIndex((prev) => {
        const newIndex = Math.min(focusableItems.length - 1, prev + 1);
        console.log('[MapMenu] New index:', newIndex);
        return newIndex;
      });
    },
    onSelect: () => {
      console.log('[MapMenu] SELECT - Focused index:', focusedIndex);
      handleSelectItem();
    },
    onBack: () => {
      console.log('[MapMenu] BACK - Closing drawer');
      if (onClose) {
        onClose();
        return true;
      }
      return false;
    },
  });

  // Animate focused item
  useEffect(() => {
    const item = focusableItems[focusedIndex];
    if (!item) return;

    const key = item.type === 'clear' ? 'clear' : 
                item.type === 'group' ? `group-${item.data.category}` : 
                `layer-${item.data.id}`;

    if (!scaleAnims[key]) {
      scaleAnims[key] = new Animated.Value(1);
    }

    // Reset all animations
    Object.keys(scaleAnims).forEach((k) => {
      Animated.spring(scaleAnims[k], {
        toValue: k === key ? 1.05 : 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    });
  }, [focusedIndex, focusableItems, scaleAnims]);

  const handleLayerPress = (layer: EsriLayer) => {
    setSelectedLayerId(layer.id);
    onToggleLayer(layer);
  };

  const handleGroupToggle = (category: string) => {
    setExpandedGroup(expandedGroup === category ? null : category);
  };

  const styles = useMapMenuStyles(scale);

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
        <Text style={styles.headerTitle}>🗺️ Map Layers</Text>
        {onClose && (
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="Close menu"
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Clear All Button */}
      <Animated.View
        style={{
          transform: [{ scale: scaleAnims['clear'] || 1 }],
        }}
      >
        <TouchableOpacity
          style={[
            styles.clearButton,
            focusedIndex === 0 && styles.focusedItem,
          ]}
          onPress={onClearLayers}
          accessibilityLabel="Clear all layers"
          accessibilityRole="button"
        >
          <Text style={styles.clearButtonText}>Clear All Layers</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Layer Groups */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        scrollEventThrottle={16}
      >
        {LAYER_GROUPS.map((group, groupIdx) => {
          const groupItemIndex = focusableItems.findIndex(
            (item) => item.type === 'group' && item.data?.category === group.category
          );
          const isFocused = focusedIndex === groupItemIndex;
          const groupKey = `group-${group.category}`;

          return (
            <View key={group.category} style={styles.groupContainer}>
              {/* Group Header */}
              <Animated.View
                style={{
                  transform: [{ scale: scaleAnims[groupKey] || 1 }],
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.groupHeader,
                    expandedGroup === group.category && styles.groupHeaderActive,
                    isFocused && styles.focusedItem,
                  ]}
                  onPress={() => handleGroupToggle(group.category)}
                  accessibilityLabel={`${group.name} layer group`}
                  accessibilityRole="button"
                  accessibilityState={{
                    expanded: expandedGroup === group.category,
                  }}
                >
                  <Text style={styles.groupTitle}>{group.name}</Text>
                  <Text style={styles.groupToggle}>
                    {expandedGroup === group.category ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Layer Items */}
              {expandedGroup === group.category && (
                <View style={styles.layersList}>
                  {group.layers.map((layer) => {
                    const layerItemIndex = focusableItems.findIndex(
                      (item) => item.type === 'layer' && item.data?.id === layer.id
                    );
                    const isLayerFocused = focusedIndex === layerItemIndex;
                    const isActive = activeLayers.has(layer.id);
                    const isSelected = selectedLayerId === layer.id;
                    const layerKey = `layer-${layer.id}`;

                    return (
                      <Animated.View
                        key={layer.id}
                        style={{
                          transform: [{ scale: scaleAnims[layerKey] || 1 }],
                        }}
                      >
                        <TouchableOpacity
                          style={[
                            styles.layerItem,
                            isActive && styles.layerItemActive,
                            isSelected && styles.layerItemSelected,
                            isLayerFocused && styles.focusedItem,
                          ]}
                          onPress={() => handleLayerPress(layer)}
                          accessibilityLabel={layer.name}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: isActive }}
                        >
                          <View style={styles.layerItemContent}>
                            <View
                              style={[
                                styles.layerCheckbox,
                                isActive && styles.layerCheckboxActive,
                                { backgroundColor: layer.color || '#1f77b4' },
                              ]}
                            >
                              {isActive && (
                                <Text style={styles.checkmark}>✓</Text>
                              )}
                            </View>
                            <View style={styles.layerInfo}>
                              <Text
                                style={[
                                  styles.layerName,
                                  isActive && styles.layerNameActive,
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
                      </Animated.View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Footer Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Active: {activeLayers.size} layer{activeLayers.size !== 1 ? 's' : ''}
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
      backgroundColor: '#000000',
      zIndex: 1000,
      shadowColor: '#FFD700',
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      display: 'flex',
      flexDirection: 'column',
    },

    header: {
      paddingHorizontal: 16 * scale,
      paddingVertical: 12 * scale,
      borderBottomWidth: 1,
      borderBottomColor: '#333333',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    headerTitle: {
      fontSize: 18 * scale,
      fontWeight: '700',
      color: '#ffffff',
    },

    closeButton: {
      padding: 8 * scale,
      borderRadius: 4 * scale,
      backgroundColor: '#333333',
    },

    closeButtonText: {
      fontSize: 18 * scale,
      color: '#ffffff',
    },

    clearButton: {
      marginHorizontal: 12 * scale,
      marginVertical: 8 * scale,
      paddingVertical: 10 * scale,
      paddingHorizontal: 12 * scale,
      backgroundColor: '#dc3545',
      borderRadius: 6 * scale,
      alignItems: 'center',
    },

    clearButtonText: {
      color: '#ffffff',
      fontWeight: '600',
      fontSize: 14 * scale,
    },

    focusedItem: {
      shadowColor: '#FFD700',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 10,
      elevation: 10,
      borderWidth: 2,
      borderColor: '#FFD700',
    },

    scrollView: {
      flex: 1,
      paddingHorizontal: 8 * scale,
    },

    groupContainer: {
      marginVertical: 4 * scale,
    },

    groupHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 12 * scale,
      paddingVertical: 10 * scale,
      backgroundColor: '#1a1a1a',
      borderRadius: 6 * scale,
      marginVertical: 4 * scale,
    },

    groupHeaderActive: {
      backgroundColor: '#2a2a2a',
    },

    groupTitle: {
      fontSize: 15 * scale,
      fontWeight: '600',
      color: '#ffffff',
      flex: 1,
    },

    groupToggle: {
      fontSize: 12 * scale,
      color: '#999999',
      marginLeft: 8 * scale,
    },

    layersList: {
      paddingHorizontal: 8 * scale,
      marginBottom: 8 * scale,
    },

    layerItem: {
      paddingHorizontal: 12 * scale,
      paddingVertical: 10 * scale,
      marginVertical: 4 * scale,
      backgroundColor: '#1a1a1a',
      borderRadius: 6 * scale,
      borderLeftWidth: 3 * scale,
      borderLeftColor: 'transparent',
    },

    layerItemActive: {
      backgroundColor: '#1a3a1a',
      borderLeftColor: '#4caf50',
    },

    layerItemSelected: {
      backgroundColor: '#3a2a1a',
      borderLeftColor: '#ff9800',
    },

    layerItemContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10 * scale,
    },

    layerCheckbox: {
      width: 20 * scale,
      height: 20 * scale,
      borderRadius: 4 * scale,
      borderWidth: 2 * scale,
      borderColor: '#666666',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2 * scale,
      opacity: 0.7,
    },

    layerCheckboxActive: {
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
      fontSize: 13 * scale,
      fontWeight: '500',
      color: '#ffffff',
    },

    layerNameActive: {
      color: '#66bb6a',
      fontWeight: '600',
    },

    layerDescription: {
      fontSize: 11 * scale,
      color: '#999999',
      marginTop: 2 * scale,
    },

    footer: {
      paddingHorizontal: 16 * scale,
      paddingVertical: 10 * scale,
      borderTopWidth: 1,
      borderTopColor: '#333333',
      backgroundColor: '#0a0a0a',
    },

    footerText: {
      fontSize: 12 * scale,
      color: '#999999',
      fontWeight: '500',
    },
  });
