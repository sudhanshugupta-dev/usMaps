import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useTVEventHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DonutChart from '../components/charts/DonutChartComponent';
import { FocusableCard } from '../components/FocusableCard';
import { WeatherResponse } from '../types/weather';

export default function WeatherDonutChartScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [focusedSlice, setFocusedSlice] = useState<number>(0);

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

  const dayDuration = 11;
  const nightDuration = 13;

  const data = [
    { value: dayDuration, label: 'Day', color: '#ffd700' },
    { value: nightDuration, label: 'Night', color: '#4a5568' },
  ];

  const tvEventHandler = (evt: any) => {
    if (!evt) return;
    switch (evt.eventType) {
      case 'right':
      case 'left':
        setFocusedSlice(prev => (prev + 1) % data.length);
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
      <Text style={styles.header}>Day vs Night Duration</Text>
      <Text style={styles.subtitle}>24-Hour Cycle</Text>
      <FocusableCard>
        <DonutChart
          data={data}
          focusedIndex={focusedSlice}
          onFocusChange={setFocusedSlice}
          height={450}
        />
      </FocusableCard>
      <View style={styles.navigationContainer}>
        <Text style={styles.infoText}>
          {`${data[focusedSlice].label}: ${data[focusedSlice].value} hours`}
        </Text>
        <Text style={styles.hintText}>
          Use ← → on remote to toggle | Back to return
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
  infoText: { fontSize: 24, fontWeight: 'bold', color: '#ffd700', marginBottom: 10 },
  hintText: { fontSize: 14, color: '#777' },
  errorText: { fontSize: 18, color: '#ff6f61', textAlign: 'center' },
});
