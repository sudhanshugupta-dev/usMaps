import React, { useState, useRef, useEffect } from 'react';
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

interface MapMenuProps {
  isOpen: boolean;
  onToggleLayer: (layer: EsriLayer) => void;
  onClearLayers: () => void;
  activeLayers: Set<string>;
  onClose?: () => void;
}

export const MapMenu: React.FC<MapMenuProps> = ({
  isOpen,
  onToggleLayer,
  onClearLayers,
  activeLayers,
  onClose,
}) => {
  const scale = useScale();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(
    LAYER_GROUPS[0]?.category || null
  );
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(isOpen ? 0 : -350 * scale)).current;

  // Animate menu slide in/out
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 0 : -350 * scale,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen, scale, slideAnim]);

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
      <TouchableOpacity
        style={styles.clearButton}
        onPress={onClearLayers}
        accessibilityLabel="Clear all layers"
        accessibilityRole="button"
      >
        <Text style={styles.clearButtonText}>Clear All Layers</Text>
      </TouchableOpacity>

      {/* Layer Groups */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        scrollEventThrottle={16}
      >
        {LAYER_GROUPS.map((group) => (
          <View key={group.category} style={styles.groupContainer}>
            {/* Group Header */}
            <TouchableOpacity
              style={[
                styles.groupHeader,
                expandedGroup === group.category && styles.groupHeaderActive,
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

            {/* Layer Items */}
            {expandedGroup === group.category && (
              <View style={styles.layersList}>
                {group.layers.map((layer) => {
                  const isActive = activeLayers.has(layer.id);
                  const isSelected = selectedLayerId === layer.id;

                  return (
                    <TouchableOpacity
                      key={layer.id}
                      style={[
                        styles.layerItem,
                        isActive && styles.layerItemActive,
                        isSelected && styles.layerItemSelected,
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
                  );
                })}
              </View>
            )}
          </View>
        ))}
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
      backgroundColor: '#ffffff',
      zIndex: 1000,
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
      display: 'flex',
      flexDirection: 'column',
    },

    header: {
      paddingHorizontal: 16 * scale,
      paddingVertical: 12 * scale,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    headerTitle: {
      fontSize: 18 * scale,
      fontWeight: '700',
      color: '#1a1a1a',
    },

    closeButton: {
      padding: 8 * scale,
      borderRadius: 4 * scale,
      backgroundColor: '#f0f0f0',
    },

    closeButtonText: {
      fontSize: 18 * scale,
      color: '#666',
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
      backgroundColor: '#f8f9fa',
      borderRadius: 6 * scale,
      marginVertical: 4 * scale,
    },

    groupHeaderActive: {
      backgroundColor: '#e9ecef',
    },

    groupTitle: {
      fontSize: 15 * scale,
      fontWeight: '600',
      color: '#1a1a1a',
      flex: 1,
    },

    groupToggle: {
      fontSize: 12 * scale,
      color: '#666',
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
      backgroundColor: '#f5f5f5',
      borderRadius: 6 * scale,
      borderLeftWidth: 3 * scale,
      borderLeftColor: 'transparent',
    },

    layerItemActive: {
      backgroundColor: '#e8f5e9',
      borderLeftColor: '#4caf50',
    },

    layerItemSelected: {
      backgroundColor: '#fff3e0',
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
      borderColor: '#ccc',
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
      color: '#333',
    },

    layerNameActive: {
      color: '#2e7d32',
      fontWeight: '600',
    },

    layerDescription: {
      fontSize: 11 * scale,
      color: '#999',
      marginTop: 2 * scale,
    },

    footer: {
      paddingHorizontal: 16 * scale,
      paddingVertical: 10 * scale,
      borderTopWidth: 1,
      borderTopColor: '#e0e0e0',
      backgroundColor: '#fafafa',
    },

    footerText: {
      fontSize: 12 * scale,
      color: '#666',
      fontWeight: '500',
    },
  });
