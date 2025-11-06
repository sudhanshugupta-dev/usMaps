import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, useTVEventHandler } from 'react-native';
import { FocusableCard } from '../components/FocusableCard';
import GaugeChart from '../components/charts/GaugeChartComponent';

const screenWidth = Dimensions.get('window').width;

export default function GaugeChartScreen() {
  const [value, setValue] = useState(50); // initial value 0-100

  const tvHandler = (evt: any) => {
    if (!evt) return;
    const t = evt.eventType;
    if (t === 'right') setValue(prev => Math.min(prev + 5, 100));
    else if (t === 'left') setValue(prev => Math.max(prev - 5, 0));
    else if (t === 'select') console.log('Selected value:', value);
  };
  useTVEventHandler(tvHandler);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Progress / Gauge Chart</Text>
      <FocusableCard>
        <GaugeChart
          value={value}
          maxValue={100}
          radius={100}
          strokeWidth={20}
          color="#4f6cff"
          backgroundColor="#e0e0e0"
          showValue={true}
        />
        <Text style={styles.hintText}>Use Left / Right to adjust, OK to select</Text>
      </FocusableCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderRadius: 16,
    padding: 18,
    minWidth: screenWidth - 100,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
});
