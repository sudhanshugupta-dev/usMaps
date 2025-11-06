


import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FocusableCard } from '../analytics/components/FocusableCard';
import { useRouter } from 'expo-router';

export default function Analytics() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.header}>📊 Real-Time Trading Analytics Dashboard</Text>
      <Text style={styles.subHeader}>Select a visualization type to view live market data</Text>
      
      {/* Real-time Trading Screens */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Real-Time Analytics</Text>
        
        <FocusableCard onPress={() => router.push('/analytics/screens/RealtimeTradeScreen')}>
          <View style={styles.card}>
            <Text style={styles.cardIcon}>📈</Text>
            <Text style={styles.cardTitle}>Real-time Trades</Text>
            <Text style={styles.cardDescription}>Live trade feed with price & volume</Text>
          </View>
        </FocusableCard>
        
        <FocusableCard onPress={() => router.push('/analytics/screens/LineChartRealtime')}>
          <View style={styles.card}>
            <Text style={styles.cardIcon}>📉</Text>
            <Text style={styles.cardTitle}>Line Chart (Real-time)</Text>
            <Text style={styles.cardDescription}>Continuous price updates</Text>
          </View>
        </FocusableCard>
        
        <FocusableCard onPress={() => router.push('/analytics/screens/BarChartRealtime')}>
          <View style={styles.card}>
            <Text style={styles.cardIcon}>📊</Text>
            <Text style={styles.cardTitle}>Bar Chart (30s intervals)</Text>
            <Text style={styles.cardDescription}>Trade volume aggregated every 30s</Text>
          </View>
        </FocusableCard>
        
        <FocusableCard onPress={() => router.push('/analytics/screens/ScatterPlotRealtime')}>
          <View style={styles.card}>
            <Text style={styles.cardIcon}>🔵</Text>
            <Text style={styles.cardTitle}>Scatter Plot (30s intervals)</Text>
            <Text style={styles.cardDescription}>Price vs Volume correlation</Text>
          </View>
        </FocusableCard>
        
        <FocusableCard onPress={() => router.push('/analytics/screens/GaugeChartRealtime')}>
          <View style={styles.card}>
            <Text style={styles.cardIcon}>⏱️</Text>
            <Text style={styles.cardTitle}>Gauge Charts (Real-time)</Text>
            <Text style={styles.cardDescription}>Live metrics with dynamic gauges</Text>
          </View>
        </FocusableCard>
        
        <FocusableCard onPress={() => router.push('/analytics/screens/GanttChartRealtime')}>
          <View style={styles.card}>
            <Text style={styles.cardIcon}>📅</Text>
            <Text style={styles.cardTitle}>Gantt Chart (Real-time)</Text>
            <Text style={styles.cardDescription}>Trading sessions timeline view</Text>
          </View>
        </FocusableCard>
      </View>

      {/* Other Dashboards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Other Dashboards</Text>
        
        <FocusableCard onPress={() => router.push('/analytics/screens/MainScreen')}>
          <View style={styles.card}>
            <Text style={styles.cardIcon}>📊</Text>
            <Text style={styles.cardTitle}>Analytics</Text>
            <Text style={styles.cardDescription}>General analytics dashboard</Text>
          </View>
        </FocusableCard>
        
        <FocusableCard onPress={() => router.push('/analytics/screens/WeatherAnalytics')}>
          <View style={styles.card}>
            <Text style={styles.cardIcon}>🌤️</Text>
            <Text style={styles.cardTitle}>Weather Analytics</Text>
            <Text style={styles.cardDescription}>Weather data visualization</Text>
          </View>
        </FocusableCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  contentContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#fff',
  },
  subHeader: {
    fontSize: 14,
    color: '#888',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ffcc',
    marginBottom: 15,
    paddingLeft: 10,
  },
  card: {
    padding: 20,
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
});