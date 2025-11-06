import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View, ViewStyle, AccessibilityState } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFullscreen } from '@/app/rnmaps/context/FullscreenContext';
import { TouchableOpacity } from 'react-native';
import { BottomTabNavigationOptions, BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { useState, ReactNode, useRef } from 'react';
import { useColorScheme } from 'react-native';

const isTV = Platform.OS === 'android' && Platform.isTV;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1a1a2e',
    borderTopColor: '#2a2a4a',
    borderTopWidth: 2,
    paddingHorizontal: 8,
    height: 80,
  },
  tvTabBar: {
    backgroundColor: '#121212',
    borderTopWidth: 1,
    borderTopColor: '#333',
    height: 100,
    paddingBottom: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  tabBarLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 6,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 4,
  },
  tabButtonInner: {
    padding: 12,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonFocused: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  tabBarButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    margin: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 70,
    backgroundColor: 'rgba(30, 30, 40, 0.95)',
    transitionProperty: 'all',
    transitionDuration: '150ms',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    outlineWidth: 0,
  },
  tabBarButtonFocused: {
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
  tabBarItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function TabLayout() {
  const { isFullscreen } = useFullscreen();
  const colorScheme = useColorScheme();
  const [focusedTab, setFocusedTab] = useState('index');

  // Handle tab focus for TV
  const handleTabFocus = (tabName: string) => {
    setFocusedTab(tabName);
    // Focus the tab content when tab is focused
    if (tabName === 'index') {
      // Focus the map or first focusable element in the tab
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          isTV && styles.tvTabBar,
          {
            height: isTV ? 100 : 80,
            display: isFullscreen ? 'none' : 'flex',
            paddingBottom: 8,
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: '#888',
        tabBarButton: isTV ? (props) => {
          const { children, onPress, accessibilityState } = props as any;
          const routeName = props.accessibilityState?.selected ? 'index' : 'other';
          const isFocused = focusedTab === routeName;
          
          return (
            <View style={styles.tabButton}>
              <TouchableOpacity
                onFocus={() => {
                  handleTabFocus(routeName);
                }}
                onPress={onPress}
                style={[
                  styles.tabButtonInner,
                  isFocused && styles.tabButtonFocused
                ]}
                activeOpacity={1}
                hasTVPreferredFocus={isFocused}
                nextFocusUp={-1}
                nextFocusDown={-1}
                nextFocusLeft={-1}
                nextFocusRight={-1}
                accessible={true}
                accessibilityRole="button"
                accessibilityState={accessibilityState}
              >
                {children}
              </TouchableOpacity>
            </View>
          );
        } : (props: { accessibilityState?: AccessibilityState; children: ReactNode }) => (
          <View
            style={[
              styles.tabBarButton,
              props.accessibilityState?.selected && styles.tabBarButtonFocused,
            ]}
          >
            {props.children}
          </View>
        ),
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name="map-outline" 
              size={28} 
              color={focused ? '#FFD700' : color} 
            />
          ),
        }} 
      />
      <Tabs.Screen 
        name="weather" 
        options={{
          title: 'Weather',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name="weather-partly-cloudy" 
              size={28} 
              color={focused ? '#FFD700' : color} 
            />
          ),
        }} 
      />
    </Tabs>
  );
}
