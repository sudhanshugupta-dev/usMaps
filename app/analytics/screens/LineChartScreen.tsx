import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useTVEventHandler, Dimensions } from 'react-native';
import { lineData } from '../services/dummy_data';
import LineChart from '../components/charts/LineChartComponent';
import { FocusableCard } from '../components/FocusableCard';

const { width: screenWidth } = Dimensions.get('window');

export default function LineChartScreen() {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const data = lineData.map(item => item.duration);
  const labels = lineData.map(item => item.day);

  const handleFocusChange = (index: number) => {
    setFocusedIndex(index);
  };

  const handleSelect = (index: number) => {
    console.log(`Selected: ${labels[index]} → ${data[index]}`);
  };

  const tvEventHandler = (evt: any) => {
    if (!evt) return;
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
        break;
    }
  };
  useTVEventHandler(tvEventHandler);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Session Duration (Line Chart)</Text>
      <FocusableCard>
        <LineChart
          data={data}
          labels={labels}
          focusedIndex={focusedIndex}
          onFocusChange={handleFocusChange}
          onSelect={handleSelect}
          lineColor="#ff6f61"
          highlightColor="#FFD700"
          height={300}
        />
      </FocusableCard>
      <View style={styles.navigationContainer}>
        <Text style={styles.infoText}>
          {`${labels[focusedIndex]}: ${data[focusedIndex]} min`}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  contentContainer: { padding: 20, alignItems: 'center' },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#333', textAlign: 'center' },
  chartWrapper: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 20, 
    minWidth: screenWidth - 100, 
    alignSelf: 'center' 
  },
  navigationContainer: { 
    marginTop: 20, 
    alignItems: 'center' 
  },
  infoText: { 
    fontSize: 16, 
    color: '#333' 
  },
});
