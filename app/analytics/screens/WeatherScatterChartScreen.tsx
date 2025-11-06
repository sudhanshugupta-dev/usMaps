import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useTVEventHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScatterChart from '../components/charts/ScatterChartComponent';
import { FocusableCard } from '../components/FocusableCard';
import { WeatherResponse } from '../types/weather';

export default function WeatherScatterChartScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [focusedPoint, setFocusedPoint] = useState<number>(0);

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
    { x: 'N', y: current.wind_degree >= 337.5 || current.wind_degree < 22.5 ? current.wind_speed : 0 },
    { x: 'NE', y: current.wind_degree >= 22.5 && current.wind_degree < 67.5 ? current.wind_speed : 0 },
    { x: 'E', y: current.wind_degree >= 67.5 && current.wind_degree < 112.5 ? current.wind_speed : 0 },
    { x: 'SE', y: current.wind_degree >= 112.5 && current.wind_degree < 157.5 ? current.wind_speed : 0 },
    { x: 'S', y: current.wind_degree >= 157.5 && current.wind_degree < 202.5 ? current.wind_speed : 0 },
    { x: 'SW', y: current.wind_degree >= 202.5 && current.wind_degree < 247.5 ? current.wind_speed : 0 },
    { x: 'W', y: current.wind_degree >= 247.5 && current.wind_degree < 292.5 ? current.wind_speed : 0 },
    { x: 'NW', y: current.wind_degree >= 292.5 && current.wind_degree < 337.5 ? current.wind_speed : 0 },
  ];

  const tvEventHandler = (evt: any) => {
    if (!evt) return;
    switch (evt.eventType) {
      case 'right':
        setFocusedPoint(prev => (prev + 1) % data.length);
        break;
      case 'left':
        setFocusedPoint(prev => (prev - 1 + data.length) % data.length);
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
      <Text style={styles.header}>Wind Direction Analysis</Text>
      <Text style={styles.subtitle}>Speed by Compass Direction</Text>
      <FocusableCard>
        <ScatterChart
          data={data}
          focusedIndex={focusedPoint}
          onFocusChange={setFocusedPoint}
          pointColor="#999"
          highlightColor="#4f6cff"
          height={400}
        />
      </FocusableCard>
      <View style={styles.navigationContainer}>
        <Text style={styles.infoText}>
          {`${data[focusedPoint].x}: ${data[focusedPoint].y} km/h`}
        </Text>
        <Text style={styles.detailText}>
          Current Wind: {current.wind_speed} km/h {current.wind_dir} ({current.wind_degree}°)
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
