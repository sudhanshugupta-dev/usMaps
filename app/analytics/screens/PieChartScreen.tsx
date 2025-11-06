import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  useTVEventHandler,
} from 'react-native';
import { PieChart } from 'react-native-svg-charts';
import { Text as SvgText } from 'react-native-svg';
import { pieData } from '../services/dummy_data';

const screenWidth = Dimensions.get('window').width;

// Generate a color for each slice
const generateColors = (length: number) => {
  const colors: string[] = [];
  for (let i = 0; i < length; i++) {
    colors.push(`hsl(${(i * 360) / length}, 70%, 55%)`);
  }
  return colors;
};

export default function PieChartScreen() {
  const [focusedSlice, setFocusedSlice] = useState(0);

  const colors = generateColors(pieData.length);

  // Build chart data dynamically
  const data = pieData.map((item, index) => ({
    value: item.y,
    svg: {
      fill: colors[index],
      outerRadius: focusedSlice === index ? '110%' : '100%',
      innerRadius: focusedSlice === index ? '30%' : '40%',
      stroke: focusedSlice === index ? '#FFD700' : 'transparent',
      strokeWidth: focusedSlice === index ? 3 : 0,
    },
    key: `pie-${index}`,
    label: item.x,
  }));

  // Labels in the pie chart
  const Labels = ({ slices }: any) =>
    slices.map((slice: any, index: number) => {
      const { labelCentroid, data } = slice;
      const isFocused = index === focusedSlice;
      return (
        <SvgText
          key={index}
          x={labelCentroid[0]}
          y={labelCentroid[1]}
          fill={isFocused ? '#FFD700' : '#333'}
          fontSize={isFocused ? 16 : 12}
          fontWeight={isFocused ? 'bold' : 'normal'}
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {data.label}
        </SvgText>
      );
    });

  // TV remote navigation
  const tvEventHandler = (evt: any) => {
    if (!evt) return;
    switch (evt.eventType) {
      case 'right':
        setFocusedSlice(prev => (prev + 1) % data.length);
        break;
      case 'left':
        setFocusedSlice(prev => (prev - 1 + data.length) % data.length);
        break;
      case 'select':
        console.log(`Selected: ${data[focusedSlice].label} = ${data[focusedSlice].value}`);
        break;
      default:
        break;
    }
  };
  useTVEventHandler(tvEventHandler);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Feature Usage (Pie Chart)</Text>

      <View style={styles.chartWrapper}>
        <PieChart
          style={{ height: 280, width: screenWidth - 100 }}
          data={data}
        >
          <Labels />
        </PieChart>

        <View style={styles.navigationContainer}>
          <Text style={styles.infoText}>
            {`${data[focusedSlice].label}: ${data[focusedSlice].value}`}
          </Text>
          <Text style={styles.hintText}>
            Use ← → on remote to change focus | OK to select
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  contentContainer: { padding: 20, alignItems: 'center' },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  chartWrapper: {
    borderRadius: 20,
    padding: 25,
    minWidth: screenWidth - 100,
    minHeight: 360,
    alignSelf: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
  },
  navigationContainer: { marginTop: 20, alignItems: 'center' },
  infoText: { fontSize: 18, fontWeight: 'bold', color: '#4f6cff', marginBottom: 8 },
  hintText: { fontSize: 14, color: '#888' },
});
