import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useTVEventHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import GaugeChart from '../components/charts/GaugeChartComponent';
import { FocusableCard } from '../components/FocusableCard';
import { WeatherResponse } from '../types/weather';

export default function WeatherGaugeChartScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

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
  const uvGaugeValue = (current.uv_index / 11) * 100;

  const getUVLevel = (index: number) => {
    if (index <= 2) return { level: 'Low', color: '#66bb6a' };
    if (index <= 5) return { level: 'Moderate', color: '#ffd700' };
    if (index <= 7) return { level: 'High', color: '#ffa726' };
    if (index <= 10) return { level: 'Very High', color: '#ff6f61' };
    return { level: 'Extreme', color: '#d32f2f' };
  };

  const uvInfo = getUVLevel(current.uv_index);

  const tvEventHandler = (evt: any) => {
    if (!evt) return;
    if (evt.eventType === 'back') {
      router.back();
    }
  };
  useTVEventHandler(tvEventHandler);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>UV Index</Text>
      <Text style={styles.subtitle}>Sun Exposure Level</Text>
      <FocusableCard>
        <GaugeChart
          value={uvGaugeValue}
          maxValue={100}
          radius={120}
          strokeWidth={25}
          color={uvInfo.color}
        />
        <View style={styles.gaugeInfo}>
          <Text style={styles.uvValue}>UV Index: {current.uv_index}</Text>
          <Text style={[styles.uvLevel, { color: uvInfo.color }]}>{uvInfo.level}</Text>
        </View>
      </FocusableCard>
      <View style={styles.navigationContainer}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>UV Index Scale:</Text>
          <Text style={styles.infoItem}>• 0-2: Low (Green)</Text>
          <Text style={styles.infoItem}>• 3-5: Moderate (Yellow)</Text>
          <Text style={styles.infoItem}>• 6-7: High (Orange)</Text>
          <Text style={styles.infoItem}>• 8-10: Very High (Red)</Text>
          <Text style={styles.infoItem}>• 11+: Extreme (Violet)</Text>
        </View>
        <Text style={styles.hintText}>
          Press Back to return
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
  gaugeInfo: {
    marginTop: 30,
    alignItems: 'center',
  },
  uvValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  uvLevel: {
    fontSize: 24,
    fontWeight: '600',
  },
  navigationContainer: { marginTop: 30, alignItems: 'center' },
  infoBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  infoItem: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  hintText: { fontSize: 14, color: '#777' },
  errorText: { fontSize: 18, color: '#ff6f61', textAlign: 'center' },
});
