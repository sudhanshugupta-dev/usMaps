import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useTVEventHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import LineChart from '../components/charts/LineChartComponent';
import { FocusableCard } from '../components/FocusableCard';
import { WeatherResponse } from '../types/weather';

export default function WeatherLineChartScreen() {
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
    current.temperature,
    current.feelslike,
    current.humidity,
    current.cloudcover,
    current.visibility * 10,
    current.uv_index * 10,
  ];
  const labels = ['Temp', 'Feels', 'Humid', 'Cloud', 'Vis', 'UV'];

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
      <Text style={styles.header}>Weather Trends</Text>
      <Text style={styles.subtitle}>Temperature & Atmospheric Conditions</Text>
      <FocusableCard>
        <LineChart
          data={data}
          labels={labels}
          focusedIndex={focusedPoint}
          onFocusChange={setFocusedPoint}
          lineColor="#4f6cff"
          highlightColor="#FFD700"
          height={400}
        />
      </FocusableCard>
      <View style={styles.navigationContainer}>
        <Text style={styles.infoText}>
          {`${labels[focusedPoint]}: ${data[focusedPoint].toFixed(1)}`}
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
  hintText: { fontSize: 14, color: '#777' },
  errorText: { fontSize: 18, color: '#ff6f61', textAlign: 'center' },
});
