import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  useTVEventHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BarChart from '../components/charts/BarChartComponent';
import { FocusableCard } from '../components/FocusableCard';
import { WeatherResponse } from '../types/weather';

const { width: screenWidth } = Dimensions.get('window');

export default function WeatherBarChartScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [focusedBar, setFocusedBar] = useState<number>(0);

  // Parse weather data from params
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
    parseFloat(current.air_quality.co),
    parseFloat(current.air_quality.no2),
    parseFloat(current.air_quality.o3),
    parseFloat(current.air_quality.so2),
    parseFloat(current.air_quality.pm2_5),
    parseFloat(current.air_quality.pm10),
  ];
  const labels = ['CO', 'NO₂', 'O₃', 'SO₂', 'PM2.5', 'PM10'];

  const handleFocusChange = (index: number) => {
    setFocusedBar(index);
  };

  const handleSelect = (index: number) => {
    console.log(`Selected: ${labels[index]} → ${data[index]}`);
  };

  const tvEventHandler = (evt: any) => {
    if (!evt) return;
    switch (evt.eventType) {
      case 'right':
        setFocusedBar(prev => (prev + 1) % data.length);
        break;
      case 'left':
        setFocusedBar(prev => (prev - 1 + data.length) % data.length);
        break;
      case 'select':
        handleSelect(focusedBar);
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
      <Text style={styles.header}>Air Quality Index</Text>
      <Text style={styles.subtitle}>Pollutant Levels (μg/m³)</Text>
      <FocusableCard>
        <BarChart
          data={data}
          labels={labels}
          focusedIndex={focusedBar}
          onFocusChange={handleFocusChange}
          onSelect={handleSelect}
          barColor="#ff6f61"
          highlightColor="#FFD700"
          height={400}
        />
      </FocusableCard>
      <View style={styles.navigationContainer}>
        <Text style={styles.infoText}>
          {`${labels[focusedBar]}: ${data[focusedBar].toFixed(2)} μg/m³`}
        </Text>
        <Text style={styles.hintText}>
          Use ← → on remote to change focus | OK to select | Back to return
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
