import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchWeatherData } from '../services/weatherApi';
import { WeatherResponse } from '../types/weather';
import { WeatherHeader } from '../components/WeatherHeader';
import { ChartCard } from '../components/ChartCard';
import {
  BarChart,
  LineChart,
  PieChart,
  DonutChart,
  ScatterChart,
  BubbleChart,
  GaugeChart,
} from '../components/charts';
import { PieChartData } from '../components/charts/PieChartComponent';

const { width } = Dimensions.get('window');

interface ChartItem {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  route: string;
}

const WeatherAnalytics = () => {
  const router = useRouter();
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh every 5 minutes (300000ms)
  const REFRESH_INTERVAL = 300000;

  useEffect(() => {
    // Initial load
    loadWeatherData();

    // Set up interval for background updates
    const interval = setInterval(() => {
      loadWeatherData(true); // true = background refresh
    }, REFRESH_INTERVAL);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const loadWeatherData = async (isBackgroundRefresh = false) => {
    try {
      // Only show loading spinner on initial load, not on background refresh
      if (!isBackgroundRefresh) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const data = await fetchWeatherData(); // Uses default city from weatherApi.ts
      setWeatherData(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to load weather data');
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4f6cff" />
        <Text style={styles.loadingText}>Loading Weather Data...</Text>
      </View>
    );
  }

  if (error || !weatherData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'No data available'}</Text>
      </View>
    );
  }

  const { location, current } = weatherData;

  // Prepare chart data
  const airQualityData = [
    parseFloat(current.air_quality.co),
    parseFloat(current.air_quality.no2),
    parseFloat(current.air_quality.o3),
    parseFloat(current.air_quality.so2),
    parseFloat(current.air_quality.pm2_5),
    parseFloat(current.air_quality.pm10),
  ];
  const airQualityLabels = ['CO', 'NO₂', 'O₃', 'SO₂', 'PM2.5', 'PM10'];

  const weatherTrendsData = [
    current.temperature,
    current.feelslike,
    current.humidity,
    current.cloudcover,
    current.visibility * 10,
    current.uv_index * 10,
  ];
  const weatherTrendsLabels = ['Temp', 'Feels', 'Humid', 'Cloud', 'Vis', 'UV'];

  const weatherFactorsPieData: PieChartData[] = [
    { value: current.temperature, label: 'Temp', color: '#ff6f61' },
    { value: current.humidity, label: 'Humid', color: '#4f6cff' },
    { value: current.cloudcover || 1, label: 'Cloud', color: '#8aa4ff' },
    { value: current.uv_index * 10, label: 'UV', color: '#ffa726' },
    { value: current.visibility * 10, label: 'Vis', color: '#66bb6a' },
  ];

  // Calculate day/night duration
  const sunrise = current.astro.sunrise;
  const sunset = current.astro.sunset;
  const dayDuration = 11; // Approximate hours
  const nightDuration = 13;

  const dayNightData = [
    { value: dayDuration, label: 'Day', color: '#ffd700' },
    { value: nightDuration, label: 'Night', color: '#4a5568' },
  ];

  const windScatterData = [
    { x: 'N', y: current.wind_degree >= 337.5 || current.wind_degree < 22.5 ? current.wind_speed : 0 },
    { x: 'NE', y: current.wind_degree >= 22.5 && current.wind_degree < 67.5 ? current.wind_speed : 0 },
    { x: 'E', y: current.wind_degree >= 67.5 && current.wind_degree < 112.5 ? current.wind_speed : 0 },
    { x: 'SE', y: current.wind_degree >= 112.5 && current.wind_degree < 157.5 ? current.wind_speed : 0 },
    { x: 'S', y: current.wind_degree >= 157.5 && current.wind_degree < 202.5 ? current.wind_speed : 0 },
    { x: 'SW', y: current.wind_degree >= 202.5 && current.wind_degree < 247.5 ? current.wind_speed : 0 },
    { x: 'W', y: current.wind_degree >= 247.5 && current.wind_degree < 292.5 ? current.wind_speed : 0 },
    { x: 'NW', y: current.wind_degree >= 292.5 && current.wind_degree < 337.5 ? current.wind_speed : 0 },
  ];

  const pollutantBubbleData = [
    { x: 'CO', y: parseFloat(current.air_quality.co) / 100, size: 15, label: 'CO' },
    { x: 'NO₂', y: parseFloat(current.air_quality.no2), size: 10, label: 'NO₂' },
    { x: 'O₃', y: parseFloat(current.air_quality.o3), size: 8, label: 'O₃' },
    { x: 'SO₂', y: parseFloat(current.air_quality.so2), size: 9, label: 'SO₂' },
    { x: 'PM2.5', y: parseFloat(current.air_quality.pm2_5), size: 12, label: 'PM2.5' },
    { x: 'PM10', y: parseFloat(current.air_quality.pm10), size: 14, label: 'PM10' },
  ];

  const uvGaugeValue = (current.uv_index / 11) * 100;

  const charts: ChartItem[] = [
    { id: '1', title: 'Air Quality Index', subtitle: 'Pollutant Levels', type: 'bar', route: '/analytics/screens/WeatherBarChartScreen' },
    { id: '2', title: 'Weather Trends', subtitle: 'Temperature & Conditions', type: 'line', route: '/analytics/screens/WeatherLineChartScreen' },
    { id: '3', title: 'Weather Factors', subtitle: 'Distribution', type: 'pie', route: '/analytics/screens/WeatherPieChartScreen' },
    { id: '4', title: 'Day vs Night', subtitle: 'Duration', type: 'donut', route: '/analytics/screens/WeatherDonutChartScreen' },
    { id: '5', title: 'Wind Direction', subtitle: 'Speed by Direction', type: 'scatter', route: '/analytics/screens/WeatherScatterChartScreen' },
    { id: '6', title: 'Pollutant Impact', subtitle: 'Bubble Analysis', type: 'bubble', route: '/analytics/screens/WeatherBubbleChartScreen' },
    { id: '7', title: 'UV Index', subtitle: 'Exposure Level', type: 'gauge', route: '/analytics/screens/WeatherGaugeChartScreen' },
  ];

  const renderChart = (item: ChartItem) => {
    let chartComponent;

    switch (item.type) {
      case 'bar':
        chartComponent = (
          <BarChart
            data={airQualityData}
            labels={airQualityLabels}
            focusedIndex={focusedIndex}
            onFocusChange={setFocusedIndex}
            barColor="#ff6f61"
            height={180}
          />
        );
        break;
      case 'line':
        chartComponent = (
          <LineChart
            data={weatherTrendsData}
            labels={weatherTrendsLabels}
            focusedIndex={focusedIndex}
            onFocusChange={setFocusedIndex}
            lineColor="#4f6cff"
            height={180}
          />
        );
        break;
      case 'pie':
        chartComponent = (
          <PieChart
            data={weatherFactorsPieData}
            focusedIndex={focusedIndex}
            onFocusChange={setFocusedIndex}
            height={200}
          />
        );
        break;
      case 'donut':
        chartComponent = (
          <DonutChart
            data={dayNightData}
            focusedIndex={focusedIndex}
            onFocusChange={setFocusedIndex}
            height={200}
          />
        );
        break;
      case 'scatter':
        chartComponent = (
          <ScatterChart
            data={windScatterData}
            focusedIndex={focusedIndex}
            onFocusChange={setFocusedIndex}
            height={180}
          />
        );
        break;
      case 'bubble':
        chartComponent = (
          <BubbleChart
            data={pollutantBubbleData}
            focusedIndex={focusedIndex}
            onFocusChange={setFocusedIndex}
            height={180}
          />
        );
        break;
      case 'gauge':
        chartComponent = (
          <GaugeChart
            value={uvGaugeValue}
            maxValue={100}
            radius={70}
            color="#ffa726"
          />
        );
        break;
      default:
        chartComponent = <Text>Chart not available</Text>;
    }

    return (
      <ChartCard
        title={item.title}
        subtitle={item.subtitle}
        onPress={() => {
          // Navigate to full screen with data
          router.push({
            pathname: item.route as any,
            params: { weatherData: JSON.stringify(weatherData) },
          });
        }}
      >
        {chartComponent}
      </ChartCard>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <WeatherHeader location={location} current={current} />

        <View style={styles.statusBar}>
          <Text style={styles.sectionTitle}>Analytics Dashboard</Text>
          <View style={styles.updateInfo}>
            {isRefreshing && (
              <View style={styles.refreshIndicator}>
                <ActivityIndicator size="small" color="#4f6cff" />
                <Text style={styles.refreshText}>Updating...</Text>
              </View>
            )}
            {lastUpdated && !isRefreshing && (
              <View style={styles.updateContainer}>
                <Text style={styles.lastUpdatedText}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </Text>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={() => loadWeatherData(true)}
                  focusable={true}
                >
                  <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <FlatList
          horizontal
          data={charts}
          renderItem={({ item }) => renderChart(item)}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chartList}
          snapToInterval={width * 0.4 + 20}
          decelerationRate="fast"
          scrollEnabled={true}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff6f61',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  refreshText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4f6cff',
    fontWeight: '600',
  },
  updateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  refreshButton: {
    backgroundColor: '#4f6cff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 10,
  },
  refreshButtonText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  chartList: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
});

export default WeatherAnalytics;