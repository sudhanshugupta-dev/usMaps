import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  useTVEventHandler,
} from 'react-native';
import { barData } from '../services/dummy_data';
import BarChart from '../components/charts/BarChartComponent';
import { FocusableCard } from '../components/FocusableCard';

const { width: screenWidth } = Dimensions.get('window');

export default function DynamicBarChart() {
  const data = barData.map(item => item.users);
  const labels = barData.map(item => item.day);
  const [focusedBar, setFocusedBar] = useState<number>(0);

  const handleFocusChange = (index: number) => {
    setFocusedBar(index);
  };

  const handleSelect = (index: number) => {
    console.log(`Selected: ${labels[index]} → ${data[index]} users`);
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
      default:
        break;
    }
  };
  useTVEventHandler(tvEventHandler);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Daily Users (Bar Chart)</Text>
      <FocusableCard>
        <BarChart
          data={data}
          labels={labels}
          focusedIndex={focusedBar}
          onFocusChange={handleFocusChange}
          onSelect={handleSelect}
          barColor="#4f6cff"
          highlightColor="#FFD700"
          height={300}
        />
      </FocusableCard>
      <View style={styles.navigationContainer}>
        <Text style={styles.infoText}>
          {`${labels[focusedBar]}: ${data[focusedBar]} users`}
        </Text>
        <Text style={styles.hintText}>
          Use ← → on remote to change focus | OK to select
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  contentContainer: { padding: 20, alignItems: 'center' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333', textAlign: 'center' },
  chartWrapper: {borderRadius: 16, padding: 20, minWidth: screenWidth - 100, alignSelf: 'center' },
  navigationContainer: { marginTop: 20, alignItems: 'center' },
  infoText: { fontSize: 20, fontWeight: 'bold', color: '#4f6cff', marginBottom: 10 },
  hintText: { fontSize: 14, color: '#777' },
});
