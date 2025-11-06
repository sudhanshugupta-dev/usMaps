import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BarChart as SVCBarChart, XAxis, YAxis, Grid } from 'react-native-svg-charts';
import { Rect, Text as SvgText } from 'react-native-svg';

interface BarChartProps {
  data: number[];
  labels: string[];
  focusedIndex: number;
  onFocusChange: (index: number) => void;
  onSelect?: (index: number) => void;
  barColor?: string;
  highlightColor?: string;
  width?: number | string;
  height?: number;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  labels,
  focusedIndex,
  onFocusChange,
  onSelect,
  barColor = '#ff6f61',
  highlightColor = '#FFD700',
  width = '100%',
  height = 300,
}) => {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const barWidth = 40;

  const Labels = ({ x, y, bandwidth, data }: any) => {
    return data.map((value: number, index: number) => {
      // Only show label for focused bar to prevent overlap
      if (index !== focusedIndex) return null;
      
      // Position label above bar with better spacing
      const labelY = y(value) - 15;
      const displayValue = typeof value === 'number' ? value.toFixed(1) : value;
      
      return (
        <SvgText
          key={`label-${index}-${value}`}
          x={x(index) + bandwidth / 2}
          y={labelY}
          fontSize={16}
          fill="#fff"
          fontWeight="bold"
          alignmentBaseline="middle"
          textAnchor="middle"
          stroke="#000"
          strokeWidth={0.5}
        >
          {displayValue}
        </SvgText>
      );
    });
  };

  const FocusHighlight = ({ x, y, bandwidth, data }: any) => {
    if (focusedIndex >= data.length) return null;
    
    return (
      <Rect
        key={`highlight-${focusedIndex}`}
        x={x(focusedIndex)}
        y={y(data[focusedIndex])}
        width={bandwidth}
        height={y(0) - y(data[focusedIndex])}
        fill={`rgba(255, 215, 0, 0.2)`}
        stroke={highlightColor}
        strokeWidth={3}
        rx={6}
        ry={6}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', paddingVertical: 16, width: '100%' }}>
        <YAxis
          data={data}
          svg={{ fill: '#666', fontSize: 11 }}
          numberOfTicks={5}
          contentInset={{ top: 30, bottom: 20 }}
          formatLabel={(value: any) => typeof value === 'number' ? value.toFixed(0) : value}
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <SVCBarChart
            style={{ height, width: '100%' }}
            data={data}
            svg={{ fill: barColor }}
            contentInset={{ top: 30, bottom: 20, left: 10, right: 10 }}
            spacingInner={0.3}
            spacingOuter={0.2}
            gridMin={0}
          >
            <Grid svg={{ stroke: '#e0e0e0', strokeWidth: 0.5, opacity: 0.5 }} />
            <FocusHighlight />
            <Labels />
          </SVCBarChart>

          <XAxis
            style={{ marginTop: 10, height: 30 }}
            data={labels}
         formatLabel={(value: number) => {
  // If too many labels, skip some to avoid overlap
  const total = labels.length;

  // show every Nth label depending on density
  const step = total > 15 ? 3 : total > 10 ? 2 : 1;

  // Only show every `step` label
  if (value % step !== 0) return '';

  // Shorten label to HH:MM only (no seconds) if many points
  const label = labels[value];
  if (!label) return '';

  // Format example: "2:12" instead of "2:12:22 AM"
  return total > 10 ? label.split(':').slice(0, 2).join(':') : label;
}}
            contentInset={{ left: 10, right: 10 }}
            svg={{ fontSize: 10, fill: '#666' }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

export default BarChart;
