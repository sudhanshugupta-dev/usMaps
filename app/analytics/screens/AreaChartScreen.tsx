import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, useTVEventHandler } from 'react-native';
import { FocusableCard } from '../components/FocusableCard';
import { lineData } from '../services/dummy_data';
import AreaChart from '../components/charts/AreaChartComponent';

const { width: screenWidth } = Dimensions.get('window');

export default function AreaChartScreen() {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const data = lineData.map(item => item.duration);
  const labels = lineData.map(item => item.day);

  const handleFocusChange = (index: number) => {
    setFocusedIndex(index);
  };

  const handleSelect = (index: number) => {
    console.log(`✅ Selected: ${labels[index]} → ${data[index]}`);
  };

  const tvEventHandler = (evt: any) => {
    if (!evt) return;

    console.log('🎮 TV Event fired:', evt.eventType);

    switch (evt.eventType) {
      case 'right':
        setFocusedIndex(prev => (prev + 1) % data.length);
        break;
      case 'left':
        setFocusedIndex(prev => (prev - 1 + data.length) % data.length);
        break;
      case 'select':
        handleSelect(focusedIndex);
        break;
      default:
        console.log('Other event:', evt.eventType);
        break;
    }
  };

  useTVEventHandler(tvEventHandler);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.header}>Active Users (Area Chart)</Text>
      <FocusableCard>
        <AreaChart
          data={data}
          labels={labels}
          focusedIndex={focusedIndex}
          onFocusChange={handleFocusChange}
          onSelect={handleSelect}
          areaColor="#ff6f61"
          highlightColor="#ff6f61"
          height={300}
        />
        <Text style={styles.valueLabel}>
          ▶ Focused: {labels[focusedIndex]} → {data[focusedIndex]}
        </Text>
      </FocusableCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  chartWrapper: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    minWidth: screenWidth - 100,
    alignSelf: 'center',
  },
  valueLabel: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 18,
    color: '#ff6f61',
    fontWeight: '600',
  },
});