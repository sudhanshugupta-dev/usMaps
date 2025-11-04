import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Move dashboardCards OUTSIDE component
const dashboardCards = [
  { id: 1, title: 'Analytics', icon: 'chart-line', description: 'View detailed analytics and insights', stats: '1.2M Views', color: '#4CAF50' , navigate:'/analytics' },
  { id: 2, title: 'US Maps', icon: 'map-outline', description: 'Explore US geographical data', stats: '50 States', color: '#2196F3', navigate: '/maps' },
  { id: 3, title: 'Maps', icon: 'earth', description: 'Global mapping and navigation', stats: 'Worldwide', color: '#FF9800', navigate: '/rnmaps' },
];

// TV Remote Handler
class TVRemoteHandler {
  private eventHandler: any = null;
  private listener: ((event: any) => void) | null = null;

  enable(listener: (event: any) => void) {
    if (Platform.OS === 'ios' && Platform.isTV) {
      try {
        const { TVEventHandler } = require('react-native');
        this.eventHandler = new TVEventHandler();
        this.listener = listener;
        this.eventHandler.enable(this, listener);
      } catch (e) {
        console.warn('TVEventHandler not available');
      }
    }
  }

  disable() {
    if (this.eventHandler) {
      this.eventHandler.disable();
      this.eventHandler = null;
    }
    this.listener = null;
  }
}

const HomeScreen = () => {
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Now safe: dashboardCards is defined
  const scaleAnims = useRef(dashboardCards.map(() => new Animated.Value(1))).current;

  const scrollViewRef = useRef<ScrollView>(null);
  const tvEventHandlerRef = useRef<TVRemoteHandler | null>(null);
  const router = useRouter();

  // Animate scale for focused card
  const animateFocus = (index: number, toValue: number) => {
    Animated.spring(scaleAnims[index], {
      toValue,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleCardSelect = (index: number) => {
    const card = dashboardCards[index];
    if (card.navigate) {
      router.push(card.navigate);
    }
  };

  const handleTVRemote = (event: any) => {
    if (!event || !event.eventType) return;

    let newIndex = focusedIndex;

    switch (event.eventType) {
      case 'left':
      case 'up':
        newIndex = Math.max(0, focusedIndex - 1);
        break;
      case 'right':
      case 'down':
        newIndex = Math.min(dashboardCards.length - 1, focusedIndex + 1);
        break;
      case 'select':
      case 'playPause':
        handleCardSelect(focusedIndex);
        return;
    }

    if (newIndex !== focusedIndex) {
      setFocusedIndex(newIndex);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.isTV) {
        tvEventHandlerRef.current = new TVRemoteHandler();
        tvEventHandlerRef.current.enable(handleTVRemote);
      }

      setFocusedIndex(0);
      dashboardCards.forEach((_, i) => animateFocus(i, i === 0 ? 1.08 : 1));

      return () => {
        tvEventHandlerRef.current?.disable();
        tvEventHandlerRef.current = null;
        dashboardCards.forEach((_, i) => animateFocus(i, 1));
      };
    }, [])
  );

  useEffect(() => {
    dashboardCards.forEach((_, i) => {
      animateFocus(i, i === focusedIndex ? 1.08 : 1);
    });

    if (scrollViewRef.current && Platform.isTV) {
      const cardWidth = width * 0.4;
      const offset = focusedIndex * cardWidth - width * 0.3;
      scrollViewRef.current.scrollTo({
        x: Math.max(0, offset),
        animated: true,
      });
    }
  }, [focusedIndex]);

  const renderCard = (card: any, index: number) => {
    const isFocused = index === focusedIndex;

    return (
      <TouchableOpacity
        key={card.id}
        activeOpacity={1}
        hasTVPreferredFocus={index === 0 && Platform.isTV}
        onFocus={() => setFocusedIndex(index)}
        onPress={() => handleCardSelect(index)}
        style={styles.cardContainer}
        tvParallaxProperties={{
          magnification: 1.1,
          pressMagnification: 1.15,
          pressDuration: 150,
          pressDelay: 50,
        }}
      >
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale: scaleAnims[index] }],
              borderColor: isFocused ? card.color : 'rgba(255,255,255,0.1)',
              borderWidth: isFocused ? 4 : 2,
              shadowOpacity: isFocused ? 0.6 : 0.35,
              shadowRadius: isFocused ? 20 : 16,
              elevation: isFocused ? 16 : 10,
            },
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor: card.color }]}>
            <Icon name={card.icon} size={40} color="#FFFFFF" />
          </View>

          <Text style={styles.cardTitle}>{card.title}</Text>
          <Text style={styles.cardDescription}>{card.description}</Text>

          {isFocused && (
            <View style={[styles.focusBar, { backgroundColor: card.color }]} />
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="television" size={32} color="#FFFFFF" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>Maps and Analytics</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContent}
        style={styles.scrollView}
        focusable={false}
        scrollEnabled={!Platform.isTV} // Disable scroll on TV
      >
        {dashboardCards.map(renderCard)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 30, marginBottom: 30 },
  headerIcon: { marginRight: 15 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
  scrollView: { flex: 1 },
  horizontalScrollContent: {
    paddingHorizontal: 25,
    paddingVertical: 20,
    alignItems: 'center',
  },
  cardContainer: {
    marginHorizontal: 12,
  },
  card: {
    width: width * 0.35,
    height: height * 0.35,
    borderRadius: 20,
    backgroundColor: '#2d2d2d',
    padding: 24,
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  cardDescription: { fontSize: 16, color: '#CCCCCC', lineHeight: 22 },
  focusBar: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    width: '60%',
    height: 5,
    borderRadius: 3,
  },
});

export default HomeScreen;