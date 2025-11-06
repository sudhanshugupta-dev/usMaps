import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useTVEventHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PieChart, { PieChartData } from '../components/charts/PieChartComponent';
import { FocusableCard } from '../components/FocusableCard';
import { WeatherResponse } from '../types/weather';

export default function WeatherPieChartScreen() {
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

  const { current } = weatherData;

  const data: PieChartData[] = [
    { value: current.temperature, label: 'Temp', color: '#ff6f61' },
    { value: current.humidity, label: 'Humid', color: '#4f6cff' },
    { value: current.cloudcover || 1, label: 'Cloud', color: '#8aa4ff' },
    { value: current.uv_index * 10, label: 'UV', color: '#ffa726' },
    { value: current.visibility * 10, label: 'Vis', color: '#66bb6a' },
  ];

  const tvEventHandler = (evt: any) => {
    if (!evt) return;
    switch (evt.eventType) {
      case 'right':
        setFocusedSlice(prev => (prev + 1) % data.length);
        break;
      case 'left':
        setFocusedSlice(prev => (prev - 1 + data.length) % data.length);
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
      <Text style={styles.header}>Weather Factors</Text>
      <Text style={styles.subtitle}>Distribution Analysis</Text>
      <FocusableCard>
        <PieChart
          data={data}
          focusedIndex={focusedSlice}
          onFocusChange={setFocusedSlice}
          height={450}
        />
      </FocusableCard>
      <View style={styles.navigationContainer}>
        <Text style={styles.infoText}>
          {`${data[focusedSlice].label}: ${data[focusedSlice].value.toFixed(1)}`}
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
  infoText: { fontSize: 24, fontWeight: 'bold', color: '#ff6f61', marginBottom: 10 },
  hintText: { fontSize: 14, color: '#777' },
  errorText: { fontSize: 18, color: '#ff6f61', textAlign: 'center' },
});
