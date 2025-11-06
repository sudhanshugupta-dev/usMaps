import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, useTVEventHandler } from 'react-native';
import { FocusableCard } from '../components/FocusableCard';
import { scatterData } from '../services/dummy_data';
import ScatterChart from '../components/charts/ScatterChartComponent';

const screenWidth = Dimensions.get('window').width;

export default function ScatterChartScreen() {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleFocusChange = (index: number) => {
    setFocusedIndex(index);
  };

  const handleSelect = (index: number) => {
    console.log('Selected point:', scatterData[index]);
  };

  const tvHandler = (evt: any) => {
    if (!evt) return;
    const t = evt.eventType;
    console.log('🎮 TV Event:', t);
    if (t === 'right') {
      setFocusedIndex(prev => Math.min(prev + 1, scatterData.length - 1));
    } else if (t === 'left') {
      setFocusedIndex(prev => Math.max(prev - 1, 0));
    } else if (t === 'select') {
      handleSelect(focusedIndex);
    }
  };
  useTVEventHandler(tvHandler);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.header}>Engagement Scatter Plot</Text>

      <FocusableCard>
        <ScatterChart
          data={scatterData}
          focusedIndex={focusedIndex}
          onFocusChange={handleFocusChange}
          onSelect={handleSelect}
          pointColor="#999"
          highlightColor="#4f6cff"
          height={300}
        />
        <Text style={styles.valueLabel}>
          🎯 Focused: {scatterData[focusedIndex].x} → {scatterData[focusedIndex].y}
        </Text>
        <Text style={styles.hintText}>Use Left / Right on remote to move, OK to select</Text>
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
    marginBottom: 18,
    color: '#333',
    textAlign: 'center',
  },
  chartWrapper: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    minWidth: screenWidth - 100,
    alignSelf: 'center',
  },
  valueLabel: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 16,
    color: '#4f6cff',
    fontWeight: '600',
  },
  hintText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#666',
    marginTop: 6,
  },
});