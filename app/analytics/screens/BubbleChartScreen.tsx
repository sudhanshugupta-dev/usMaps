import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, useTVEventHandler } from 'react-native';
import { FocusableCard } from '../components/FocusableCard';
import { bubbleData } from '../services/dummy_data';
import BubbleChart from '../components/charts/BubbleChartComponent';

const { width: screenWidth } = Dimensions.get('window');

export default function BubbleChartScreen() {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleFocusChange = (index: number) => {
    setFocusedIndex(index);
  };

  const handleSelect = (index: number) => {
    console.log('Selected Bubble:', bubbleData[index]);
  };

  const tvHandler = (evt: any) => {
    if (!evt) return;
    const t = evt.eventType;
    console.log('🎮 TV Event:', t);
    if (t === 'right') {
      setFocusedIndex(prev => Math.min(prev + 1, bubbleData.length - 1));
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
      <Text style={styles.header}>Performance Bubble Chart</Text>

      <FocusableCard>
        <BubbleChart
          data={bubbleData}
          focusedIndex={focusedIndex}
          onFocusChange={handleFocusChange}
          onSelect={handleSelect}
          bubbleColor="#8aa4ff"
          highlightColor="#4f6cff"
          height={320}
        />
        <Text style={styles.valueLabel}>
          🎯 Focused: {bubbleData[focusedIndex].x} → {bubbleData[focusedIndex].y} | Size:{' '}
          {bubbleData[focusedIndex].size}
        </Text>
        <Text style={styles.hintText}>Use Left / Right / OK to navigate bubbles</Text>
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