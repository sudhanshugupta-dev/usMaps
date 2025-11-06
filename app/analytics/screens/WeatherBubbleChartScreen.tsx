import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useTVEventHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BubbleChart from '../components/charts/BubbleChartComponent';
import { FocusableCard } from '../components/FocusableCard';
import { WeatherResponse } from '../types/weather';

export default function WeatherBubbleChartScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [focusedBubble, setFocusedBubble] = useState<number>(0);

  let weatherData: WeatherResponse | null = null;
  if (params.weatherData && typeof params.weatherData === 'string') {
    try {
      weatherData = JSON.parse(params.weatherData);
    } catch (e) {
      console.error('Failed to parse weather data', e);
    }
  }

  if (!weatherData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No weather data available</Text>
      </View>
    );
  }

  const { current } = weatherData;

  const data = [
    { x: 'CO', y: parseFloat(current.air_quality.co) / 100, size: 15, label: 'CO' },
    { x: 'NO₂', y: parseFloat(current.air_quality.no2), size: 10, label: 'NO₂' },
    { x: 'O₃', y: parseFloat(current.air_quality.o3), size: 8, label: 'O₃' },
    { x: 'SO₂', y: parseFloat(current.air_quality.so2), size: 9, label: 'SO₂' },
    { x: 'PM2.5', y: parseFloat(current.air_quality.pm2_5), size: 12, label: 'PM2.5' },
    { x: 'PM10', y: parseFloat(current.air_quality.pm10), size: 14, label: 'PM10' },
  ];

  const tvEventHandler = (evt: any) => {
    if (!evt) return;
    switch (evt.eventType) {
      case 'right':
        setFocusedBubble(prev => (prev + 1) % data.length);
        break;
      case 'left':
        setFocusedBubble(prev => (prev - 1 + data.length) % data.length);
        break;
      case 'back':
        router.back();
        break;
      default:
        break;
    }
  };
  useTVEventHandler(tvEventHandler);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Pollutant Impact Analysis</Text>
      <Text style={styles.subtitle}>Bubble size represents relative impact</Text>
      <FocusableCard>
        <BubbleChart
          data={data}
          focusedIndex={focusedBubble}
          onFocusChange={setFocusedBubble}
          bubbleColor="#8aa4ff"
          highlightColor="#4f6cff"
          height={400}
        />
      </FocusableCard>
      <View style={styles.navigationContainer}>
        <Text style={styles.infoText}>
          {`${data[focusedBubble].label}: ${data[focusedBubble].y.toFixed(2)} μg/m³`}
        </Text>
        <Text style={styles.detailText}>
          Air Quality Index: US EPA {current.air_quality['us-epa-index']} | UK DEFRA {current.air_quality['gb-defra-index']}
        </Text>
        <Text style={styles.hintText}>
          Use ← → on remote to navigate | Back to return
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  contentContainer: { padding: 20, alignItems: 'center' },
  header: { fontSize: 32, fontWeight: 'bold', marginBottom: 8, color: '#1a1a1a', textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#666', marginBottom: 20, textAlign: 'center' },
  navigationContainer: { marginTop: 30, alignItems: 'center' },
  infoText: { fontSize: 24, fontWeight: 'bold', color: '#4f6cff', marginBottom: 10 },
  detailText: { fontSize: 16, color: '#666', marginBottom: 10 },
  hintText: { fontSize: 14, color: '#777' },
  errorText: { fontSize: 18, color: '#ff6f61', textAlign: 'center' },
});
